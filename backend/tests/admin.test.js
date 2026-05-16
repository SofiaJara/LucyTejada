import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, resetDb, disconnect, seedBasic, login, makeUser } from './helpers.js';
import prisma from '../src/prisma.js';

describe('admin', () => {
  before(async () => { await resetDb(); });
  after(async () => { await disconnect(); });
  beforeEach(async () => { await resetDb(); });

  test('todos los endpoints /api/admin requieren rol admin', async () => {
    const { profesor } = await seedBasic();
    const t = await login(profesor.correo, 'password123');
    const res = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${t}`);
    assert.equal(res.status, 403);
  });

  test('GET /api/admin/dashboard devuelve métricas', async () => {
    const { admin } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const res = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${t}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.totalEstudiantes, 1);
    assert.equal(res.body.totalProfesores, 1);
    assert.equal(res.body.totalProgramas, 1);
    assert.equal(res.body.totalGrupos, 1);
    assert.ok(Array.isArray(res.body.generos));
  });

  test('GET /api/admin/usuarios filtra por rol y búsqueda', async () => {
    const { admin } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const r1 = await request(app).get('/api/admin/usuarios?rol=estudiante').set('Authorization', `Bearer ${t}`);
    assert.equal(r1.body.length, 1);
    assert.equal(r1.body[0].rol, 'estudiante');
    const r2 = await request(app).get('/api/admin/usuarios?busqueda=eva').set('Authorization', `Bearer ${t}`);
    assert.ok(r2.body.find(u => u.nombre === 'Eva'));
  });

  test('GET /api/admin/usuarios filtra por género/ciudad/barrio (CAR-10)', async () => {
    const { admin } = await seedBasic();
    await makeUser({
      documento: 'F-1', correo: 'fem@x.com', rol: 'estudiante',
      genero: 'Femenino', ciudad: 'Cali', barrio: 'San Fernando',
    });
    const t = await login(admin.correo, 'password123');
    const rGen = await request(app).get('/api/admin/usuarios?genero=Femenino').set('Authorization', `Bearer ${t}`);
    assert.ok(rGen.body.every(u => u.genero === 'Femenino'));
    const rCity = await request(app).get('/api/admin/usuarios?ciudad=Cali').set('Authorization', `Bearer ${t}`);
    assert.ok(rCity.body.every(u => /Cali/i.test(u.ciudad)));
  });

  test('POST /api/admin/usuarios crea usuario y rechaza correo duplicado', async () => {
    const { admin } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const ok = await request(app).post('/api/admin/usuarios').set('Authorization', `Bearer ${t}`)
      .send({ documento: 'N-1', nombre: 'N', apellido: 'A', correo: 'nuevo@x.com',
              contrasena: 'pwpwpw', rol: 'estudiante' });
    assert.equal(ok.status, 201);
    const dup = await request(app).post('/api/admin/usuarios').set('Authorization', `Bearer ${t}`)
      .send({ documento: 'N-2', nombre: 'N', apellido: 'A', correo: 'nuevo@x.com',
              contrasena: 'pwpwpw', rol: 'estudiante' });
    assert.equal(dup.status, 400);
  });

  test('PUT /api/admin/usuarios/:id actualiza y DELETE desactiva', async () => {
    const { admin, estudiante } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const upd = await request(app).put(`/api/admin/usuarios/${estudiante.id}`)
      .set('Authorization', `Bearer ${t}`).send({ telefono: '999', nombre: estudiante.nombre, apellido: estudiante.apellido, correo: estudiante.correo, rol: estudiante.rol, documento: estudiante.documento, activo: true });
    assert.equal(upd.status, 200);
    assert.equal(upd.body.telefono, '999');
    const del = await request(app).delete(`/api/admin/usuarios/${estudiante.id}`).set('Authorization', `Bearer ${t}`);
    assert.equal(del.status, 200);
    const reread = await prisma.usuario.findUnique({ where: { id: estudiante.id } });
    assert.equal(reread.activo, false);
  });

  test('GET /api/admin/reportes/* devuelve estructuras correctas', async () => {
    const { admin } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const r1 = await request(app).get('/api/admin/reportes/asistencia').set('Authorization', `Bearer ${t}`);
    assert.equal(r1.status, 200);
    assert.ok(Array.isArray(r1.body));
    const r2 = await request(app).get('/api/admin/reportes/inscripciones').set('Authorization', `Bearer ${t}`);
    assert.ok(r2.body.every(x => 'totalInscripciones' in x));
    const r3 = await request(app).get('/api/admin/reportes/evaluaciones').set('Authorization', `Bearer ${t}`);
    assert.ok(Array.isArray(r3.body));
  });

  test('GET /api/admin/reportes/asistencia filtra por profesor (CAR-04)', async () => {
    const { admin, profesor, programa } = await seedBasic();
    const otroProf = await makeUser({ documento: 'P-OTRO', correo: 'otroprof@x.com', rol: 'profesor' });
    await prisma.grupo.create({
      data: { nombre: 'Grupo X', cupoMaximo: 5, totalClases: 5,
              horario: 'X', salon: 'Y', programaId: programa.id, profesorId: otroProf.id },
    });
    const t = await login(admin.correo, 'password123');
    const rTodos = await request(app).get('/api/admin/reportes/asistencia').set('Authorization', `Bearer ${t}`);
    assert.ok(rTodos.body.length >= 2);
    const rProf = await request(app).get(`/api/admin/reportes/asistencia?profesorId=${profesor.id}`).set('Authorization', `Bearer ${t}`);
    assert.ok(rProf.body.every(g => g.profesor.includes(profesor.nombre)));
  });

  test('GET /api/admin/reportes/demografia agrupa por género/ciudad/barrio/edad (CAR-08)', async () => {
    const { admin } = await seedBasic();
    await makeUser({ documento: 'D-1', correo: 'd1@x.com', rol: 'estudiante', genero: 'Femenino', ciudad: 'Cali', barrio: 'A' });
    await makeUser({ documento: 'D-2', correo: 'd2@x.com', rol: 'estudiante', genero: 'Femenino', ciudad: 'Cali', barrio: 'B' });
    const t = await login(admin.correo, 'password123');
    const res = await request(app).get('/api/admin/reportes/demografia').set('Authorization', `Bearer ${t}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.totalEstudiantes, 3);
    assert.ok(res.body.porGenero.some(g => g.valor === 'Femenino' && g.total === 2));
    assert.ok(res.body.porCiudad.some(c => c.valor === 'Cali' && c.total === 2));
    assert.ok(Array.isArray(res.body.porEdad));
  });

  test('GET /api/admin/usuarios filtra por grupoId (CAR-10)', async () => {
    const { admin, estudiante, grupo } = await seedBasic();
    await prisma.inscripcion.create({ data: { estudianteId: estudiante.id, grupoId: grupo.id } });
    const otroEst = await makeUser({ documento: 'O-1', correo: 'o1@x.com', rol: 'estudiante' });
    const t = await login(admin.correo, 'password123');
    const res = await request(app).get(`/api/admin/usuarios?grupoId=${grupo.id}`).set('Authorization', `Bearer ${t}`);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].id, estudiante.id);
  });

  test('POST /api/admin/inscripciones permite al admin inscribir manualmente', async () => {
    const { admin, estudiante, grupo } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const res = await request(app).post('/api/admin/inscripciones')
      .set('Authorization', `Bearer ${t}`)
      .send({ estudianteId: estudiante.id, grupoId: grupo.id });
    assert.equal(res.status, 201);
    const ins = await prisma.inscripcion.findFirst({ where: { estudianteId: estudiante.id, grupoId: grupo.id } });
    assert.ok(ins);
    const notif = await prisma.notificacion.findFirst({ where: { usuarioId: estudiante.id, categoria: 'academico' } });
    assert.ok(notif, 'debe notificar al estudiante');
  });

  test('POST /api/admin/inscripciones bloquea grupos paralelos del mismo programa', async () => {
    const { admin, estudiante, profesor, programa, grupo } = await seedBasic();
    const grupoB = await prisma.grupo.create({
      data: { nombre: 'Grupo B', cupoMaximo: 5, totalClases: 5,
              horario: 'X', salon: 'Y', programaId: programa.id, profesorId: profesor.id },
    });
    await prisma.inscripcion.create({ data: { estudianteId: estudiante.id, grupoId: grupo.id } });
    const t = await login(admin.correo, 'password123');
    const res = await request(app).post('/api/admin/inscripciones')
      .set('Authorization', `Bearer ${t}`)
      .send({ estudianteId: estudiante.id, grupoId: grupoB.id });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /otro grupo/i);
  });

  test('GET /api/admin/usuarios filtra por activo/inactivo (CAR-10)', async () => {
    const { admin } = await seedBasic();
    await makeUser({ documento: 'INA-1', correo: 'inactivo@x.com', rol: 'estudiante', activo: false });
    const t = await login(admin.correo, 'password123');
    const rActivos = await request(app).get('/api/admin/usuarios?activo=true').set('Authorization', `Bearer ${t}`);
    assert.ok(rActivos.body.every(u => u.activo === true));
    assert.ok(!rActivos.body.find(u => u.correo === 'inactivo@x.com'));
    const rInactivos = await request(app).get('/api/admin/usuarios?activo=false').set('Authorization', `Bearer ${t}`);
    assert.equal(rInactivos.body.length, 1);
    assert.equal(rInactivos.body[0].correo, 'inactivo@x.com');
  });

  test('GET /api/admin/bitacora filtra por acción/entidad/fecha', async () => {
    const { admin } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    await prisma.bitacora.createMany({
      data: [
        { accion: 'login', entidad: 'usuario', descripcion: 'login admin' },
        { accion: 'create', entidad: 'programa', descripcion: 'prog X' },
      ],
    });
    const r1 = await request(app).get('/api/admin/bitacora?accion=login').set('Authorization', `Bearer ${t}`);
    assert.ok(r1.body.every(b => b.accion === 'login'));
    const r2 = await request(app).get('/api/admin/bitacora?entidad=programa').set('Authorization', `Bearer ${t}`);
    assert.ok(r2.body.every(b => b.entidad === 'programa'));
  });
});
