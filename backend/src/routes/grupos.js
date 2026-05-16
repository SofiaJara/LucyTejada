import express from 'express';
import prisma from '../prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { registrar } from '../bitacora.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  const { profesorId, programaId, incluirInactivos } = req.query;
  const where = {};
  if (!(req.user.rol === 'admin' && incluirInactivos === 'true')) {
    where.activo = true;
  }
  if (profesorId) where.profesorId = Number(profesorId);
  if (programaId) where.programaId = Number(programaId);

  if (req.user.rol === 'profesor' && !profesorId) {
    where.profesorId = req.user.id;
  }

  const grupos = await prisma.grupo.findMany({
    where,
    include: {
      programa: true,
      profesor: { select: { id: true, nombre: true, apellido: true } },
      inscripciones: {
        include: {
          estudiante: {
            select: {
              id: true, nombre: true, apellido: true, documento: true,
              ciudad: true, barrio: true, genero: true, correo: true,
            },
          },
        },
      },
      _count: { select: { inscripciones: true, clases: true } },
    },
    orderBy: { nombre: 'asc' },
  });
  res.json(grupos);
});

router.get('/:id', authenticate, async (req, res) => {
  const grupo = await prisma.grupo.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      programa: true,
      profesor: { select: { id: true, nombre: true, apellido: true } },
      inscripciones: {
        include: {
          estudiante: {
            select: { id: true, nombre: true, apellido: true, documento: true, correo: true, ciudad: true, barrio: true, genero: true },
          },
        },
      },
      clases: { orderBy: { fecha: 'desc' } },
    },
  });
  if (!grupo) return res.status(404).json({ error: 'Grupo no encontrado' });
  res.json(grupo);
});

router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  const { nombre, cupoMaximo, horario, salon, totalClases, programaId, profesorId } = req.body;
  if (!nombre || !programaId) return res.status(400).json({ error: 'Nombre y programa son requeridos' });
  const grupo = await prisma.grupo.create({
    data: {
      nombre,
      cupoMaximo: cupoMaximo || 20,
      horario: horario || 'Por definir',
      salon: salon || 'Por definir',
      totalClases: totalClases || 20,
      programaId: Number(programaId),
      profesorId: profesorId ? Number(profesorId) : null,
    },
    include: { programa: true },
  });
  await registrar({
    accion: 'create', entidad: 'grupo', entidadId: grupo.id,
    descripcion: `Creó grupo ${grupo.programa.nombre} · ${grupo.nombre}`, req,
  });
  res.status(201).json(grupo);
});

router.put('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const id = Number(req.params.id);
  const { nombre, cupoMaximo, horario, salon, totalClases, profesorId, activo } = req.body;
  const previo = await prisma.grupo.findUnique({
    where: { id },
    include: {
      programa: true,
      inscripciones: { select: { estudianteId: true } },
    },
  });
  if (!previo) return res.status(404).json({ error: 'Grupo no encontrado' });

  const grupo = await prisma.grupo.update({
    where: { id },
    data: {
      nombre, cupoMaximo, horario, salon, totalClases, activo,
      profesorId: profesorId ? Number(profesorId) : null,
    },
    include: { programa: true },
  });

  // notificar a estudiantes si cambia horario, salón o se desactiva
  const cambios = [];
  if (horario && horario !== previo.horario) cambios.push(`nuevo horario: ${horario}`);
  if (salon && salon !== previo.salon) cambios.push(`nuevo salón: ${salon}`);
  if (activo === false && previo.activo) cambios.push('el grupo ha sido desactivado');
  if (cambios.length > 0 && previo.inscripciones.length > 0) {
    await prisma.$transaction(
      previo.inscripciones.map(ins =>
        prisma.notificacion.create({
          data: {
            usuarioId: ins.estudianteId,
            titulo: `Cambio en tu grupo · ${previo.programa.nombre} · ${previo.nombre}`,
            mensaje: cambios.join('. '),
            categoria: 'horarios',
          },
        })
      )
    );
  }

  await registrar({
    accion: 'update', entidad: 'grupo', entidadId: id,
    descripcion: `Actualizó grupo ${previo.programa.nombre} · ${previo.nombre}${cambios.length ? `: ${cambios.join(', ')}` : ''}`,
    req,
  });

  res.json(grupo);
});

router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const id = Number(req.params.id);
  const grupo = await prisma.grupo.findUnique({ where: { id }, include: { programa: true, inscripciones: { select: { estudianteId: true } } } });
  if (!grupo) return res.status(404).json({ error: 'Grupo no encontrado' });
  await prisma.grupo.update({ where: { id }, data: { activo: false } });
  // notificar
  if (grupo.inscripciones.length > 0) {
    await prisma.$transaction(grupo.inscripciones.map(ins =>
      prisma.notificacion.create({
        data: {
          usuarioId: ins.estudianteId,
          titulo: `Grupo desactivado · ${grupo.programa.nombre} · ${grupo.nombre}`,
          mensaje: 'Este grupo fue desactivado. Contacta al administrador para más información.',
          categoria: 'administrativo',
        },
      })
    ));
  }
  await registrar({
    accion: 'delete', entidad: 'grupo', entidadId: id,
    descripcion: `Desactivó grupo ${grupo.programa.nombre} · ${grupo.nombre}`,
    req,
  });
  res.json({ ok: true });
});

export default router;
