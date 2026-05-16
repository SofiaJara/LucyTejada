import express from 'express';
import prisma from '../prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { registrar } from '../bitacora.js';

const router = express.Router();

// Listar clases de un grupo
router.get('/grupos/:grupoId/clases', authenticate, async (req, res) => {
  const clases = await prisma.clase.findMany({
    where: { grupoId: Number(req.params.grupoId) },
    orderBy: { fecha: 'desc' },
    include: { asistencias: true },
  });
  res.json(clases);
});

// Crear o devolver la clase del día para un grupo
router.post('/clases', authenticate, requireRole('profesor', 'admin'), async (req, res) => {
  const { grupoId, fecha, tema } = req.body;
  if (!grupoId) return res.status(400).json({ error: 'Grupo requerido' });
  const fechaDate = fecha ? new Date(fecha) : new Date();

  const clase = await prisma.clase.create({
    data: { grupoId: Number(grupoId), fecha: fechaDate, tema },
    include: { grupo: { include: { programa: true } } },
  });
  await registrar({
    accion: 'create', entidad: 'clase', entidadId: clase.id,
    descripcion: `Creó clase ${clase.grupo.programa.nombre} · ${clase.grupo.nombre} (${fechaDate.toISOString().split('T')[0]})${tema ? ` · ${tema}` : ''}`,
    req,
  });
  res.status(201).json(clase);
});

// Registrar asistencia masiva para una clase
router.post('/clases/:claseId/registrar', authenticate, requireRole('profesor', 'admin'), async (req, res) => {
  const { asistencias } = req.body; // [{estudianteId, asistio, observacion}]
  const claseId = Number(req.params.claseId);
  if (!Array.isArray(asistencias)) {
    return res.status(400).json({ error: 'asistencias debe ser un array' });
  }

  const ops = asistencias.map(a =>
    prisma.asistencia.upsert({
      where: { claseId_estudianteId: { claseId, estudianteId: Number(a.estudianteId) } },
      update: { asistio: !!a.asistio, observacion: a.observacion || null },
      create: {
        claseId,
        estudianteId: Number(a.estudianteId),
        asistio: !!a.asistio,
        observacion: a.observacion || null,
      },
    })
  );
  await prisma.$transaction(ops);
  const presentes = asistencias.filter(a => a.asistio).length;
  await registrar({
    accion: 'update', entidad: 'asistencia', entidadId: claseId,
    descripcion: `Registró asistencia de clase #${claseId}: ${presentes}/${asistencias.length} presentes`,
    req,
  });
  res.json({ ok: true, registradas: asistencias.length });
});

router.get('/clases/:claseId', authenticate, async (req, res) => {
  const clase = await prisma.clase.findUnique({
    where: { id: Number(req.params.claseId) },
    include: {
      asistencias: {
        include: { estudiante: { select: { id: true, nombre: true, apellido: true, documento: true } } },
      },
      grupo: { include: { programa: true } },
    },
  });
  if (!clase) return res.status(404).json({ error: 'Clase no encontrada' });
  res.json(clase);
});

// Reporte de asistencia por estudiante
router.get('/estudiante/:estudianteId/resumen', authenticate, async (req, res) => {
  const estudianteId = Number(req.params.estudianteId);
  const asistencias = await prisma.asistencia.findMany({
    where: { estudianteId },
    include: { clase: { include: { grupo: { include: { programa: true } } } } },
  });
  const total = asistencias.length;
  const presentes = asistencias.filter(a => a.asistio).length;
  res.json({ total, presentes, porcentaje: total > 0 ? Math.round((presentes / total) * 100) : 0, detalles: asistencias });
});

export default router;
