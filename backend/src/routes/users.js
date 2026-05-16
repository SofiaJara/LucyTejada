import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/me/perfil', authenticate, async (req, res) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id: req.user.id },
    include: {
      inscripciones: {
        include: {
          grupo: { include: { programa: true, profesor: true } },
        },
      },
    },
  });
  if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
  const { contrasena, ...safe } = usuario;
  res.json(safe);
});

router.put('/me', authenticate, async (req, res) => {
  const { nombre, apellido, telefono, direccion, ciudad, barrio, contrasena } = req.body;
  const data = { nombre, apellido, telefono, direccion, ciudad, barrio };
  if (contrasena) {
    data.contrasena = await bcrypt.hash(contrasena, 10);
  }
  const updated = await prisma.usuario.update({ where: { id: req.user.id }, data });
  const { contrasena: _, ...safe } = updated;
  res.json(safe);
});

router.get('/profesores', authenticate, async (req, res) => {
  const profesores = await prisma.usuario.findMany({
    where: { rol: 'profesor', activo: true },
    select: { id: true, nombre: true, apellido: true, correo: true, documento: true },
  });
  res.json(profesores);
});

router.get('/estudiantes', authenticate, requireRole('admin', 'profesor'), async (req, res) => {
  const estudiantes = await prisma.usuario.findMany({
    where: { rol: 'estudiante' },
    include: {
      inscripciones: { include: { grupo: { include: { programa: true } } } },
    },
  });
  res.json(estudiantes.map(({ contrasena, ...u }) => u));
});

export default router;
