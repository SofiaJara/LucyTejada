import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, requireRole('admin'));

router.get('/dashboard', async (req, res) => {
  const [totalEstudiantes, totalProfesores, totalProgramas, totalGrupos, evaluacionesRecientes] = await Promise.all([
    prisma.usuario.count({ where: { rol: 'estudiante' } }),
    prisma.usuario.count({ where: { rol: 'profesor' } }),
    prisma.programa.count({ where: { activo: true } }),
    prisma.grupo.count({ where: { activo: true } }),
    prisma.evaluacion.count(),
  ]);
  const inscripciones = await prisma.inscripcion.count({ where: { estado: 'activo' } });
  res.json({
    totalEstudiantes,
    totalProfesores,
    totalProgramas,
    totalGrupos,
    inscripcionesActivas: inscripciones,
    evaluacionesRecientes,
  });
});

router.get('/usuarios', async (req, res) => {
  const { rol } = req.query;
  const where = {};
  if (rol) where.rol = rol;
  const usuarios = await prisma.usuario.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(usuarios.map(({ contrasena, ...u }) => u));
});

router.post('/usuarios', async (req, res) => {
  const {
    documento, nombre, apellido, correo, contrasena, rol,
    telefono, direccion, ciudad, barrio, genero, fechaNacimiento,
  } = req.body;
  if (!documento || !nombre || !apellido || !correo || !contrasena || !rol) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  const hashed = await bcrypt.hash(contrasena, 10);
  try {
    const usuario = await prisma.usuario.create({
      data: {
        documento, nombre, apellido, correo,
        contrasena: hashed, rol,
        telefono, direccion, ciudad, barrio, genero,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
      },
    });
    const { contrasena: _, ...safe } = usuario;
    res.status(201).json(safe);
  } catch (e) {
    if (e.code === 'P2002') return res.status(400).json({ error: 'Correo o documento ya existen' });
    throw e;
  }
});

router.put('/usuarios/:id', async (req, res) => {
  const { documento, nombre, apellido, correo, rol, telefono, direccion, ciudad, barrio, genero, activo, contrasena } = req.body;
  const data = { documento, nombre, apellido, correo, rol, telefono, direccion, ciudad, barrio, genero, activo };
  if (contrasena) data.contrasena = await bcrypt.hash(contrasena, 10);
  const usuario = await prisma.usuario.update({ where: { id: Number(req.params.id) }, data });
  const { contrasena: _, ...safe } = usuario;
  res.json(safe);
});

router.delete('/usuarios/:id', async (req, res) => {
  await prisma.usuario.update({ where: { id: Number(req.params.id) }, data: { activo: false } });
  res.json({ ok: true });
});

router.get('/reportes/asistencia', async (req, res) => {
  const grupos = await prisma.grupo.findMany({
    where: { activo: true },
    include: {
      programa: true,
      clases: { include: { asistencias: true } },
      _count: { select: { inscripciones: true } },
    },
  });
  const reporte = grupos.map(g => {
    let total = 0, presentes = 0;
    g.clases.forEach(c => {
      total += c.asistencias.length;
      presentes += c.asistencias.filter(a => a.asistio).length;
    });
    return {
      grupoId: g.id,
      grupo: g.nombre,
      programa: g.programa.nombre,
      estudiantes: g._count.inscripciones,
      clases: g.clases.length,
      asistenciaPorcentaje: total > 0 ? Math.round((presentes / total) * 100) : 0,
    };
  });
  res.json(reporte);
});

router.get('/reportes/inscripciones', async (req, res) => {
  const programas = await prisma.programa.findMany({
    where: { activo: true },
    include: {
      grupos: {
        include: { _count: { select: { inscripciones: true } } },
      },
    },
  });
  const data = programas.map(p => ({
    programa: p.nombre,
    categoria: p.categoria,
    totalGrupos: p.grupos.length,
    totalInscripciones: p.grupos.reduce((sum, g) => sum + g._count.inscripciones, 0),
  }));
  res.json(data);
});

export default router;
