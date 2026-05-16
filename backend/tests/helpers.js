import bcrypt from 'bcryptjs';
import request from 'supertest';
import { createApp } from '../src/app.js';
import prisma from '../src/prisma.js';

export const app = createApp();

export async function resetDb() {
  await prisma.bitacora.deleteMany();
  await prisma.notificacion.deleteMany();
  await prisma.evaluacion.deleteMany();
  await prisma.asistencia.deleteMany();
  await prisma.clase.deleteMany();
  await prisma.inscripcion.deleteMany();
  await prisma.grupo.deleteMany();
  await prisma.programa.deleteMany();
  await prisma.usuario.deleteMany();
}

export async function disconnect() {
  await prisma.$disconnect();
}

export async function makeUser({
  documento, nombre = 'Test', apellido = 'User',
  correo, contrasena = 'password123', rol = 'estudiante',
  ciudad = 'Pereira', barrio = 'Centro', genero = 'Masculino', activo = true,
}) {
  return prisma.usuario.create({
    data: {
      documento, nombre, apellido, correo,
      contrasena: await bcrypt.hash(contrasena, 4),
      rol, ciudad, barrio, genero, activo,
    },
  });
}

export async function login(correo, contrasena) {
  const res = await request(app).post('/api/auth/login').send({ correo, contrasena });
  if (res.status !== 200) {
    throw new Error(`login fallido (${res.status}): ${JSON.stringify(res.body)}`);
  }
  return res.body.token;
}

export async function seedBasic() {
  const admin = await makeUser({
    documento: 'A-001', nombre: 'Ada', apellido: 'Admin',
    correo: 'admin@test.local', rol: 'admin',
  });
  const profesor = await makeUser({
    documento: 'P-001', nombre: 'Pablo', apellido: 'Prof',
    correo: 'profesor@test.local', rol: 'profesor',
  });
  const estudiante = await makeUser({
    documento: 'E-001', nombre: 'Eva', apellido: 'Estu',
    correo: 'estudiante@test.local', rol: 'estudiante',
  });
  const programa = await prisma.programa.create({
    data: { nombre: 'Piano básico', categoria: 'Música', descripcion: 'desc', duracion: 'Semestre' },
  });
  const grupo = await prisma.grupo.create({
    data: {
      nombre: 'Grupo A', cupoMaximo: 5, totalClases: 10,
      horario: 'Lun 8am', salon: 'Salón 1',
      programaId: programa.id, profesorId: profesor.id,
    },
  });
  return { admin, profesor, estudiante, programa, grupo };
}
