import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, resetDb, disconnect, seedBasic, login } from './helpers.js';
import prisma from '../src/prisma.js';

describe('evaluaciones', () => {
  before(async () => { await resetDb(); });
  after(async () => { await disconnect(); });
  beforeEach(async () => { await resetDb(); });

  test('POST /api/evaluaciones rechaza estudiantes', async () => {
    const { estudiante, grupo } = await seedBasic();
    const t = await login(estudiante.correo, 'password123');
    const res = await request(app).post('/api/evaluaciones')
      .set('Authorization', `Bearer ${t}`)
      .send({ estudianteId: estudiante.id, grupoId: grupo.id, periodo: '2026-1' });
    assert.equal(res.status, 403);
  });

  test('profesor crea evaluación y se notifica al estudiante', async () => {
    const { profesor, estudiante, grupo } = await seedBasic();
    const t = await login(profesor.correo, 'password123');
    const res = await request(app).post('/api/evaluaciones')
      .set('Authorization', `Bearer ${t}`)
      .send({
        estudianteId: estudiante.id, grupoId: grupo.id, periodo: '2026-1',
        participacion: 'Bueno', practica: 'Bueno', actitud: 'Bueno',
        progreso: 'Bueno', valoracionGeneral: 'Bueno', comentario: 'ok',
      });
    assert.equal(res.status, 201);
    assert.equal(res.body.valoracionGeneral, 'Bueno');

    const notifs = await prisma.notificacion.findMany({
      where: { usuarioId: estudiante.id, categoria: 'academico' },
    });
    assert.ok(notifs.length >= 1);
  });

  test('reenviar misma evaluación actualiza (upsert) y no duplica', async () => {
    const { profesor, estudiante, grupo } = await seedBasic();
    const t = await login(profesor.correo, 'password123');
    const payload = {
      estudianteId: estudiante.id, grupoId: grupo.id, periodo: '2026-1',
      participacion: 'Bueno', practica: 'Bueno', actitud: 'Bueno',
      progreso: 'Bueno', valoracionGeneral: 'Bueno',
    };
    await request(app).post('/api/evaluaciones').set('Authorization', `Bearer ${t}`).send(payload);
    await request(app).post('/api/evaluaciones').set('Authorization', `Bearer ${t}`)
      .send({ ...payload, valoracionGeneral: 'Excelente' });
    const list = await prisma.evaluacion.findMany({
      where: { estudianteId: estudiante.id, grupoId: grupo.id, periodo: '2026-1' },
    });
    assert.equal(list.length, 1);
    assert.equal(list[0].valoracionGeneral, 'Excelente');
  });

  test('GET /api/evaluaciones/mias devuelve sólo las del estudiante autenticado', async () => {
    const { profesor, estudiante, grupo } = await seedBasic();
    await prisma.evaluacion.create({
      data: {
        estudianteId: estudiante.id, profesorId: profesor.id, grupoId: grupo.id,
        periodo: '2026-1', participacion: 'B', practica: 'B', actitud: 'B', progreso: 'B', valoracionGeneral: 'Bueno',
      },
    });
    const t = await login(estudiante.correo, 'password123');
    const res = await request(app).get('/api/evaluaciones/mias').set('Authorization', `Bearer ${t}`);
    assert.equal(res.body.length, 1);
  });

  test('POST /api/evaluaciones valida payload mínimo', async () => {
    const { profesor } = await seedBasic();
    const t = await login(profesor.correo, 'password123');
    const res = await request(app).post('/api/evaluaciones')
      .set('Authorization', `Bearer ${t}`).send({ periodo: '2026-1' });
    assert.equal(res.status, 400);
  });
});
