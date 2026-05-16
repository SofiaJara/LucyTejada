import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, resetDb, disconnect, seedBasic, login, makeUser } from './helpers.js';
import prisma from '../src/prisma.js';

describe('lista de espera (CAR-02)', () => {
  before(async () => { await resetDb(); });
  after(async () => { await disconnect(); });
  beforeEach(async () => { await resetDb(); });

  async function llenarYPonerEnEspera() {
    const { profesor, programa } = await seedBasic();
    const grupo = await prisma.grupo.create({
      data: { nombre: 'Cupo1', cupoMaximo: 1, totalClases: 5,
              horario: 'X', salon: 'Y', programaId: programa.id, profesorId: profesor.id },
    });
    // ocupar el único cupo
    const ocupante = await makeUser({ documento: 'E-ocup', correo: 'ocupante@x.com', rol: 'estudiante' });
    const insActiva = await prisma.inscripcion.create({
      data: { estudianteId: ocupante.id, grupoId: grupo.id, estado: 'activo' },
    });
    // dos en espera (con timestamps separados para FIFO determinista)
    const ePrimero = await makeUser({ documento: 'E-1', correo: 'e1@x.com', rol: 'estudiante' });
    const insEspera1 = await prisma.inscripcion.create({
      data: {
        estudianteId: ePrimero.id, grupoId: grupo.id, estado: 'lista_espera',
        fechaInscripcion: new Date(Date.now() - 2000),
      },
    });
    const eSegundo = await makeUser({ documento: 'E-2', correo: 'e2@x.com', rol: 'estudiante' });
    const insEspera2 = await prisma.inscripcion.create({
      data: {
        estudianteId: eSegundo.id, grupoId: grupo.id, estado: 'lista_espera',
        fechaInscripcion: new Date(Date.now() - 1000),
      },
    });
    return { grupo, ocupante, insActiva, ePrimero, insEspera1, eSegundo, insEspera2 };
  }

  test('cancelar inscripción activa promueve al primero de la lista de espera (FIFO)', async () => {
    const { ocupante, insActiva, ePrimero, insEspera1, eSegundo, insEspera2 } = await llenarYPonerEnEspera();

    const tOcupante = await login(ocupante.correo, 'password123');
    const res = await request(app)
      .delete(`/api/inscripciones/${insActiva.id}`)
      .set('Authorization', `Bearer ${tOcupante}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.promovidos.length, 1);
    assert.equal(res.body.promovidos[0].estudianteId, ePrimero.id);

    const promovido = await prisma.inscripcion.findUnique({ where: { id: insEspera1.id } });
    assert.equal(promovido.estado, 'activo');
    const aun = await prisma.inscripcion.findUnique({ where: { id: insEspera2.id } });
    assert.equal(aun.estado, 'lista_espera');

    const notif = await prisma.notificacion.findFirst({
      where: { usuarioId: ePrimero.id, titulo: { contains: 'Cupo disponible' } },
    });
    assert.ok(notif, 'debe notificarse al promovido');
  });

  test('cancelar inscripción que estaba en lista de espera NO promueve a otro', async () => {
    const { insEspera1, insEspera2 } = await llenarYPonerEnEspera();
    const ePrimero = await prisma.inscripcion.findUnique({ where: { id: insEspera1.id }, include: { estudiante: true } });
    const t = await login(ePrimero.estudiante.correo, 'password123');
    const res = await request(app)
      .delete(`/api/inscripciones/${insEspera1.id}`)
      .set('Authorization', `Bearer ${t}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.promovidos.length, 0);
    const segundo = await prisma.inscripcion.findUnique({ where: { id: insEspera2.id } });
    assert.equal(segundo.estado, 'lista_espera');
  });

  test('aumentar cupoMaximo del grupo promueve a los que caben', async () => {
    const fixture = await llenarYPonerEnEspera();
    const a = await prisma.usuario.findFirst({ where: { rol: 'admin' } });
    const tAdmin = await login(a.correo, 'password123');

    const res = await request(app)
      .put(`/api/grupos/${fixture.grupo.id}`)
      .set('Authorization', `Bearer ${tAdmin}`)
      .send({ cupoMaximo: 3 });
    assert.equal(res.status, 200);
    assert.equal(res.body.promovidos.length, 2);

    const ins1 = await prisma.inscripcion.findUnique({ where: { id: fixture.insEspera1.id } });
    const ins2 = await prisma.inscripcion.findUnique({ where: { id: fixture.insEspera2.id } });
    assert.equal(ins1.estado, 'activo');
    assert.equal(ins2.estado, 'activo');
  });

  test('GET /api/admin/lista-espera lista por grupo con cupos libres', async () => {
    await llenarYPonerEnEspera();
    const admin = await prisma.usuario.findFirst({ where: { rol: 'admin' } });
    const tAdmin = await login(admin.correo, 'password123');
    const res = await request(app).get('/api/admin/lista-espera').set('Authorization', `Bearer ${tAdmin}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 2);
    assert.equal(res.body[0].cuposLibres, 0);
  });

  test('POST /api/admin/grupos/:id/promover-espera respeta el límite', async () => {
    const fixture = await llenarYPonerEnEspera();
    // liberar cupo aumentando el cupoMaximo a 2 directamente en DB (no por la API para no auto-promover)
    await prisma.grupo.update({ where: { id: fixture.grupo.id }, data: { cupoMaximo: 4 } });
    const admin = await prisma.usuario.findFirst({ where: { rol: 'admin' } });
    const tAdmin = await login(admin.correo, 'password123');
    const res = await request(app)
      .post(`/api/admin/grupos/${fixture.grupo.id}/promover-espera`)
      .set('Authorization', `Bearer ${tAdmin}`)
      .send({ limite: 1 });
    assert.equal(res.status, 200);
    assert.equal(res.body.promovidos.length, 1);
    const ins1 = await prisma.inscripcion.findUnique({ where: { id: fixture.insEspera1.id } });
    assert.equal(ins1.estado, 'activo');
    const ins2 = await prisma.inscripcion.findUnique({ where: { id: fixture.insEspera2.id } });
    assert.equal(ins2.estado, 'lista_espera');
  });
});

describe('admin restablece contraseña (CAR-09)', () => {
  before(async () => { await resetDb(); });
  after(async () => { await disconnect(); });
  beforeEach(async () => { await resetDb(); });

  test('PUT /api/admin/usuarios/:id con contraseña notifica al usuario', async () => {
    const { admin, estudiante } = await seedBasic();
    const tAdmin = await login(admin.correo, 'password123');
    const res = await request(app)
      .put(`/api/admin/usuarios/${estudiante.id}`)
      .set('Authorization', `Bearer ${tAdmin}`)
      .send({ correo: estudiante.correo, contrasena: 'nueva-clave-1' });
    assert.equal(res.status, 200);

    const notif = await prisma.notificacion.findFirst({
      where: { usuarioId: estudiante.id, titulo: { contains: 'restablecida' } },
    });
    assert.ok(notif, 'debe notificarse el cambio de contraseña al usuario');

    // el usuario puede iniciar sesión con la nueva clave
    const t = await login(estudiante.correo, 'nueva-clave-1');
    assert.ok(t);
  });

  test('PUT /api/admin/usuarios/:id sin contraseña NO crea notificación de reset', async () => {
    const { admin, estudiante } = await seedBasic();
    const tAdmin = await login(admin.correo, 'password123');
    await request(app)
      .put(`/api/admin/usuarios/${estudiante.id}`)
      .set('Authorization', `Bearer ${tAdmin}`)
      .send({ correo: estudiante.correo, nombre: 'Nuevo' });

    const notif = await prisma.notificacion.findFirst({
      where: { usuarioId: estudiante.id, titulo: { contains: 'restablecida' } },
    });
    assert.equal(notif, null);
  });
});

describe('dashboard admin: tendencia (CAR-08)', () => {
  before(async () => { await resetDb(); });
  after(async () => { await disconnect(); });
  beforeEach(async () => { await resetDb(); });

  test('GET /api/admin/dashboard incluye tendenciaInscripciones con 6 meses', async () => {
    const { admin } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const res = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${t}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.tendenciaInscripciones));
    assert.equal(res.body.tendenciaInscripciones.length, 6);
    res.body.tendenciaInscripciones.forEach(t => {
      assert.match(t.mes, /^\d{4}-\d{2}$/);
      assert.equal(typeof t.count, 'number');
    });
  });
});
