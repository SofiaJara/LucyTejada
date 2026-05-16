import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { registrar } from '../bitacora.js';

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

  // estudiantes por género
  const generoRaw = await prisma.usuario.groupBy({
    by: ['genero'], where: { rol: 'estudiante' }, _count: { _all: true },
  });
  const generos = generoRaw.map(g => ({ genero: g.genero || 'No especificado', count: g._count._all }));

  // estudiantes por ciudad
  const ciudadRaw = await prisma.usuario.groupBy({
    by: ['ciudad'], where: { rol: 'estudiante' }, _count: { _all: true },
    orderBy: { _count: { ciudad: 'desc' } }, take: 8,
  });
  const ciudades = ciudadRaw.map(c => ({ ciudad: c.ciudad || 'Sin dato', count: c._count._all }));

  res.json({
    totalEstudiantes,
    totalProfesores,
    totalProgramas,
    totalGrupos,
    inscripcionesActivas: inscripciones,
    evaluacionesRecientes,
    generos,
    ciudades,
  });
});

router.get('/usuarios', async (req, res) => {
  const { rol, genero, ciudad, barrio, busqueda } = req.query;
  const where = {};
  if (rol) where.rol = rol;
  if (genero) where.genero = genero;
  if (ciudad) where.ciudad = { contains: ciudad };
  if (barrio) where.barrio = { contains: barrio };
  if (busqueda) {
    where.OR = [
      { nombre: { contains: busqueda } },
      { apellido: { contains: busqueda } },
      { correo: { contains: busqueda } },
      { documento: { contains: busqueda } },
    ];
  }
  const usuarios = await prisma.usuario.findMany({
    where, orderBy: { createdAt: 'desc' },
    include: { inscripciones: { include: { grupo: { include: { programa: true } } } } },
  });
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
    await registrar({
      accion: 'create', entidad: 'usuario', entidadId: usuario.id,
      descripcion: `Admin creó usuario ${rol}: ${correo}`,
      req,
    });
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
  await registrar({
    accion: 'update', entidad: 'usuario', entidadId: usuario.id,
    descripcion: `Admin actualizó usuario: ${correo}`,
    req,
  });
  res.json(safe);
});

router.delete('/usuarios/:id', async (req, res) => {
  const u = await prisma.usuario.update({
    where: { id: Number(req.params.id) }, data: { activo: false },
  });
  await registrar({
    accion: 'delete', entidad: 'usuario', entidadId: u.id,
    descripcion: `Admin desactivó usuario: ${u.correo}`,
    req,
  });
  res.json({ ok: true });
});

router.get('/reportes/asistencia', async (req, res) => {
  const { programaId } = req.query;
  const where = { activo: true };
  if (programaId) where.programaId = Number(programaId);

  const grupos = await prisma.grupo.findMany({
    where,
    include: {
      programa: true,
      profesor: { select: { nombre: true, apellido: true } },
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
      profesor: g.profesor ? `${g.profesor.nombre} ${g.profesor.apellido}` : 'Sin asignar',
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

router.get('/reportes/evaluaciones', async (req, res) => {
  const evals = await prisma.evaluacion.findMany({
    include: {
      estudiante: { select: { nombre: true, apellido: true, documento: true } },
      profesor:   { select: { nombre: true, apellido: true } },
      grupo:      { include: { programa: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(evals.map(e => ({
    periodo: e.periodo,
    estudiante: `${e.estudiante.nombre} ${e.estudiante.apellido}`,
    documento: e.estudiante.documento,
    programa: e.grupo.programa.nombre,
    grupo: e.grupo.nombre,
    profesor: `${e.profesor.nombre} ${e.profesor.apellido}`,
    valoracion: e.valoracionGeneral,
    participacion: e.participacion,
    practica: e.practica,
    actitud: e.actitud,
    progreso: e.progreso,
    comentario: e.comentario || '',
    fecha: e.createdAt,
  })));
});

// Bitácora
router.get('/bitacora', async (req, res) => {
  const { accion, entidad, usuarioId, desde, hasta, limit } = req.query;
  const where = {};
  if (accion) where.accion = accion;
  if (entidad) where.entidad = entidad;
  if (usuarioId) where.usuarioId = Number(usuarioId);
  if (desde || hasta) {
    where.createdAt = {};
    if (desde) where.createdAt.gte = new Date(desde);
    if (hasta) where.createdAt.lte = new Date(hasta);
  }
  const registros = await prisma.bitacora.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit ? Number(limit) : 200,
  });
  res.json(registros);
});

export default router;
