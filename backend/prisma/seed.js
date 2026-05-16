import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  // Limpiar
  await prisma.notificacion.deleteMany();
  await prisma.evaluacion.deleteMany();
  await prisma.asistencia.deleteMany();
  await prisma.clase.deleteMany();
  await prisma.inscripcion.deleteMany();
  await prisma.grupo.deleteMany();
  await prisma.programa.deleteMany();
  await prisma.usuario.deleteMany();

  const hash = (p) => bcrypt.hashSync(p, 10);

  // Usuarios
  const admin = await prisma.usuario.create({
    data: {
      documento: '1000000000', nombre: 'Lucia', apellido: 'Admin',
      correo: 'admin@lucytejada.edu.co', contrasena: hash('admin123'),
      rol: 'admin', telefono: '3001112233', ciudad: 'Pereira', barrio: 'Centro',
    },
  });

  const prof1 = await prisma.usuario.create({
    data: {
      documento: '1000000001', nombre: 'Hernán', apellido: 'Vargas',
      correo: 'hernan.vargas@lucytejada.edu.co', contrasena: hash('profesor123'),
      rol: 'profesor', telefono: '3002223344', ciudad: 'Pereira', barrio: 'Pinares',
      genero: 'Masculino',
    },
  });

  const prof2 = await prisma.usuario.create({
    data: {
      documento: '1000000002', nombre: 'Sandra', apellido: 'Gil',
      correo: 'sandra.gil@lucytejada.edu.co', contrasena: hash('profesor123'),
      rol: 'profesor', ciudad: 'Pereira', genero: 'Femenino',
    },
  });

  const prof3 = await prisma.usuario.create({
    data: {
      documento: '1000000003', nombre: 'Lina', apellido: 'Torres',
      correo: 'lina.torres@lucytejada.edu.co', contrasena: hash('profesor123'),
      rol: 'profesor', ciudad: 'Pereira', genero: 'Femenino',
    },
  });

  const estudiante1 = await prisma.usuario.create({
    data: {
      documento: '2026004100', nombre: 'Andrés', apellido: 'López',
      correo: 'andres.lopez@correo.com', contrasena: hash('estudiante123'),
      rol: 'estudiante', telefono: '3104445566', ciudad: 'Pereira', barrio: 'El Jardín',
      genero: 'Masculino',
      fechaNacimiento: new Date('2008-05-15'),
    },
  });

  const estudiante2 = await prisma.usuario.create({
    data: {
      documento: '2026004200', nombre: 'María', apellido: 'Gómez',
      correo: 'maria.gomez@correo.com', contrasena: hash('estudiante123'),
      rol: 'estudiante', ciudad: 'Pereira', genero: 'Femenino',
    },
  });

  const estudiante3 = await prisma.usuario.create({
    data: {
      documento: '2026004300', nombre: 'Carlos', apellido: 'Ríos',
      correo: 'carlos.rios@correo.com', contrasena: hash('estudiante123'),
      rol: 'estudiante', ciudad: 'Pereira',
    },
  });

  // Programas
  const piano = await prisma.programa.create({
    data: { nombre: 'Piano básico', categoria: 'Música', descripcion: 'Introducción al piano y lectura musical', duracion: 'Semestre' },
  });
  const guitarra = await prisma.programa.create({
    data: { nombre: 'Guitarra básica', categoria: 'Música', descripcion: 'Iniciación a la guitarra acústica', duracion: 'Semestre' },
  });
  const danza = await prisma.programa.create({
    data: { nombre: 'Danza contemporánea', categoria: 'Artes escénicas', descripcion: 'Expresión corporal y técnica de danza', duracion: 'Semestre' },
  });
  const teatro = await prisma.programa.create({
    data: { nombre: 'Teatro básico', categoria: 'Artes escénicas', descripcion: 'Iniciación a la actuación', duracion: 'Semestre' },
  });
  const plasticas = await prisma.programa.create({
    data: { nombre: 'Artes plásticas', categoria: 'Artes visuales', descripcion: 'Pintura, dibujo y técnicas mixtas', duracion: 'Semestre' },
  });

  // Grupos
  const grupoPianoA = await prisma.grupo.create({
    data: {
      nombre: 'Grupo A', cupoMaximo: 15, totalClases: 19,
      horario: 'Lunes y miércoles · 8:00 am', salon: 'Salón 3 · Bloque B',
      programaId: piano.id, profesorId: prof1.id,
    },
  });
  const grupoGuitarraB = await prisma.grupo.create({
    data: {
      nombre: 'Grupo B', cupoMaximo: 15, totalClases: 19,
      horario: 'Martes y jueves · 10:00 am', salon: 'Salón 1',
      programaId: guitarra.id, profesorId: prof2.id,
    },
  });
  const grupoGuitarraC = await prisma.grupo.create({
    data: {
      nombre: 'Grupo C', cupoMaximo: 12, totalClases: 19,
      horario: 'Mar y jue · 10:00 am', salon: 'Salón 1',
      programaId: guitarra.id, profesorId: prof2.id,
    },
  });
  const grupoDanzaA = await prisma.grupo.create({
    data: {
      nombre: 'Grupo A', cupoMaximo: 18, totalClases: 19,
      horario: 'Lun y vie · 2:00 pm', salon: 'Salón de danza',
      programaId: danza.id, profesorId: prof3.id,
    },
  });
  await prisma.grupo.create({
    data: {
      nombre: 'Grupo B', cupoMaximo: 15, totalClases: 19,
      horario: 'Mié y vie · 3:00 pm', salon: 'Salón 2',
      programaId: teatro.id, profesorId: prof3.id,
    },
  });
  await prisma.grupo.create({
    data: {
      nombre: 'Grupo D', cupoMaximo: 10, totalClases: 16,
      horario: 'Sáb · 9:00 am', salon: 'Taller artes',
      programaId: plasticas.id,
    },
  });

  // Inscripciones
  await prisma.inscripcion.create({ data: { estudianteId: estudiante1.id, grupoId: grupoPianoA.id } });
  await prisma.inscripcion.create({ data: { estudianteId: estudiante2.id, grupoId: grupoPianoA.id } });
  await prisma.inscripcion.create({ data: { estudianteId: estudiante3.id, grupoId: grupoGuitarraB.id } });

  // Crear una clase y asistencia ejemplo
  const clase1 = await prisma.clase.create({
    data: { grupoId: grupoPianoA.id, fecha: new Date(), tema: 'Lectura de partituras' },
  });
  await prisma.asistencia.createMany({
    data: [
      { claseId: clase1.id, estudianteId: estudiante1.id, asistio: true },
      { claseId: clase1.id, estudianteId: estudiante2.id, asistio: false, observacion: 'excusa médica' },
    ],
  });

  // Evaluación ejemplo
  await prisma.evaluacion.create({
    data: {
      estudianteId: estudiante1.id,
      profesorId: prof1.id,
      grupoId: grupoPianoA.id,
      periodo: '2026-1',
      participacion: 'Excelente',
      practica: 'Bueno',
      actitud: 'Excelente',
      progreso: 'Bueno',
      valoracionGeneral: 'Bueno',
      comentario: 'Muestra avance en técnica, mejorar expresión creativa.',
    },
  });

  // Notificaciones ejemplo
  await prisma.notificacion.createMany({
    data: [
      {
        usuarioId: estudiante1.id,
        titulo: 'Cambio de horario · Piano básico',
        mensaje: 'Tu clase del miércoles 15 de abril se traslada al salón 2.',
        categoria: 'horarios',
      },
      {
        usuarioId: estudiante1.id,
        titulo: 'Recordatorio de clase · mañana',
        mensaje: 'Recuerda tu clase de Piano básico el martes a las 8:00 am.',
        categoria: 'horarios',
      },
      {
        usuarioId: prof1.id,
        titulo: 'Recordatorio · Entrega de evaluaciones',
        mensaje: 'Tienes evaluaciones pendientes del período 2026-1.',
        categoria: 'sistema',
      },
    ],
  });

  console.log('Seed completado.');
  console.log('Credenciales:');
  console.log('  Admin:      admin@lucytejada.edu.co / admin123');
  console.log('  Profesor:   hernan.vargas@lucytejada.edu.co / profesor123');
  console.log('  Estudiante: andres.lopez@correo.com / estudiante123');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
