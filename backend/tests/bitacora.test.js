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
});
