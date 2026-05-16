import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, resetDb, disconnect, seedBasic, login } from './helpers.js';
import prisma from '../src/prisma.js';

describe('users', () => {
  before(async () => { await resetDb(); });
  after(async () => { await disconnect(); });
  beforeEach(async () => { await resetDb(); });

  test('GET /api/users/me/perfil incluye inscripciones', async () => {
    const { estudiante, grupo } = await seedBasic();
    await prisma.inscripcion.create({ data: { estudianteId: estudiante.id, grupoId: grupo.id } });
    const t = await login(estudiante.correo, 'password123');
    const res = await request(app).get('/api/users/me/perfil').set('Authorization', `Bearer ${t}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.inscripciones.length, 1);
    assert.equal(res.body.contrasena, undefined);
  });

  test('GET /api/users/me/perfil devuelve todas las inscripciones cuando hay varias (CAR-03)', async () => {
    const { estudiante, grupo, profesor } = await seedBasic();
    await prisma.inscripcion.create({ data: { estudianteId: estudiante.id, grupoId: grupo.id } });
    const otroPrograma = await prisma.programa.create({
      data: { nombre: 'Guitarra básica', categoria: 'Música', duracion: 'Semestre' },
    });
    const otroGrupo = await prisma.grupo.create({
      data: {
        nombre: 'Grupo A', cupoMaximo: 5, totalClases: 10,
        horario: 'Mar 10am', salon: 'Salón 2',
        programaId: otroPrograma.id, profesorId: profesor.id,
      },
    });
    await prisma.inscripcion.create({ data: { estudianteId: estudiante.id, grupoId: otroGrupo.id } });
    const t = await login(estudiante.correo, 'password123');
    const res = await request(app).get('/api/users/me/perfil').set('Authorization', `Bearer ${t}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.inscripciones.length, 2);
    const programas = res.body.inscripciones.map(i => i.grupo.programa.nombre).sort();
    assert.deepEqual(programas, ['Guitarra básica', 'Piano básico']);
  });

  test('PUT /api/users/me actualiza datos propios', async () => {
    const { estudiante } = await seedBasic();
    const t = await login(estudiante.correo, 'password123');
    const res = await request(app).put('/api/users/me')
      .set('Authorization', `Bearer ${t}`)
      .send({ nombre: 'EvaCambiada', apellido: estudiante.apellido, telefono: '12345' });
    assert.equal(res.status, 200);
    assert.equal(res.body.nombre, 'EvaCambiada');
    assert.equal(res.body.telefono, '12345');
  });

  test('PUT /api/users/me cambia contraseña y permite login con la nueva', async () => {
    const { estudiante } = await seedBasic();
    const t = await login(estudiante.correo, 'password123');
    await request(app).put('/api/users/me')
      .set('Authorization', `Bearer ${t}`)
      .send({ contrasena: 'nuevaPassword' });
    const ok = await request(app).post('/api/auth/login').send({ correo: estudiante.correo, contrasena: 'nuevaPassword' });
    assert.equal(ok.status, 200);
  });

  test('GET /api/users/profesores devuelve sólo profesores activos', async () => {
    const { estudiante, profesor } = await seedBasic();
    const t = await login(estudiante.correo, 'password123');
    const res = await request(app).get('/api/users/profesores').set('Authorization', `Bearer ${t}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.find(p => p.id === profesor.id));
    assert.ok(!res.body.find(p => p.id === estudiante.id));
  });

  test('GET /api/users/estudiantes requiere admin o profesor', async () => {
    const { estudiante } = await seedBasic();
    const t = await login(estudiante.correo, 'password123');
    const res = await request(app).get('/api/users/estudiantes').set('Authorization', `Bearer ${t}`);
    assert.equal(res.status, 403);
  });
});
