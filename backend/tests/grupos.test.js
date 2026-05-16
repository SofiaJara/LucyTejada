import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, resetDb, disconnect, seedBasic, login, makeUser } from './helpers.js';
import prisma from '../src/prisma.js';

describe('grupos', () => {
  before(async () => { await resetDb(); });
  after(async () => { await disconnect(); });
  beforeEach(async () => { await resetDb(); });

  test('GET /api/grupos requiere autenticación', async () => {
    const res = await request(app).get('/api/grupos');
    assert.equal(res.status, 401);
  });

  test('GET /api/grupos como profesor sólo trae sus grupos', async () => {
    const { profesor, programa } = await seedBasic();
    const otroProf = await makeUser({ documento: 'P-OTRO', correo: 'otro@x.com', rol: 'profesor' });
    await prisma.grupo.create({
      data: { nombre: 'Grupo Z', cupoMaximo: 5, totalClases: 5, horario: 'X', salon: 'Y',
              programaId: programa.id, profesorId: otroProf.id },
    });
    const t = await login(profesor.correo, 'password123');
    const res = await request(app).get('/api/grupos').set('Authorization', `Bearer ${t}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].profesorId, profesor.id);
  });

  test('POST /api/grupos crea grupo (admin)', async () => {
    const { admin, programa, profesor } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const res = await request(app).post('/api/grupos')
      .set('Authorization', `Bearer ${t}`)
      .send({ nombre: 'Grupo B', programaId: programa.id, profesorId: profesor.id, horario: 'Vie', salon: 'S2' });
    assert.equal(res.status, 201);
    assert.equal(res.body.nombre, 'Grupo B');
  });

  test('POST /api/grupos rechaza sin programa', async () => {
    const { admin } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const res = await request(app).post('/api/grupos')
      .set('Authorization', `Bearer ${t}`).send({ nombre: 'X' });
    assert.equal(res.status, 400);
  });

  test('PUT /api/grupos/:id cambia horario y notifica a estudiantes inscritos', async () => {
    const { admin, grupo, estudiante } = await seedBasic();
    await prisma.inscripcion.create({ data: { estudianteId: estudiante.id, grupoId: grupo.id } });
    const t = await login(admin.correo, 'password123');
    const res = await request(app).put(`/api/grupos/${grupo.id}`)
      .set('Authorization', `Bearer ${t}`)
      .send({ horario: 'Mar 9am', salon: grupo.salon, nombre: grupo.nombre });
    assert.equal(res.status, 200);
    const notifs = await prisma.notificacion.findMany({ where: { usuarioId: estudiante.id, categoria: 'horarios' } });
    assert.ok(notifs.length >= 1, 'estudiante debería recibir notificación de cambio');
  });

  test('DELETE /api/grupos/:id desactiva y notifica', async () => {
    const { admin, grupo, estudiante } = await seedBasic();
    await prisma.inscripcion.create({ data: { estudianteId: estudiante.id, grupoId: grupo.id } });
    const t = await login(admin.correo, 'password123');
    const res = await request(app).delete(`/api/grupos/${grupo.id}`).set('Authorization', `Bearer ${t}`);
    assert.equal(res.status, 200);
    const reread = await prisma.grupo.findUnique({ where: { id: grupo.id } });
    assert.equal(reread.activo, false);
    const notif = await prisma.notificacion.findFirst({
      where: { usuarioId: estudiante.id, categoria: 'administrativo' },
    });
    assert.ok(notif);
  });

  test('GET /api/grupos?incluirInactivos=true sólo aplica para admins', async () => {
    const { admin, profesor, grupo } = await seedBasic();
    await prisma.grupo.update({ where: { id: grupo.id }, data: { activo: false } });

    const tAdmin = await login(admin.correo, 'password123');
    const adminAll = await request(app).get('/api/grupos?incluirInactivos=true').set('Authorization', `Bearer ${tAdmin}`);
    assert.equal(adminAll.status, 200);
    assert.equal(adminAll.body.length, 1);
    assert.equal(adminAll.body[0].activo, false);

    const adminActivos = await request(app).get('/api/grupos').set('Authorization', `Bearer ${tAdmin}`);
    assert.equal(adminActivos.body.length, 0);

    // El profesor no debería ver inactivos aunque pase el flag
    const tProf = await login(profesor.correo, 'password123');
    const profAll = await request(app).get('/api/grupos?incluirInactivos=true').set('Authorization', `Bearer ${tProf}`);
    assert.equal(profAll.body.length, 0);
  });
});
