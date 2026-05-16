import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, resetDb, disconnect, seedBasic, login, makeUser } from './helpers.js';
import prisma from '../src/prisma.js';

describe('reportes con filtros de fecha y programa (CAR-07/10)', () => {
  before(async () => { await resetDb(); });
  after(async () => { await disconnect(); });
  beforeEach(async () => { await resetDb(); });

  test('reportes/inscripciones filtra por rango de fechas', async () => {
    const { admin, estudiante, grupo, programa } = await seedBasic();
    const segundo = await makeUser({ documento: 'X-1', correo: 'x1@x.com', rol: 'estudiante' });

    const vieja = new Date('2025-01-01T10:00:00Z');
    await prisma.inscripcion.create({
      data: { estudianteId: estudiante.id, grupoId: grupo.id, fechaInscripcion: vieja, createdAt: vieja },
    });
    await prisma.inscripcion.create({
      data: { estudianteId: segundo.id, grupoId: grupo.id, fechaInscripcion: new Date(), createdAt: new Date() },
    });

    const t = await login(admin.correo, 'password123');
    const todas = await request(app).get('/api/admin/reportes/inscripciones').set('Authorization', `Bearer ${t}`);
    const fila = todas.body.find(p => p.programa === programa.nombre);
    assert.equal(fila.totalInscripciones, 2);

    const rec = await request(app).get('/api/admin/reportes/inscripciones?desde=2025-06-01').set('Authorization', `Bearer ${t}`);
    const filaRec = rec.body.find(p => p.programa === programa.nombre);
    assert.equal(filaRec.totalInscripciones, 1, 'solo cuenta la inscripción posterior a la fecha');
  });

  test('reportes/evaluaciones filtra por programa y profesor', async () => {
    const { admin, profesor, estudiante, grupo, programa } = await seedBasic();
    await prisma.evaluacion.create({
      data: {
        estudianteId: estudiante.id, profesorId: profesor.id, grupoId: grupo.id,
        periodo: '2026-1', participacion: 'Bueno', practica: 'Bueno',
        actitud: 'Bueno', progreso: 'Bueno', valoracionGeneral: 'Bueno',
      },
    });

    const otroPrograma = await prisma.programa.create({ data: { nombre: 'Pintura', categoria: 'Artes visuales' } });
    const otroGrupo = await prisma.grupo.create({
      data: { nombre: 'Único', cupoMaximo: 5, totalClases: 5, horario: 'X', salon: 'Y',
              programaId: otroPrograma.id, profesorId: profesor.id },
    });
    await prisma.evaluacion.create({
      data: {
        estudianteId: estudiante.id, profesorId: profesor.id, grupoId: otroGrupo.id,
        periodo: '2026-1', participacion: 'Bueno', practica: 'Bueno',
        actitud: 'Bueno', progreso: 'Bueno', valoracionGeneral: 'Bueno',
      },
    });

    const t = await login(admin.correo, 'password123');
    const filt = await request(app).get(`/api/admin/reportes/evaluaciones?programaId=${programa.id}`).set('Authorization', `Bearer ${t}`);
    assert.equal(filt.body.length, 1);
    assert.equal(filt.body[0].programa, programa.nombre);
  });

  test('reportes/asistencia respeta el rango de fechas en las clases', async () => {
    const { admin, estudiante, grupo } = await seedBasic();
    await prisma.inscripcion.create({ data: { estudianteId: estudiante.id, grupoId: grupo.id } });
    const claseVieja = await prisma.clase.create({ data: { grupoId: grupo.id, fecha: new Date('2024-01-01') } });
    const claseNueva = await prisma.clase.create({ data: { grupoId: grupo.id, fecha: new Date() } });
    await prisma.asistencia.create({ data: { claseId: claseVieja.id, estudianteId: estudiante.id, asistio: false } });
    await prisma.asistencia.create({ data: { claseId: claseNueva.id, estudianteId: estudiante.id, asistio: true } });

    const t = await login(admin.correo, 'password123');
    const sinFiltro = await request(app).get('/api/admin/reportes/asistencia').set('Authorization', `Bearer ${t}`);
    const fSin = sinFiltro.body.find(g => g.grupoId === grupo.id);
    assert.equal(fSin.clases, 2);
    assert.equal(fSin.asistenciaPorcentaje, 50);

    const reciente = await request(app).get('/api/admin/reportes/asistencia?desde=2025-01-01').set('Authorization', `Bearer ${t}`);
    const fRec = reciente.body.find(g => g.grupoId === grupo.id);
    assert.equal(fRec.clases, 1);
    assert.equal(fRec.asistenciaPorcentaje, 100);
  });
});
