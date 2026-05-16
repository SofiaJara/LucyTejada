import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { registrar } from '../bitacora.js';
import { calcularDesercion } from '../services/desercion.js';
import { crearBackup, listarBackups, rutaBackup } from '../services/backup.js';

const router = express.Router();

router.use(authenticate, requireRole('admin'));

router.get('/dashboard', async (req, res) => {
  const [totalEstudiantes, totalProfesores, totalProgramas, totalGrupos, evaluacionesRecientes, estudiantesInactivos, listaEspera] = await Promise.all([
    prisma.usuario.count({ where: { rol: 'estudiante', activo: true } }),
    prisma.usuario.count({ where: { rol: 'profesor', activo: true } }),
    prisma.programa.count({ where: { activo: true } }),
    prisma.grupo.count({ where: { activo: true } }),
    prisma.evaluacion.count(),
    prisma.usuario.count({ where: { rol: 'estudiante', activo: false } }),
    prisma.inscripcion.count({ where: { estado: 'lista_espera' } }),
  ]);
  const inscripciones = await prisma.inscripcion.count({ where: { estado: 'activo' } });
  const enRiesgoDesercion = (await calcularDesercion()).length;

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
    estudiantesInactivos,
    listaEspera,
    enRiesgoDesercion,
    generos,
    ciudades,
  });
});

router.get('/usuarios', async (req, res) => {
  const { rol, genero, ciudad, barrio, busqueda, grupoId, programaId, activo } = req.query;
  const where = {};
  if (rol) where.rol = rol;
  if (genero) where.genero = genero;
  if (ciudad) where.ciudad = { contains: ciudad };
  if (barrio) where.barrio = { contains: barrio };
  if (activo === 'true') where.activo = true;
  else if (activo === 'false') where.activo = false;
  if (grupoId) where.inscripciones = { some: { grupoId: Number(grupoId) } };
  else if (programaId) where.inscripciones = { some: { grupo: { programaId: Number(programaId) } } };
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

function parseRango(desde, hasta) {
  const r = {};
  if (desde) r.gte = new Date(desde);
  if (hasta) {
    const h = new Date(hasta);
    h.setHours(23, 59, 59, 999);
    r.lte = h;
  }
  return Object.keys(r).length ? r : null;
}

router.get('/reportes/asistencia', async (req, res) => {
  const { programaId, profesorId, desde, hasta } = req.query;
  const where = { activo: true };
  if (programaId) where.programaId = Number(programaId);
  if (profesorId) where.profesorId = Number(profesorId);

  const rango = parseRango(desde, hasta);
  const claseFilter = rango ? { where: { fecha: rango }, include: { asistencias: true } } : { include: { asistencias: true } };

  const grupos = await prisma.grupo.findMany({
    where,
    include: {
      programa: true,
      profesor: { select: { nombre: true, apellido: true } },
      clases: claseFilter,
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
  const { desde, hasta, programaId } = req.query;
  const rango = parseRango(desde, hasta);
  const programaWhere = { activo: true };
  if (programaId) programaWhere.id = Number(programaId);

  const programas = await prisma.programa.findMany({
    where: programaWhere,
    include: {
      grupos: {
        include: {
          inscripciones: rango ? { where: { fechaInscripcion: rango }, select: { id: true } } : { select: { id: true } },
        },
      },
    },
  });
  const data = programas.map(p => ({
    programa: p.nombre,
    categoria: p.categoria,
    totalGrupos: p.grupos.length,
    totalInscripciones: p.grupos.reduce((sum, g) => sum + g.inscripciones.length, 0),
  }));
  res.json(data);
});

router.get('/reportes/evaluaciones', async (req, res) => {
  const { desde, hasta, programaId, profesorId } = req.query;
  const where = {};
  const rango = parseRango(desde, hasta);
  if (rango) where.createdAt = rango;
  if (profesorId) where.profesorId = Number(profesorId);
  if (programaId) where.grupo = { programaId: Number(programaId) };

  const evals = await prisma.evaluacion.findMany({
    where,
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

router.get('/reportes/demografia', async (req, res) => {
  const estudiantes = await prisma.usuario.findMany({
    where: { rol: 'estudiante', activo: true },
    select: { genero: true, ciudad: true, barrio: true, fechaNacimiento: true },
  });
  const bucket = (arr, key) => {
    const map = new Map();
    arr.forEach(e => {
      const v = e[key] || 'Sin dato';
      map.set(v, (map.get(v) || 0) + 1);
    });
    return Array.from(map.entries()).map(([valor, total]) => ({ valor, total }));
  };
  const edadBucket = () => {
    const ahora = Date.now();
    const rangos = { 'Menor de 12': 0, '12-17': 0, '18-25': 0, '26-40': 0, 'Más de 40': 0, 'Sin dato': 0 };
    estudiantes.forEach(e => {
      if (!e.fechaNacimiento) { rangos['Sin dato']++; return; }
      const edad = Math.floor((ahora - new Date(e.fechaNacimiento).getTime()) / (365.25 * 24 * 3600 * 1000));
      if (edad < 12) rangos['Menor de 12']++;
      else if (edad < 18) rangos['12-17']++;
      else if (edad < 26) rangos['18-25']++;
      else if (edad < 41) rangos['26-40']++;
      else rangos['Más de 40']++;
    });
    return Object.entries(rangos).map(([rango, total]) => ({ rango, total }));
  };
  res.json({
    totalEstudiantes: estudiantes.length,
    porGenero: bucket(estudiantes, 'genero'),
    porCiudad: bucket(estudiantes, 'ciudad').sort((a, b) => b.total - a.total),
    porBarrio: bucket(estudiantes, 'barrio').sort((a, b) => b.total - a.total),
    porEdad: edadBucket(),
  });
});

// Inscribir un estudiante manualmente desde admin
router.post('/inscripciones', async (req, res) => {
  const { estudianteId, grupoId } = req.body;
  if (!estudianteId || !grupoId) return res.status(400).json({ error: 'estudianteId y grupoId requeridos' });

  const grupo = await prisma.grupo.findUnique({
    where: { id: Number(grupoId) },
    include: { _count: { select: { inscripciones: true } }, programa: true },
  });
  if (!grupo) return res.status(404).json({ error: 'Grupo no encontrado' });
  if (!grupo.activo) return res.status(400).json({ error: 'Grupo inactivo' });

  const existing = await prisma.inscripcion.findUnique({
    where: { estudianteId_grupoId: { estudianteId: Number(estudianteId), grupoId: Number(grupoId) } },
  });
  if (existing) return res.status(400).json({ error: 'El estudiante ya está inscrito en este grupo' });

  const enMismoPrograma = await prisma.inscripcion.findFirst({
    where: { estudianteId: Number(estudianteId), grupo: { programaId: grupo.programaId } },
    include: { grupo: true },
  });
  if (enMismoPrograma) {
    return res.status(400).json({
      error: `El estudiante ya está inscrito en otro grupo de "${grupo.programa.nombre}" (${enMismoPrograma.grupo.nombre}).`,
    });
  }

  const cuposLibres = grupo.cupoMaximo - grupo._count.inscripciones;
  const inscripcion = await prisma.inscripcion.create({
    data: {
      estudianteId: Number(estudianteId),
      grupoId: Number(grupoId),
      estado: cuposLibres > 0 ? 'activo' : 'lista_espera',
    },
  });
  await registrar({
    accion: 'create', entidad: 'inscripcion', entidadId: inscripcion.id,
    descripcion: `Admin inscribió a estudiante #${estudianteId} en ${grupo.programa.nombre} · ${grupo.nombre} (${inscripcion.estado})`,
    req,
  });
  await prisma.notificacion.create({
    data: {
      usuarioId: Number(estudianteId),
      titulo: `Inscripción ${cuposLibres > 0 ? 'confirmada' : 'en lista de espera'} · ${grupo.programa.nombre}`,
      mensaje: `Has sido inscrito en ${grupo.programa.nombre} · ${grupo.nombre} por el administrador.`,
      categoria: 'academico',
    },
  });
  res.status(201).json(inscripcion);
});

// Reporte de deserción (CAR-07 / CAR-08)
router.get('/reportes/desercion', async (req, res) => {
  const ventana = req.query.ventana ? Number(req.query.ventana) : undefined;
  const enRiesgo = await calcularDesercion(ventana ? { diasVentana: ventana } : undefined);
  res.json(enRiesgo);
});

// Backups (CAR-12)
router.get('/backups', (req, res) => {
  res.json(listarBackups());
});

router.post('/backups', async (req, res) => {
  try {
    const info = crearBackup();
    await registrar({
      accion: 'create', entidad: 'backup', entidadId: null,
      descripcion: `Admin generó backup ${info.archivo} (${info.tamanoBytes} bytes)`,
      req,
    });
    res.status(201).json(info);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/backups/:archivo/descargar', (req, res) => {
  const ruta = rutaBackup(req.params.archivo);
  if (!ruta) return res.status(404).json({ error: 'Backup no encontrado' });
  res.download(ruta);
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
