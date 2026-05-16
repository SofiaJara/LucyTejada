import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, resetDb, disconnect, makeUser, login } from './helpers.js';

describe('middleware de autenticación y roles', () => {
  before(async () => { await resetDb(); });
  after(async () => { await disconnect(); });
  beforeEach(async () => { await resetDb(); });

  test('endpoint protegido rechaza sin Authorization', async () => {
    const res = await request(app).get('/api/users/me/perfil');
    assert.equal(res.status, 401);
  });

  test('endpoint protegido rechaza token inválido', async () => {
    const res = await request(app)
      .get('/api/users/me/perfil')
      .set('Authorization', 'Bearer not-a-real-token');
    assert.equal(res.status, 401);
  });

  test('endpoint protegido acepta token válido', async () => {
    await makeUser({ documento: 'm1', correo: 'mid@x.com', contrasena: 'pwpwpw' });
    const token = await login('mid@x.com', 'pwpwpw');
    const res = await request(app).get('/api/users/me/perfil').set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 200);
  });

  test('requireRole bloquea rol no autorizado', async () => {
    await makeUser({ documento: 'm2', correo: 'est@x.com', contrasena: 'pwpwpw', rol: 'estudiante' });
    const token = await login('est@x.com', 'pwpwpw');
    const res = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 403);
  });

  test('requireRole admite cualquiera de los roles permitidos', async () => {
    await makeUser({ documento: 'm3', correo: 'prof@x.com', contrasena: 'pwpwpw', rol: 'profesor' });
    const token = await login('prof@x.com', 'pwpwpw');
    const res = await request(app).get('/api/users/estudiantes').set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 200);
  });

  test('GET /api/health responde sin auth', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
  });
});
