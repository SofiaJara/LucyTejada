import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, resetDb, disconnect, seedBasic, login } from './helpers.js';
import prisma from '../src/prisma.js';
import { registrar } from '../src/bitacora.js';

describe('bitácora (CAR-11)', () => {
  before(async () => { await resetDb(); });
  after(async () => { await disconnect(); });
  beforeEach(async () => { await resetDb(); });

  test('registrar() crea entrada con datos básicos', async () => {
    await registrar({
      accion: 'login', entidad: 'usuario', entidadId: 1,
      descripcion: 'test login',
      req: { user: { id: 1, correo: 'x@x.com' }, ip: '127.0.0.1', headers: {}, socket: {} },
    });
    const all = await prisma.bitacora.findMany();
    assert.equal(all.length, 1);
    assert.equal(all[0].accion, 'login');
    assert.equal(all[0].descripcion, 'test login');
    assert.equal(all[0].usuarioCorreo, 'x@x.com');
  });

  test('CRUD de programa genera entradas de bitácora', async () => {
    const { admin } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const created = await request(app).post('/api/programas')
      .set('Authorization', `Bearer ${t}`).send({ nombre: 'Z', categoria: 'Música' });
    await request(app).put(`/api/programas/${created.body.id}`)
      .set('Authorization', `Bearer ${t}`).send({ nombre: 'Z2', categoria: 'Música' });
    await request(app).delete(`/api/programas/${created.body.id}`)
      .set('Authorization', `Bearer ${t}`);

    const acciones = await prisma.bitacora.findMany({ where: { entidad: 'programa' } });
    const tipos = acciones.map(a => a.accion).sort();
    assert.deepEqual(tipos, ['create', 'delete', 'update']);
  });

  test('POST /api/auth/logout registra bitácora de logout', async () => {
    const { admin } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const res = await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${t}`);
    assert.equal(res.status, 200);
    const logs = await prisma.bitacora.findMany({ where: { accion: 'logout' } });
    assert.equal(logs.length, 1);
    assert.equal(logs[0].usuarioCorreo, admin.correo);
  });

  test('asistencia genera bitácora al crear clase y registrar', async () => {
    const { profesor, grupo, estudiante } = await seedBasic();
    await prisma.inscripcion.create({ data: { estudianteId: estudiante.id, grupoId: grupo.id } });
    const t = await login(profesor.correo, 'password123');
    const clase = await request(app).post('/api/asistencia/clases')
      .set('Authorization', `Bearer ${t}`).send({ grupoId: grupo.id, tema: 'X' });
    await request(app).post(`/api/asistencia/clases/${clase.body.id}/registrar`)
      .set('Authorization', `Bearer ${t}`)
      .send({ asistencias: [{ estudianteId: estudiante.id, asistio: true }] });
    const claseLogs = await prisma.bitacora.findMany({ where: { entidad: 'clase' } });
    const asLogs = await prisma.bitacora.findMany({ where: { entidad: 'asistencia' } });
    assert.equal(claseLogs.length, 1);
    assert.equal(asLogs.length, 1);
  });

  test('evaluaciones genera bitácora con accion create y update', async () => {
    const { profesor, grupo, estudiante } = await seedBasic();
    await prisma.inscripcion.create({ data: { estudianteId: estudiante.id, grupoId: grupo.id } });
    const t = await login(profesor.correo, 'password123');
    const body = {
      estudianteId: estudiante.id, grupoId: grupo.id, periodo: '2026-1',
      participacion: 'Bueno', practica: 'Bueno', actitud: 'Bueno', progreso: 'Bueno',
      valoracionGeneral: 'Bueno', comentario: '',
    };
    await request(app).post('/api/evaluaciones').set('Authorization', `Bearer ${t}`).send(body);
    await request(app).post('/api/evaluaciones').set('Authorization', `Bearer ${t}`)
      .send({ ...body, valoracionGeneral: 'Excelente' });
    const logs = await prisma.bitacora.findMany({ where: { entidad: 'evaluacion' }, orderBy: { id: 'asc' } });
    assert.equal(logs.length, 2);
    assert.equal(logs[0].accion, 'create');
    assert.equal(logs[1].accion, 'update');
  });

  test('notificación masiva queda registrada en bitácora', async () => {
    const { admin, estudiante } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    await request(app).post('/api/notificaciones').set('Authorization', `Bearer ${t}`)
      .send({ usuarioIds: [estudiante.id], titulo: 'Aviso', mensaje: 'Hola', categoria: 'eventos' });
    const logs = await prisma.bitacora.findMany({ where: { entidad: 'notificacion' } });
    assert.equal(logs.length, 1);
    assert.match(logs[0].descripcion, /Aviso/);
  });
});
