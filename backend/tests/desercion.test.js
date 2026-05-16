import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, resetDb, disconnect, seedBasic, login, makeUser } from './helpers.js';
import prisma from '../src/prisma.js';
import { calcularDesercion } from '../src/services/desercion.js';

describe('deserción (CAR-07/08)', () => {
  before(async () => { await resetDb(); });
  after(async () => { await disconnect(); });
  beforeEach(async () => { await resetDb(); });

  async function crearEntorno() {
    const base = await seedBasic();
    await prisma.inscripcion.create({ data: { estudianteId: base.estudiante.id, grupoId: base.grupo.id } });
    const otro = await makeUser({ documento: 'D-RIES', correo: 'riesgo@x.com', rol: 'estudiante' });
    await prisma.inscripcion.create({ data: { estudianteId: otro.id, grupoId: base.grupo.id } });
    return { ...base, otro };
  }

  test('detecta estudiante con 0% de asistencia en grupos con ≥3 clases recientes', async () => {
    const { estudiante, otro, grupo } = await crearEntorno();
    const ahora = Date.now();
    const fechas = [10, 7, 4].map(d => new Date(ahora - d * 24 * 3600 * 1000));
    for (const fecha of fechas) {
      const clase = await prisma.clase.create({ data: { grupoId: grupo.id, fecha } });
      await prisma.asistencia.create({ data: { claseId: clase.id, estudianteId: estudiante.id, asistio: true } });
      await prisma.asistencia.create({ data: { claseId: clase.id, estudianteId: otro.id, asistio: false } });
    }
    const lista = await calcularDesercion();
    const ids = lista.map(x => x.estudianteId);
    assert.ok(ids.includes(otro.id), 'estudiante sin asistencias debe estar en riesgo');
    assert.ok(!ids.includes(estudiante.id), 'estudiante que asistió no debe estar en riesgo');
  });

  test('no marca como riesgo si el grupo no tiene suficientes clases', async () => {
    const { otro, grupo } = await crearEntorno();
    const clase = await prisma.clase.create({ data: { grupoId: grupo.id, fecha: new Date() } });
    await prisma.asistencia.create({ data: { claseId: clase.id, estudianteId: otro.id, asistio: false } });
    const lista = await calcularDesercion();
    assert.equal(lista.length, 0);
  });

  test('GET /api/admin/reportes/desercion requiere admin y devuelve la lista', async () => {
    const { admin, profesor, otro, grupo } = await crearEntorno();
    const ahora = Date.now();
    for (const d of [10, 7, 4]) {
      const c = await prisma.clase.create({ data: { grupoId: grupo.id, fecha: new Date(ahora - d * 86400000) } });
      await prisma.asistencia.create({ data: { claseId: c.id, estudianteId: otro.id, asistio: false } });
    }
    const tProf = await login(profesor.correo, 'password123');
    const noAuth = await request(app).get('/api/admin/reportes/desercion').set('Authorization', `Bearer ${tProf}`);
    assert.equal(noAuth.status, 403);

    const t = await login(admin.correo, 'password123');
    const res = await request(app).get('/api/admin/reportes/desercion').set('Authorization', `Bearer ${t}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.find(r => r.estudianteId === otro.id));
  });

  test('GET /api/admin/dashboard incluye enRiesgoDesercion', async () => {
    const { admin } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const res = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${t}`);
    assert.equal(res.status, 200);
    assert.equal(typeof res.body.enRiesgoDesercion, 'number');
  });
});
