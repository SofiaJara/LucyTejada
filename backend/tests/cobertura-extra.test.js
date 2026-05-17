import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, resetDb, disconnect, seedBasic, login, makeUser } from './helpers.js';
import prisma from '../src/prisma.js';

describe('cobertura adicional', () => {
  before(async () => { await resetDb(); });
  after(async () => { await disconnect(); });
  beforeEach(async () => { await resetDb(); });

  test('GET /api/asistencia/clases/:id devuelve detalle con estudiantes', async () => {
    const { profesor, grupo, estudiante } = await seedBasic();
    await prisma.inscripcion.create({ data: { estudianteId: estudiante.id, grupoId: grupo.id } });
    const t = await login(profesor.correo, 'password123');

    const clase = await request(app).post('/api/asistencia/clases')
      .set('Authorization', `Bearer ${t}`)
      .send({ grupoId: grupo.id, tema: 'Tema X' });
    await request(app).post(`/api/asistencia/clases/${clase.body.id}/registrar`)
      .set('Authorization', `Bearer ${t}`)
      .send({ asistencias: [{ estudianteId: estudiante.id, asistio: true }] });

    const det = await request(app).get(`/api/asistencia/clases/${clase.body.id}`)
      .set('Authorization', `Bearer ${t}`);
    assert.equal(det.status, 200);
    assert.equal(det.body.tema, 'Tema X');
    assert.equal(det.body.asistencias.length, 1);
    assert.equal(det.body.asistencias[0].estudiante.nombre, estudiante.nombre);
    assert.ok(det.body.grupo.programa);
  });

  test('GET /api/asistencia/clases/:id 404 si no existe', async () => {
    const { profesor } = await seedBasic();
    const t = await login(profesor.correo, 'password123');
    const res = await request(app).get('/api/asistencia/clases/999999')
      .set('Authorization', `Bearer ${t}`);
    assert.equal(res.status, 404);
  });

  test('reportes/demografia agrupa edades respetando los rangos definidos', async () => {
    const { admin } = await seedBasic();
    const hoy = new Date();
    const nacEdad = (edad) => {
      const d = new Date(hoy);
      d.setFullYear(d.getFullYear() - edad);
      d.setDate(d.getDate() - 1);
      return d;
    };
    for (const [doc, correo, edad] of [
      ['ED-08', 'e8@x.com', 8],
      ['ED-15', 'e15@x.com', 15],
      ['ED-22', 'e22@x.com', 22],
      ['ED-35', 'e35@x.com', 35],
      ['ED-50', 'e50@x.com', 50],
      ['ED-NA', 'ena@x.com', null],
    ]) {
      await prisma.usuario.create({
        data: {
          documento: doc, correo, contrasena: 'h', rol: 'estudiante',
          nombre: 'E', apellido: doc,
          fechaNacimiento: edad === null ? null : nacEdad(edad),
        },
      });
    }
    const t = await login(admin.correo, 'password123');
    const res = await request(app).get('/api/admin/reportes/demografia')
      .set('Authorization', `Bearer ${t}`);
    assert.equal(res.status, 200);
    const buckets = Object.fromEntries(res.body.porEdad.map(b => [b.rango, b.total]));
    assert.equal(buckets['Menor de 12'], 1, 'el de 8 años debe ir en Menor de 12');
    assert.equal(buckets['12-17'], 1, 'el de 15 años debe ir en 12-17');
    assert.equal(buckets['18-25'], 1, 'el de 22 años debe ir en 18-25');
    assert.equal(buckets['26-40'], 1, 'el de 35 años debe ir en 26-40');
    assert.equal(buckets['Más de 40'], 1, 'el de 50 años debe ir en Más de 40');
    assert.ok(buckets['Sin dato'] >= 2, 'estudiante sin fechaNacimiento + estudiante seed sin fecha');
  });

  test('admin puede recibir su propia notificación masiva (CAR-09)', async () => {
    const { admin } = await seedBasic();
    const otroAdmin = await makeUser({
      documento: 'A-2', correo: 'admin2@x.com', rol: 'admin',
    });
    const t = await login(admin.correo, 'password123');
    const env = await request(app).post('/api/notificaciones')
      .set('Authorization', `Bearer ${t}`)
      .send({
        usuarioIds: [otroAdmin.id],
        titulo: 'Recordatorio admin',
        mensaje: 'Revisar lista de espera de la semana',
        categoria: 'administrativo',
      });
    assert.equal(env.status, 201);
    const tOtro = await login(otroAdmin.correo, 'password123');
    const bandeja = await request(app).get('/api/notificaciones')
      .set('Authorization', `Bearer ${tOtro}`);
    assert.equal(bandeja.status, 200);
    assert.ok(bandeja.body.find(n => n.titulo === 'Recordatorio admin'));
  });

  test('cancelar inscripción libera cupo y promueve siguiente en cola (FIFO en mismo programa)', async () => {
    // E1 inscrito activo, E2 y E3 en lista_espera (cupo 1).
    const { admin, estudiante, profesor, programa } = await seedBasic();
    const grupo = await prisma.grupo.create({
      data: { nombre: 'Único', cupoMaximo: 1, totalClases: 5,
              horario: 'X', salon: 'Y', programaId: programa.id, profesorId: profesor.id },
    });
    const e2 = await makeUser({ documento: 'E-2', correo: 'e2@x.com', rol: 'estudiante' });
    const e3 = await makeUser({ documento: 'E-3', correo: 'e3@x.com', rol: 'estudiante' });

    // Inscribir E1 (activo)
    const t = await login(estudiante.correo, 'password123');
    const r1 = await request(app).post('/api/inscripciones').set('Authorization', `Bearer ${t}`)
      .send({ grupoId: grupo.id });
    assert.equal(r1.body.estado, 'activo');

    // E2 a lista de espera
    const t2 = await login(e2.correo, 'password123');
    const r2 = await request(app).post('/api/inscripciones').set('Authorization', `Bearer ${t2}`)
      .send({ grupoId: grupo.id });
    assert.equal(r2.body.estado, 'lista_espera');

    // E3 a lista de espera (queda detrás de E2)
    const t3 = await login(e3.correo, 'password123');
    const r3 = await request(app).post('/api/inscripciones').set('Authorization', `Bearer ${t3}`)
      .send({ grupoId: grupo.id });
    assert.equal(r3.body.estado, 'lista_espera');

    // Cancela E1 → debería promover a E2 (no a E3)
    const del = await request(app).delete(`/api/inscripciones/${r1.body.id}`).set('Authorization', `Bearer ${t}`);
    assert.equal(del.status, 200);

    const e2Ins = await prisma.inscripcion.findFirst({ where: { estudianteId: e2.id, grupoId: grupo.id } });
    const e3Ins = await prisma.inscripcion.findFirst({ where: { estudianteId: e3.id, grupoId: grupo.id } });
    assert.equal(e2Ins.estado, 'activo', 'E2 (más antiguo en lista) debe ser promovido');
    assert.equal(e3Ins.estado, 'lista_espera', 'E3 sigue en espera');

    // Y debe haber notificación de promoción para E2
    const notif = await prisma.notificacion.findFirst({
      where: { usuarioId: e2.id, titulo: { contains: 'Cupo disponible' } },
    });
    assert.ok(notif, 'E2 recibe notificación de cupo disponible');
  });

  test('PUT /api/users/me no permite cambiar correo ni documento', async () => {
    const { estudiante } = await seedBasic();
    const t = await login(estudiante.correo, 'password123');
    const res = await request(app).put('/api/users/me')
      .set('Authorization', `Bearer ${t}`)
      .send({ correo: 'nuevo-correo@x.com', documento: 'OTRO-DOC', nombre: 'Cambio' });
    assert.equal(res.status, 200);
    assert.equal(res.body.nombre, 'Cambio', 'cambia los campos sí editables');
    assert.equal(res.body.correo, estudiante.correo, 'el correo permanece igual');
    assert.equal(res.body.documento, estudiante.documento, 'el documento permanece igual');
    const reread = await prisma.usuario.findUnique({ where: { id: estudiante.id } });
    assert.equal(reread.correo, estudiante.correo);
    assert.equal(reread.documento, estudiante.documento);
  });
});
