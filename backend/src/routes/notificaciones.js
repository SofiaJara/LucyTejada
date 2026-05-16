import express from 'express';
import prisma from '../prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { registrar } from '../bitacora.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  const notifs = await prisma.notificacion.findMany({
    where: { usuarioId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json(notifs);
});

router.post('/:id/leer', authenticate, async (req, res) => {
  const notif = await prisma.notificacion.findUnique({ where: { id: Number(req.params.id) } });
  if (!notif || notif.usuarioId !== req.user.id) {
    return res.status(404).json({ error: 'Notificación no encontrada' });
  }
  const updated = await prisma.notificacion.update({
    where: { id: notif.id },
    data: { leida: true },
  });
  res.json(updated);
});

router.post('/leer-todas', authenticate, async (req, res) => {
  await prisma.notificacion.updateMany({
    where: { usuarioId: req.user.id, leida: false },
    data: { leida: true },
  });
  res.json({ ok: true });
});

// admin/profesor puede enviar notificación a usuarios
router.post('/', authenticate, requireRole('admin', 'profesor'), async (req, res) => {
  const { usuarioIds, titulo, mensaje, categoria } = req.body;
  if (!Array.isArray(usuarioIds) || !titulo || !mensaje) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }
  const ops = usuarioIds.map(uid =>
    prisma.notificacion.create({
      data: {
        usuarioId: Number(uid),
        titulo,
        mensaje,
        categoria: categoria || 'sistema',
      },
    })
  );
  await prisma.$transaction(ops);
  await registrar({
    accion: 'create', entidad: 'notificacion',
    descripcion: `Envió notificación masiva "${titulo}" a ${usuarioIds.length} usuario(s) (${categoria || 'sistema'})`,
    req,
  });
  res.status(201).json({ ok: true, count: usuarioIds.length });
});

export default router;
