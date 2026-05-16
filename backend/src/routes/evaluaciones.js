import express from 'express';
import prisma from '../prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/mias', authenticate, async (req, res) => {
  const evals = await prisma.evaluacion.findMany({
    where: { estudianteId: req.user.id },
    include: {
      grupo: { include: { programa: true } },
      profesor: { select: { nombre: true, apellido: true } },
    },
    orderBy: { periodo: 'desc' },
  });
  res.json(evals);
});

router.get('/estudiante/:estudianteId', authenticate, async (req, res) => {
  const evals = await prisma.evaluacion.findMany({
    where: { estudianteId: Number(req.params.estudianteId) },
    include: {
      grupo: { include: { programa: true } },
      profesor: { select: { nombre: true, apellido: true } },
    },
    orderBy: { periodo: 'desc' },
  });
  res.json(evals);
});

router.post('/', authenticate, requireRole('profesor', 'admin'), async (req, res) => {
  const {
    estudianteId, grupoId, periodo,
    participacion, practica, actitud, progreso,
    valoracionGeneral, comentario
  } = req.body;

  if (!estudianteId || !grupoId || !periodo) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  const evalu = await prisma.evaluacion.upsert({
    where: {
      estudianteId_grupoId_periodo: {
        estudianteId: Number(estudianteId),
        grupoId: Number(grupoId),
        periodo,
      },
    },
    update: {
      participacion, practica, actitud, progreso,
      valoracionGeneral, comentario,
      profesorId: req.user.id,
    },
    create: {
      estudianteId: Number(estudianteId),
      grupoId: Number(grupoId),
      periodo,
      participacion, practica, actitud, progreso,
      valoracionGeneral, comentario,
      profesorId: req.user.id,
    },
  });

  // notificar al estudiante
  await prisma.notificacion.create({
    data: {
      usuarioId: Number(estudianteId),
      titulo: `Evaluación disponible · Período ${periodo}`,
      mensaje: `Tu evaluación cualitativa del período ${periodo} ya está disponible. Valoración: ${valoracionGeneral}.`,
      categoria: 'academico',
    },
  });

  res.status(201).json(evalu);
});

router.get('/grupo/:grupoId', authenticate, async (req, res) => {
  const evals = await prisma.evaluacion.findMany({
    where: { grupoId: Number(req.params.grupoId) },
    include: {
      estudiante: { select: { id: true, nombre: true, apellido: true } },
    },
  });
  res.json(evals);
});

export default router;
