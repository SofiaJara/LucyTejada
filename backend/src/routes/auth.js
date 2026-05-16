import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';
import { registrar } from '../bitacora.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const {
      documento, nombre, apellido, correo, contrasena,
      telefono, direccion, ciudad, barrio, genero, fechaNacimiento, rol
    } = req.body;

    if (!documento || !nombre || !apellido || !correo || !contrasena) {
      return res.status(400).json({ error: 'Campos obligatorios faltantes' });
    }

    if (contrasena.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const existsCorreo = await prisma.usuario.findUnique({ where: { correo } });
    if (existsCorreo) return res.status(400).json({ error: 'El correo ya está registrado' });

    const existsDoc = await prisma.usuario.findUnique({ where: { documento } });
    if (existsDoc) return res.status(400).json({ error: 'El documento ya está registrado' });

    const hashed = await bcrypt.hash(contrasena, 10);

    const usuario = await prisma.usuario.create({
      data: {
        documento, nombre, apellido, correo,
        contrasena: hashed,
        rol: rol || 'estudiante',
        telefono, direccion, ciudad, barrio, genero,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
      },
    });

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol, correo: usuario.correo },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { contrasena: _, ...userSafe } = usuario;
    await registrar({
      accion: 'create', entidad: 'usuario', entidadId: usuario.id,
      descripcion: `Registro público de estudiante: ${usuario.correo}`,
      req: { user: { id: usuario.id, correo: usuario.correo }, headers: req.headers, ip: req.ip, socket: req.socket },
    });
    res.status(201).json({ token, user: userSafe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    if (!correo || !contrasena) {
      return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
    }

    const usuario = await prisma.usuario.findUnique({ where: { correo } });
    if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });

    if (!usuario.activo) return res.status(403).json({ error: 'Usuario inactivo' });

    const valid = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol, correo: usuario.correo },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { contrasena: _, ...userSafe } = usuario;
    await registrar({
      accion: 'login', entidad: 'usuario', entidadId: usuario.id,
      descripcion: `Inicio de sesión como ${usuario.rol}`,
      req: { user: { id: usuario.id, correo: usuario.correo }, headers: req.headers, ip: req.ip, socket: req.socket },
    });
    res.json({ token, user: userSafe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

router.post('/logout', async (req, res) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
      await registrar({
        accion: 'logout', entidad: 'usuario', entidadId: decoded.id,
        descripcion: `Cierre de sesión (${decoded.rol})`,
        req: { user: decoded, headers: req.headers, ip: req.ip, socket: req.socket },
      });
    } catch {}
  }
  res.json({ ok: true });
});

router.post('/solicitar-reset', async (req, res) => {
  // Por privacidad respondemos 200 incluso si el correo no existe (evita enumeración).
  const { correo } = req.body || {};
  if (!correo || typeof correo !== 'string') {
    return res.status(400).json({ error: 'Correo requerido' });
  }
  try {
    const usuario = await prisma.usuario.findUnique({ where: { correo } });
    if (usuario && usuario.activo) {
      const admins = await prisma.usuario.findMany({ where: { rol: 'admin', activo: true }, select: { id: true } });
      if (admins.length > 0) {
        await prisma.notificacion.createMany({
          data: admins.map(a => ({
            usuarioId: a.id,
            titulo: 'Solicitud de restablecimiento de contraseña',
            mensaje: `El usuario ${usuario.nombre} ${usuario.apellido} (${usuario.correo}, rol ${usuario.rol}) solicita restablecer su contraseña. Edita el usuario en Gestión de usuarios para asignar una nueva.`,
            categoria: 'administrativo',
          })),
        });
      }
      await registrar({
        accion: 'create', entidad: 'reset_solicitud', entidadId: usuario.id,
        descripcion: `Solicitud de reset de contraseña para ${usuario.correo}`,
        req: { headers: req.headers, ip: req.ip, socket: req.socket },
      });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.json({ ok: true });
  }
});

router.get('/me', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'No autenticado' });
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await prisma.usuario.findUnique({ where: { id: decoded.id } });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    const { contrasena: _, ...userSafe } = usuario;
    res.json({ user: userSafe });
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
});

export default router;
