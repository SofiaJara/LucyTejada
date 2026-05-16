import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, resetDb, disconnect, seedBasic, login, makeUser } from './helpers.js';
import prisma from '../src/prisma.js';

describe('inscripciones', () => {
  before(async () => { await resetDb(); });
  after(async () => { await disconnect(); });
  beforeEach(async () => { await resetDb(); });

  test('POST /api/inscripciones crea inscripción y notifica', async () => {
    const { estudiante, grupo } = await seedBasic();
    const t = await login(estudiante.correo, 'password123');
    const res = await request(app).post('/api/inscripciones')
      .set('Authorization', `Bearer ${t}`).send({ grupoId: grupo.id });
    assert.equal(res.status, 201);
    assert.equal(res.body.estado, 'activo');
    const notif = await prisma.notificacion.findFirst({
      where: { usuarioId: estudiante.id, categoria: 'academico' },
    });
    assert.ok(notif, 'debería crear notificación de confirmación');
  });

  test('inscripción duplicada en el mismo grupo es rechazada', async () => {
    const { estudiante, grupo } = await seedBasic();
    const t = await login(estudiante.correo, 'password123');
    await request(app).post('/api/inscripciones')
      .set('Authorization', `Bearer ${t}`).send({ grupoId: grupo.id });
    const r2 = await request(app).post('/api/inscripciones')
      .set('Authorization', `Bearer ${t}`).send({ grupoId: grupo.id });
    assert.equal(r2.status, 400);
    assert.match(r2.body.error, /ya estás/i);
  });

  test('grupo sin cupos pone al estudiante en lista de espera', async () => {
    const { profesor, programa, estudiante } = await seedBasic();
    const grupoLleno = await prisma.grupo.create({
      data: { nombre: 'Lleno', cupoMaximo: 1, totalClases: 5,
              horario: 'X', salon: 'Y', programaId: programa.id, profesorId: profesor.id },
    });
    const otroEst = await makeUser({ documento: 'E-otro', correo: 'otro-est@x.com', rol: 'estudiante' });
    await prisma.inscripcion.create({ data: { estudianteId: otroEst.id, grupoId: grupoLleno.id } });

    const t = await login(estudiante.correo, 'password123');
    const res = await request(app).post('/api/inscripciones')
      .set('Authorization', `Bearer ${t}`).send({ grupoId: grupoLleno.id });
    assert.equal(res.status, 201);
    assert.equal(res.body.estado, 'lista_espera');
  });

  test('GET /api/inscripciones/mias devuelve sólo las del usuario', async () => {
    const { estudiante, grupo } = await seedBasic();
    const otro = await makeUser({ documento: 'E-x', correo: 'ex@x.com', rol: 'estudiante' });
    await prisma.inscripcion.create({ data: { estudianteId: otro.id, grupoId: grupo.id } });
    await prisma.inscripcion.create({ data: { estudianteId: estudiante.id, grupoId: grupo.id } });
    const t = await login(estudiante.correo, 'password123');
    const res = await request(app).get('/api/inscripciones/mias').set('Authorization', `Bearer ${t}`);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].estudianteId, estudiante.id);
  });

  test('DELETE /api/inscripciones/:id sólo permite al dueño', async () => {
    const { estudiante, grupo } = await seedBasic();
    const otro = await makeUser({ documento: 'E-z', correo: 'z@x.com', rol: 'estudiante' });
    const ins = await prisma.inscripcion.create({ data: { estudianteId: otro.id, grupoId: grupo.id } });
    const t = await login(estudiante.correo, 'password123');
    const res = await request(app).delete(`/api/inscripciones/${ins.id}`)
      .set('Authorization', `Bearer ${t}`);
    assert.equal(res.status, 403);
  });

  test('grupo inactivo no acepta inscripción', async () => {
    const { estudiante, grupo } = await seedBasic();
    await prisma.grupo.update({ where: { id: grupo.id }, data: { activo: false } });
    const t = await login(estudiante.correo, 'password123');
    const res = await request(app).post('/api/inscripciones')
      .set('Authorization', `Bearer ${t}`).send({ grupoId: grupo.id });
    assert.equal(res.status, 400);
  });
});
