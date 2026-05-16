import express from 'express';
import prisma from '../prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { registrar } from '../bitacora.js';

const router = express.Router();

router.get('/mias', authenticate, async (req, res) => {
  const inscripciones = await prisma.inscripcion.findMany({
    where: { estudianteId: req.user.id },
    include: {
      grupo: {
        include: {
          programa: true,
          profesor: { select: { id: true, nombre: true, apellido: true } },
        },
      },
    },
  });
  res.json(inscripciones);
});

router.post('/', authenticate, async (req, res) => {
  const { grupoId } = req.body;
  if (!grupoId) return res.status(400).json({ error: 'Grupo requerido' });

  const grupo = await prisma.grupo.findUnique({
    where: { id: Number(grupoId) },
    include: { _count: { select: { inscripciones: true } } },
  });
  if (!grupo) return res.status(404).json({ error: 'Grupo no encontrado' });
  if (!grupo.activo) return res.status(400).json({ error: 'Grupo inactivo' });

  const cuposLibres = grupo.cupoMaximo - grupo._count.inscripciones;

  const existing = await prisma.inscripcion.findUnique({
    where: { estudianteId_grupoId: { estudianteId: req.user.id, grupoId: Number(grupoId) } },
  });
  if (existing) return res.status(400).json({ error: 'Ya estás inscrito en este grupo' });

  const inscripcion = await prisma.inscripcion.create({
    data: {
      estudianteId: req.user.id,
      grupoId: Number(grupoId),
      estado: cuposLibres > 0 ? 'activo' : 'lista_espera',
    },
    include: {
      grupo: {
        include: {
          programa: true,
          profesor: { select: { id: true, nombre: true, apellido: true } },
        },
      },
    },
  });

  await registrar({
    accion: 'create', entidad: 'inscripcion', entidadId: inscripcion.id,
    descripcion: `Inscripción en ${inscripcion.grupo.programa.nombre} · ${inscripcion.grupo.nombre} (${inscripcion.estado})`,
    req,
  });
  // crear notificación de confirmación
  await prisma.notificacion.create({
    data: {
      usuarioId: req.user.id,
      titulo: `Inscripción ${cuposLibres > 0 ? 'confirmada' : 'en lista de espera'} · ${inscripcion.grupo.programa.nombre}`,
      mensaje: cuposLibres > 0
        ? `Has sido inscrito en ${inscripcion.grupo.programa.nombre} · ${inscripcion.grupo.nombre}.`
        : `Quedaste en lista de espera para ${inscripcion.grupo.programa.nombre} · ${inscripcion.grupo.nombre}.`,
      categoria: 'academico',
    },
  });

  res.status(201).json(inscripcion);
});

router.delete('/:id', authenticate, async (req, res) => {
  const inscripcion = await prisma.inscripcion.findUnique({
    where: { id: Number(req.params.id) },
    include: { grupo: { include: { programa: true } } },
  });
  if (!inscripcion) return res.status(404).json({ error: 'Inscripción no encontrada' });
  if (inscripcion.estudianteId !== req.user.id && req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'No autorizado' });
  }
  await prisma.inscripcion.delete({ where: { id: Number(req.params.id) } });

  await registrar({
    accion: 'delete', entidad: 'inscripcion', entidadId: inscripcion.id,
    descripcion: `Cancelación de inscripción en ${inscripcion.grupo.programa.nombre} · ${inscripcion.grupo.nombre}`,
    req,
  });

  await prisma.notificacion.create({
    data: {
      usuarioId: inscripcion.estudianteId,
      titulo: `Inscripción cancelada · ${inscripcion.grupo.programa.nombre}`,
      mensaje: `Tu inscripción en ${inscripcion.grupo.programa.nombre} · ${inscripcion.grupo.nombre} fue cancelada.`,
      categoria: 'academico',
    },
  });

  res.json({ ok: true });
});

export default router;
