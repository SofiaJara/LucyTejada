import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, resetDb, disconnect, seedBasic, login } from './helpers.js';
import prisma from '../src/prisma.js';

describe('asistencia', () => {
  before(async () => { await resetDb(); });
  after(async () => { await disconnect(); });
  beforeEach(async () => { await resetDb(); });

  test('POST /api/asistencia/clases requiere rol profesor o admin', async () => {
    const { estudiante, grupo } = await seedBasic();
    const t = await login(estudiante.correo, 'password123');
    const res = await request(app).post('/api/asistencia/clases')
      .set('Authorization', `Bearer ${t}`).send({ grupoId: grupo.id });
    assert.equal(res.status, 403);
  });

  test('flujo completo: crear clase, registrar asistencia, leer resumen', async () => {
    const { profesor, grupo, estudiante } = await seedBasic();
    await prisma.inscripcion.create({ data: { estudianteId: estudiante.id, grupoId: grupo.id } });
    const t = await login(profesor.correo, 'password123');

    const claseRes = await request(app).post('/api/asistencia/clases')
      .set('Authorization', `Bearer ${t}`)
      .send({ grupoId: grupo.id, tema: 'Tema 1' });
    assert.equal(claseRes.status, 201);
    const claseId = claseRes.body.id;

    const reg = await request(app).post(`/api/asistencia/clases/${claseId}/registrar`)
      .set('Authorization', `Bearer ${t}`)
      .send({ asistencias: [{ estudianteId: estudiante.id, asistio: true, observacion: 'puntual' }] });
    assert.equal(reg.status, 200);
    assert.equal(reg.body.registradas, 1);

    const resumen = await request(app).get(`/api/asistencia/estudiante/${estudiante.id}/resumen`)
      .set('Authorization', `Bearer ${t}`);
    assert.equal(resumen.status, 200);
    assert.equal(resumen.body.total, 1);
    assert.equal(resumen.body.presentes, 1);
    assert.equal(resumen.body.porcentaje, 100);
  });

  test('registrar asistencia es idempotente (upsert)', async () => {
    const { profesor, grupo, estudiante } = await seedBasic();
    await prisma.inscripcion.create({ data: { estudianteId: estudiante.id, grupoId: grupo.id } });
    const t = await login(profesor.correo, 'password123');
    const clase = await request(app).post('/api/asistencia/clases')
      .set('Authorization', `Bearer ${t}`).send({ grupoId: grupo.id });
    const id = clase.body.id;

    await request(app).post(`/api/asistencia/clases/${id}/registrar`)
      .set('Authorization', `Bearer ${t}`)
      .send({ asistencias: [{ estudianteId: estudiante.id, asistio: false }] });
    await request(app).post(`/api/asistencia/clases/${id}/registrar`)
      .set('Authorization', `Bearer ${t}`)
      .send({ asistencias: [{ estudianteId: estudiante.id, asistio: true, observacion: 'corregido' }] });

    const list = await prisma.asistencia.findMany({ where: { claseId: id } });
    assert.equal(list.length, 1);
    assert.equal(list[0].asistio, true);
    assert.equal(list[0].observacion, 'corregido');
  });

  test('registrar asistencia valida payload', async () => {
    const { profesor, grupo } = await seedBasic();
    const t = await login(profesor.correo, 'password123');
    const clase = await request(app).post('/api/asistencia/clases')
      .set('Authorization', `Bearer ${t}`).send({ grupoId: grupo.id });
    const res = await request(app).post(`/api/asistencia/clases/${clase.body.id}/registrar`)
      .set('Authorization', `Bearer ${t}`).send({ asistencias: 'malformado' });
    assert.equal(res.status, 400);
  });
});
