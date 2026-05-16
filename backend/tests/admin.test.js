import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, resetDb, disconnect, seedBasic, login, makeUser } from './helpers.js';
import prisma from '../src/prisma.js';

describe('admin', () => {
  before(async () => { await resetDb(); });
  after(async () => { await disconnect(); });
  beforeEach(async () => { await resetDb(); });

  test('todos los endpoints /api/admin requieren rol admin', async () => {
    const { profesor } = await seedBasic();
    const t = await login(profesor.correo, 'password123');
    const res = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${t}`);
    assert.equal(res.status, 403);
  });

  test('GET /api/admin/dashboard devuelve métricas', async () => {
    const { admin } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const res = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${t}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.totalEstudiantes, 1);
    assert.equal(res.body.totalProfesores, 1);
    assert.equal(res.body.totalProgramas, 1);
    assert.equal(res.body.totalGrupos, 1);
    assert.ok(Array.isArray(res.body.generos));
  });

  test('GET /api/admin/usuarios filtra por rol y búsqueda', async () => {
    const { admin } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const r1 = await request(app).get('/api/admin/usuarios?rol=estudiante').set('Authorization', `Bearer ${t}`);
    assert.equal(r1.body.length, 1);
    assert.equal(r1.body[0].rol, 'estudiante');
    const r2 = await request(app).get('/api/admin/usuarios?busqueda=eva').set('Authorization', `Bearer ${t}`);
    assert.ok(r2.body.find(u => u.nombre === 'Eva'));
  });

  test('GET /api/admin/usuarios filtra por género/ciudad/barrio (CAR-10)', async () => {
    const { admin } = await seedBasic();
    await makeUser({
      documento: 'F-1', correo: 'fem@x.com', rol: 'estudiante',
      genero: 'Femenino', ciudad: 'Cali', barrio: 'San Fernando',
    });
    const t = await login(admin.correo, 'password123');
    const rGen = await request(app).get('/api/admin/usuarios?genero=Femenino').set('Authorization', `Bearer ${t}`);
    assert.ok(rGen.body.every(u => u.genero === 'Femenino'));
    const rCity = await request(app).get('/api/admin/usuarios?ciudad=Cali').set('Authorization', `Bearer ${t}`);
    assert.ok(rCity.body.every(u => /Cali/i.test(u.ciudad)));
  });

  test('POST /api/admin/usuarios crea usuario y rechaza correo duplicado', async () => {
    const { admin } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const ok = await request(app).post('/api/admin/usuarios').set('Authorization', `Bearer ${t}`)
      .send({ documento: 'N-1', nombre: 'N', apellido: 'A', correo: 'nuevo@x.com',
              contrasena: 'pwpwpw', rol: 'estudiante' });
    assert.equal(ok.status, 201);
    const dup = await request(app).post('/api/admin/usuarios').set('Authorization', `Bearer ${t}`)
      .send({ documento: 'N-2', nombre: 'N', apellido: 'A', correo: 'nuevo@x.com',
              contrasena: 'pwpwpw', rol: 'estudiante' });
    assert.equal(dup.status, 400);
  });

  test('PUT /api/admin/usuarios/:id actualiza y DELETE desactiva', async () => {
    const { admin, estudiante } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const upd = await request(app).put(`/api/admin/usuarios/${estudiante.id}`)
      .set('Authorization', `Bearer ${t}`).send({ telefono: '999', nombre: estudiante.nombre, apellido: estudiante.apellido, correo: estudiante.correo, rol: estudiante.rol, documento: estudiante.documento, activo: true });
    assert.equal(upd.status, 200);
    assert.equal(upd.body.telefono, '999');
    const del = await request(app).delete(`/api/admin/usuarios/${estudiante.id}`).set('Authorization', `Bearer ${t}`);
    assert.equal(del.status, 200);
    const reread = await prisma.usuario.findUnique({ where: { id: estudiante.id } });
    assert.equal(reread.activo, false);
  });

  test('GET /api/admin/reportes/* devuelve estructuras correctas', async () => {
    const { admin } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const r1 = await request(app).get('/api/admin/reportes/asistencia').set('Authorization', `Bearer ${t}`);
    assert.equal(r1.status, 200);
    assert.ok(Array.isArray(r1.body));
    const r2 = await request(app).get('/api/admin/reportes/inscripciones').set('Authorization', `Bearer ${t}`);
    assert.ok(r2.body.every(x => 'totalInscripciones' in x));
    const r3 = await request(app).get('/api/admin/reportes/evaluaciones').set('Authorization', `Bearer ${t}`);
    assert.ok(Array.isArray(r3.body));
  });

  test('GET /api/admin/bitacora filtra por acción/entidad/fecha', async () => {
    const { admin } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    await prisma.bitacora.createMany({
      data: [
        { accion: 'login', entidad: 'usuario', descripcion: 'login admin' },
        { accion: 'create', entidad: 'programa', descripcion: 'prog X' },
      ],
    });
    const r1 = await request(app).get('/api/admin/bitacora?accion=login').set('Authorization', `Bearer ${t}`);
    assert.ok(r1.body.every(b => b.accion === 'login'));
    const r2 = await request(app).get('/api/admin/bitacora?entidad=programa').set('Authorization', `Bearer ${t}`);
    assert.ok(r2.body.every(b => b.entidad === 'programa'));
  });
});
