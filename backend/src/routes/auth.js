import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';

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
    res.json({ token, user: userSafe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
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
