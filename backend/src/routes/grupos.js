import express from 'express';
import prisma from '../prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  const { profesorId } = req.query;
  const where = { activo: true };
  if (profesorId) where.profesorId = Number(profesorId);

  // si el usuario es profesor y no se especifica, mostrar los suyos
  if (req.user.rol === 'profesor' && !profesorId) {
    where.profesorId = req.user.id;
  }

  const grupos = await prisma.grupo.findMany({
    where,
    include: {
      programa: true,
      profesor: { select: { id: true, nombre: true, apellido: true } },
      inscripciones: {
        include: { estudiante: { select: { id: true, nombre: true, apellido: true, documento: true } } },
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
  });
  res.status(201).json(grupo);
});

router.put('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const { nombre, cupoMaximo, horario, salon, totalClases, profesorId, activo } = req.body;
  const grupo = await prisma.grupo.update({
    where: { id: Number(req.params.id) },
    data: {
      nombre, cupoMaximo, horario, salon, totalClases, activo,
      profesorId: profesorId ? Number(profesorId) : null,
    },
  });
  res.json(grupo);
});

router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  await prisma.grupo.update({
    where: { id: Number(req.params.id) },
    data: { activo: false },
  });
  res.json({ ok: true });
});

export default router;
