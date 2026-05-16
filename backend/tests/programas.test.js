import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, resetDb, disconnect, seedBasic, login } from './helpers.js';

describe('programas (CRUD)', () => {
  before(async () => { await resetDb(); });
  after(async () => { await disconnect(); });
  beforeEach(async () => { await resetDb(); });

  test('GET /api/programas es público y lista los activos', async () => {
    await seedBasic();
    const res = await request(app).get('/api/programas');
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].nombre, 'Piano básico');
  });

  test('GET /api/programas?busqueda filtra por nombre', async () => {
    await seedBasic();
    const r1 = await request(app).get('/api/programas?busqueda=piano');
    assert.equal(r1.body.length, 1);
    const r2 = await request(app).get('/api/programas?busqueda=guitarra');
    assert.equal(r2.body.length, 0);
  });

  test('POST /api/programas requiere rol admin', async () => {
    const { estudiante } = await seedBasic();
    const t = await login(estudiante.correo, 'password123');
    const res = await request(app).post('/api/programas')
      .set('Authorization', `Bearer ${t}`)
      .send({ nombre: 'X', categoria: 'Música' });
    assert.equal(res.status, 403);
  });

  test('POST /api/programas crea un programa', async () => {
    const { admin } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const res = await request(app).post('/api/programas')
      .set('Authorization', `Bearer ${t}`)
      .send({ nombre: 'Cello', categoria: 'Música' });
    assert.equal(res.status, 201);
    assert.equal(res.body.nombre, 'Cello');
  });

  test('POST /api/programas valida campos requeridos', async () => {
    const { admin } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const res = await request(app).post('/api/programas')
      .set('Authorization', `Bearer ${t}`).send({ nombre: 'sólo nombre' });
    assert.equal(res.status, 400);
  });

  test('PUT /api/programas/:id actualiza programa', async () => {
    const { admin, programa } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const res = await request(app).put(`/api/programas/${programa.id}`)
      .set('Authorization', `Bearer ${t}`)
      .send({ nombre: 'Piano avanzado', categoria: 'Música' });
    assert.equal(res.status, 200);
    assert.equal(res.body.nombre, 'Piano avanzado');
  });

  test('DELETE /api/programas/:id desactiva (soft delete)', async () => {
    const { admin, programa } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const res = await request(app).delete(`/api/programas/${programa.id}`)
      .set('Authorization', `Bearer ${t}`);
    assert.equal(res.status, 200);
    const list = await request(app).get('/api/programas');
    assert.equal(list.body.length, 0);
  });

  test('GET /api/programas/:id devuelve programa con grupos', async () => {
    const { programa } = await seedBasic();
    const res = await request(app).get(`/api/programas/${programa.id}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.grupos.length, 1);
  });

  test('GET /api/programas/:id devuelve 404 si no existe', async () => {
    const res = await request(app).get('/api/programas/99999');
    assert.equal(res.status, 404);
  });
});
