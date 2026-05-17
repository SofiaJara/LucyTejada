import { PrismaClient } from '@prisma/client';
import { enviarEmailNotificacion, isEmailEnabled } from './services/email.js';

const prisma = new PrismaClient();

// Middleware: cada vez que se crea una Notificación, intenta enviar también un email
// al correo del usuario. No bloquea la operación: si falla el envío o no hay SMTP
// configurado, la notificación en BD igual queda registrada.
prisma.$use(async (params, next) => {
  const result = await next(params);
  if (params.model === 'Notificacion' && (params.action === 'create' || params.action === 'createMany')) {
    if (!isEmailEnabled()) return result;
    const data = params.args?.data;
    const items = Array.isArray(data) ? data : [data];
    enviarEmailsNotificaciones(items).catch(() => {});
  }
  return result;
});

async function enviarEmailsNotificaciones(items) {
  if (!items?.length) return;
  const ids = [...new Set(items.map(i => Number(i.usuarioId)).filter(Boolean))];
  if (!ids.length) return;
  const usuarios = await prisma.usuario.findMany({
    where: { id: { in: ids } },
    select: { id: true, correo: true },
  });
  const correoPorId = new Map(usuarios.map(u => [u.id, u.correo]));
  await Promise.allSettled(
    items.map(item => {
      const correo = correoPorId.get(Number(item.usuarioId));
      if (!correo) return Promise.resolve();
      return enviarEmailNotificacion({
        correo,
        titulo: item.titulo,
        mensaje: item.mensaje,
        categoria: item.categoria,
      });
    })
  );
}

export default prisma;
