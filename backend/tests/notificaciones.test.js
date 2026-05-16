import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, resetDb, disconnect, seedBasic, login } from './helpers.js';
import prisma from '../src/prisma.js';

describe('notificaciones', () => {
  before(async () => { await resetDb(); });
  after(async () => { await disconnect(); });
  beforeEach(async () => { await resetDb(); });

  test('GET /api/notificaciones devuelve las del usuario', async () => {
    const { estudiante } = await seedBasic();
    await prisma.notificacion.create({ data: { usuarioId: estudiante.id, titulo: 'A', mensaje: 'm', categoria: 'sistema' } });
    const t = await login(estudiante.correo, 'password123');
    const res = await request(app).get('/api/notificaciones').set('Authorization', `Bearer ${t}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].titulo, 'A');
  });

  test('POST /api/notificaciones/:id/leer la marca como leída', async () => {
    const { estudiante } = await seedBasic();
    const n = await prisma.notificacion.create({
      data: { usuarioId: estudiante.id, titulo: 'B', mensaje: 'm', categoria: 'sistema' },
    });
    const t = await login(estudiante.correo, 'password123');
    const res = await request(app).post(`/api/notificaciones/${n.id}/leer`).set('Authorization', `Bearer ${t}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.leida, true);
  });

  test('POST /api/notificaciones/leer-todas marca todas como leídas', async () => {
    const { estudiante } = await seedBasic();
    await prisma.notificacion.createMany({
      data: [
        { usuarioId: estudiante.id, titulo: '1', mensaje: 'm', categoria: 'sistema' },
        { usuarioId: estudiante.id, titulo: '2', mensaje: 'm', categoria: 'sistema' },
      ],
    });
    const t = await login(estudiante.correo, 'password123');
    await request(app).post('/api/notificaciones/leer-todas').set('Authorization', `Bearer ${t}`);
    const list = await prisma.notificacion.findMany({ where: { usuarioId: estudiante.id } });
    assert.ok(list.every(n => n.leida));
  });

  test('un usuario no puede marcar como leída la notificación de otro', async () => {
    const { estudiante, profesor } = await seedBasic();
    const n = await prisma.notificacion.create({
      data: { usuarioId: profesor.id, titulo: 'X', mensaje: 'm', categoria: 'sistema' },
    });
    const t = await login(estudiante.correo, 'password123');
    const res = await request(app).post(`/api/notificaciones/${n.id}/leer`).set('Authorization', `Bearer ${t}`);
    assert.equal(res.status, 404);
  });

  test('POST /api/notificaciones masivo (admin/profesor)', async () => {
    const { admin, estudiante, profesor } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const res = await request(app).post('/api/notificaciones')
      .set('Authorization', `Bearer ${t}`)
      .send({ usuarioIds: [estudiante.id, profesor.id], titulo: 'Aviso', mensaje: 'masivo', categoria: 'sistema' });
    assert.equal(res.status, 201);
    assert.equal(res.body.count, 2);
    const c = await prisma.notificacion.count({ where: { titulo: 'Aviso' } });
    assert.equal(c, 2);
  });

  test('POST /api/notificaciones rechaza estudiantes', async () => {
    const { estudiante } = await seedBasic();
    const t = await login(estudiante.correo, 'password123');
    const res = await request(app).post('/api/notificaciones')
      .set('Authorization', `Bearer ${t}`)
      .send({ usuarioIds: [estudiante.id], titulo: 'x', mensaje: 'x' });
    assert.equal(res.status, 403);
  });

  test('admin puede leer su bandeja de notificaciones (CAR-09)', async () => {
    const { admin } = await seedBasic();
    await prisma.notificacion.createMany({
      data: [
        { usuarioId: admin.id, titulo: 'Solicitud de reset', mensaje: 'X pide reset', categoria: 'administrativo' },
        { usuarioId: admin.id, titulo: 'Backup automatico', mensaje: 'ok', categoria: 'sistema', leida: true },
      ],
    });
    const t = await login(admin.correo, 'password123');
    const res = await request(app).get('/api/notificaciones').set('Authorization', `Bearer ${t}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 2);
    const noLeidas = res.body.filter(n => !n.leida);
    assert.equal(noLeidas.length, 1);
    assert.equal(noLeidas[0].titulo, 'Solicitud de reset');

    // marcar todas como leídas también funciona para admin
    await request(app).post('/api/notificaciones/leer-todas').set('Authorization', `Bearer ${t}`);
    const tras = await prisma.notificacion.findMany({ where: { usuarioId: admin.id } });
    assert.ok(tras.every(n => n.leida));
  });
});
