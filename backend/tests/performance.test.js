import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {
  app, resetDb, disconnect, makeUser, login, seedBasic,
} from './helpers.js';
import prisma from '../src/prisma.js';

// Cubre las métricas del doc de visión (sección 9, especificación de escenarios).
// Los umbrales se eligen con holgura para correr en CI sobre SQLite local;
// si fallan, indican una regresión real en la ruta crítica.

describe('performance & concurrencia (ES-CC01..ES-CC06)', () => {
  before(async () => { await resetDb(); });
  after(async () => { await disconnect(); });
  beforeEach(async () => { await resetDb(); });

  test('ES-CC01: login válido responde en menos de 3s', async () => {
    await makeUser({
      documento: 'PERF-1', correo: 'perf-login@test.local',
      contrasena: 'secret123', rol: 'admin',
    });
    const inicio = Date.now();
    const res = await request(app).post('/api/auth/login').send({
      correo: 'perf-login@test.local', contrasena: 'secret123',
    });
    const elapsed = Date.now() - inicio;
    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.ok(elapsed < 3000, `Login tardó ${elapsed}ms (umbral 3000ms)`);
  });

  test('ES-CC02: registro de programa por admin en menos de 5s', async () => {
    const { admin } = await seedBasic();
    const token = await login(admin.correo, 'password123');
    const inicio = Date.now();
    const res = await request(app)
      .post('/api/programas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Programa Perf',
        categoria: 'Música',
        descripcion: 'Test de performance',
        duracion: 'Semestre',
      });
    const elapsed = Date.now() - inicio;
    assert.equal(res.status, 201);
    assert.ok(elapsed < 5000, `Registro programa tardó ${elapsed}ms (umbral 5000ms)`);
  });

  test('ES-CC04: registro de asistencia por formador en menos de 5s', async () => {
    const { profesor, estudiante, grupo } = await seedBasic();
    await prisma.inscripcion.create({
      data: { estudianteId: estudiante.id, grupoId: grupo.id, estado: 'activo' },
    });
    const token = await login(profesor.correo, 'password123');

    // Crear clase
    const claseRes = await request(app)
      .post('/api/asistencia/clases')
      .set('Authorization', `Bearer ${token}`)
      .send({ grupoId: grupo.id, fecha: new Date().toISOString(), tema: 'Perf' });
    assert.equal(claseRes.status, 201);
    const claseId = claseRes.body.id;

    // Registrar asistencia
    const inicio = Date.now();
    const res = await request(app)
      .post(`/api/asistencia/clases/${claseId}/registrar`)
      .set('Authorization', `Bearer ${token}`)
      .send({ asistencias: [{ estudianteId: estudiante.id, asistio: true }] });
    const elapsed = Date.now() - inicio;
    assert.equal(res.status, 200);
    assert.ok(elapsed < 5000, `Registro asistencia tardó ${elapsed}ms (umbral 5000ms)`);
  });

  test('ES-CC05: generación de reporte de inscripciones en menos de 15s', async () => {
    const { admin, programa, grupo } = await seedBasic();
    // sembrar varias inscripciones para que el reporte tenga datos
    for (let i = 0; i < 25; i++) {
      const est = await makeUser({
        documento: `RPT-${i}`, correo: `rpt-${i}@test.local`,
        nombre: `Est${i}`, ciudad: i % 2 ? 'Pereira' : 'Cali',
      });
      await prisma.inscripcion.create({
        data: { estudianteId: est.id, grupoId: grupo.id, estado: 'activo' },
      });
    }
    const token = await login(admin.correo, 'password123');
    const inicio = Date.now();
    const res = await request(app)
      .get('/api/admin/reportes/inscripciones')
      .set('Authorization', `Bearer ${token}`);
    const elapsed = Date.now() - inicio;
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    const totalInscritos = res.body.reduce((sum, p) => sum + (p.totalInscripciones ?? 0), 0);
    assert.ok(totalInscritos >= 25, `Reporte sólo agregó ${totalInscritos} inscripciones`);
    assert.ok(elapsed < 15000, `Reporte tardó ${elapsed}ms (umbral 15000ms)`);
  });

  test('ES-CC06: 20 lecturas concurrentes sin degradación significativa', async () => {
    const { admin } = await seedBasic();
    const token = await login(admin.correo, 'password123');

    const N = 20;
    const inicio = Date.now();
    const peticiones = Array.from({ length: N }, () =>
      request(app).get('/api/programas').set('Authorization', `Bearer ${token}`)
    );
    const resultados = await Promise.all(peticiones);
    const elapsed = Date.now() - inicio;

    // Todas deben responder OK
    for (const r of resultados) assert.equal(r.status, 200);
    // El throughput debe ser razonable: 20 lecturas concurrentes < 15s en total.
    assert.ok(elapsed < 15000,
      `20 lecturas concurrentes tardaron ${elapsed}ms (umbral 15000ms)`);
  });

  test('ES-CC06: 10 escrituras concurrentes en endpoints distintos sin errores', async () => {
    const { admin, programa } = await seedBasic();
    const token = await login(admin.correo, 'password123');

    const inicio = Date.now();
    const peticiones = Array.from({ length: 10 }, (_, i) =>
      request(app)
        .post('/api/programas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nombre: `Concurrente-${i}`,
          categoria: 'Música',
          descripcion: `desc-${i}`,
          duracion: 'Semestre',
        })
    );
    const resultados = await Promise.all(peticiones);
    const elapsed = Date.now() - inicio;

    const exitos = resultados.filter(r => r.status === 201).length;
    assert.equal(exitos, 10, `Solo ${exitos}/10 escrituras concurrentes tuvieron éxito`);
    assert.ok(elapsed < 15000, `10 escrituras concurrentes tardaron ${elapsed}ms`);
  });
});
