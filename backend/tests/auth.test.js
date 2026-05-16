import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, resetDb, disconnect, makeUser } from './helpers.js';

describe('auth', () => {
  before(async () => { await resetDb(); });
  after(async () => { await disconnect(); });
  beforeEach(async () => { await resetDb(); });

  test('POST /api/auth/register crea usuario y devuelve token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      documento: '99999', nombre: 'Nuevo', apellido: 'Usuario',
      correo: 'nuevo@test.local', contrasena: 'secret123',
    });
    assert.equal(res.status, 201);
    assert.ok(res.body.token);
    assert.equal(res.body.user.correo, 'nuevo@test.local');
    assert.equal(res.body.user.rol, 'estudiante');
    assert.equal(res.body.user.contrasena, undefined);
  });

  test('POST /api/auth/register rechaza datos incompletos', async () => {
    const res = await request(app).post('/api/auth/register').send({ correo: 'x@x.com' });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /obligatorios/i);
  });

  test('POST /api/auth/register rechaza contraseña corta', async () => {
    const res = await request(app).post('/api/auth/register').send({
      documento: '88', nombre: 'A', apellido: 'B',
      correo: 'corta@x.com', contrasena: '123',
    });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /contraseña/i);
  });

  test('POST /api/auth/register rechaza correo duplicado', async () => {
    await makeUser({ documento: 'd1', correo: 'dup@x.com' });
    const res = await request(app).post('/api/auth/register').send({
      documento: 'd2', nombre: 'N', apellido: 'A',
      correo: 'dup@x.com', contrasena: 'password',
    });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /correo/i);
  });

  test('POST /api/auth/login devuelve token con credenciales válidas', async () => {
    await makeUser({ documento: 'l1', correo: 'login@x.com', contrasena: 'pwpwpw' });
    const res = await request(app).post('/api/auth/login').send({
      correo: 'login@x.com', contrasena: 'pwpwpw',
    });
    assert.equal(res.status, 200);
    assert.ok(res.body.token);
  });

  test('POST /api/auth/login rechaza credenciales malas', async () => {
    await makeUser({ documento: 'l2', correo: 'login2@x.com', contrasena: 'pwpwpw' });
    const r1 = await request(app).post('/api/auth/login').send({ correo: 'login2@x.com', contrasena: 'WRONG' });
    assert.equal(r1.status, 401);
    const r2 = await request(app).post('/api/auth/login').send({ correo: 'noexiste@x.com', contrasena: 'pwpwpw' });
    assert.equal(r2.status, 401);
  });

  test('POST /api/auth/login rechaza usuario inactivo', async () => {
    await makeUser({ documento: 'l3', correo: 'inactive@x.com', contrasena: 'pwpwpw', activo: false });
    const res = await request(app).post('/api/auth/login').send({ correo: 'inactive@x.com', contrasena: 'pwpwpw' });
    assert.equal(res.status, 403);
  });

  test('GET /api/auth/me devuelve usuario con token', async () => {
    await makeUser({ documento: 'l4', correo: 'me@x.com', contrasena: 'pwpwpw' });
    const login = await request(app).post('/api/auth/login').send({ correo: 'me@x.com', contrasena: 'pwpwpw' });
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${login.body.token}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.user.correo, 'me@x.com');
  });

  test('GET /api/auth/me rechaza sin token', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.equal(res.status, 401);
  });

  test('login registra entrada en bitácora', async () => {
    const u = await makeUser({ documento: 'l5', correo: 'bit@x.com', contrasena: 'pwpwpw' });
    await request(app).post('/api/auth/login').send({ correo: 'bit@x.com', contrasena: 'pwpwpw' });
    const { default: prisma } = await import('../src/prisma.js');
    const log = await prisma.bitacora.findFirst({ where: { usuarioId: u.id, accion: 'login' } });
    assert.ok(log, 'debería existir un registro de login en bitácora');
  });

  test('POST /api/auth/solicitar-reset notifica a admins cuando el correo existe', async () => {
    const admin = await makeUser({ documento: 'rA', correo: 'reset-admin@x.com', rol: 'admin' });
    const user = await makeUser({ documento: 'rU', correo: 'olvido@x.com' });
    const res = await request(app).post('/api/auth/solicitar-reset').send({ correo: 'olvido@x.com' });
    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);

    const { default: prisma } = await import('../src/prisma.js');
    const notifs = await prisma.notificacion.findMany({ where: { usuarioId: admin.id } });
    assert.equal(notifs.length, 1);
    assert.match(notifs[0].titulo, /restablecimiento/i);
    assert.match(notifs[0].mensaje, /olvido@x.com/);

    const bit = await prisma.bitacora.findFirst({ where: { entidad: 'reset_solicitud', entidadId: user.id } });
    assert.ok(bit, 'la solicitud debe quedar en bitácora');
  });

  test('POST /api/auth/solicitar-reset no filtra existencia para correos desconocidos', async () => {
    await makeUser({ documento: 'rA2', correo: 'reset-admin2@x.com', rol: 'admin' });
    const res = await request(app).post('/api/auth/solicitar-reset').send({ correo: 'desconocido@x.com' });
    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    const { default: prisma } = await import('../src/prisma.js');
    const notifs = await prisma.notificacion.findMany();
    assert.equal(notifs.length, 0, 'no debe crear notificación para correos que no existen');
  });

  test('POST /api/auth/solicitar-reset valida que se envíe un correo', async () => {
    const res = await request(app).post('/api/auth/solicitar-reset').send({});
    assert.equal(res.status, 400);
  });
});
