import prisma from './prisma.js';

export async function registrar({ accion, entidad, entidadId, descripcion, req }) {
  try {
    await prisma.bitacora.create({
      data: {
        accion,
        entidad,
        entidadId: entidadId ? Number(entidadId) : null,
        descripcion,
        usuarioId: req?.user?.id || null,
        usuarioCorreo: req?.user?.correo || null,
        ip: req?.ip || req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || null,
      },
    });
  } catch (e) {
    console.error('No se pudo registrar bitácora:', e.message);
  }
}
