import express from 'express';
import prisma from '../prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { registrar } from '../bitacora.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { categoria, busqueda } = req.query;
  const where = { activo: true };
  if (categoria) where.categoria = categoria;
  if (busqueda) where.nombre = { contains: busqueda };

  const programas = await prisma.programa.findMany({
    where,
    include: {
      grupos: {
        where: { activo: true },
        include: {
          profesor: { select: { id: true, nombre: true, apellido: true } },
          _count: { select: { inscripciones: true } },
        },
      },
    },
    orderBy: { nombre: 'asc' },
  });
  res.json(programas);
});

router.get('/:id', async (req, res) => {
  const programa = await prisma.programa.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      grupos: {
        include: {
          profesor: { select: { id: true, nombre: true, apellido: true } },
          _count: { select: { inscripciones: true } },
        },
      },
    },
  });
  if (!programa) return res.status(404).json({ error: 'Programa no encontrado' });
  res.json(programa);
});

router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  const { nombre, categoria, descripcion, duracion } = req.body;
  if (!nombre || !categoria) return res.status(400).json({ error: 'Nombre y categoría son requeridos' });
  const programa = await prisma.programa.create({
    data: { nombre, categoria, descripcion, duracion },
  });
  await registrar({ accion: 'create', entidad: 'programa', entidadId: programa.id, descripcion: `Creó programa ${nombre}`, req });
  res.status(201).json(programa);
});

router.put('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const { nombre, categoria, descripcion, duracion, activo } = req.body;
  const programa = await prisma.programa.update({
    where: { id: Number(req.params.id) },
    data: { nombre, categoria, descripcion, duracion, activo },
  });
  await registrar({ accion: 'update', entidad: 'programa', entidadId: programa.id, descripcion: `Actualizó programa ${programa.nombre}`, req });
  res.json(programa);
});

router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const programa = await prisma.programa.update({
    where: { id: Number(req.params.id) },
    data: { activo: false },
  });
  await registrar({ accion: 'delete', entidad: 'programa', entidadId: programa.id, descripcion: `Desactivó programa ${programa.nombre}`, req });
  res.json({ ok: true });
});

export default router;
