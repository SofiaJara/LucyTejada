import nodemailer from 'nodemailer';

let cachedTransporter = null;
let warnedMissingConfig = false;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    if (!warnedMissingConfig && process.env.NODE_ENV !== 'test') {
      warnedMissingConfig = true;
      console.warn('[email] SMTP no configurado (SMTP_HOST/SMTP_USER/SMTP_PASS). Las notificaciones por correo se omiten.');
    }
    return null;
  }
  cachedTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return cachedTransporter;
}

export function isEmailEnabled() {
  return getTransporter() !== null;
}

export async function sendEmail({ to, subject, text, html }) {
  if (!to) return { skipped: true, reason: 'sin destinatario' };
  const transporter = getTransporter();
  if (!transporter) return { skipped: true, reason: 'SMTP no configurado' };
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  try {
    const info = await transporter.sendMail({ from, to, subject, text, html });
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    console.error('[email] Falló envío a', to, '-', err?.message || err);
    return { ok: false, error: err?.message || String(err) };
  }
}

function notificacionHtml({ titulo, mensaje, categoria }) {
  const safeTitulo = String(titulo).replace(/</g, '&lt;');
  const safeMensaje = String(mensaje).replace(/</g, '&lt;').replace(/\n/g, '<br>');
  const safeCategoria = String(categoria || 'sistema').replace(/</g, '&lt;');
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f6f5;font-family:Arial,sans-serif;color:#2c3a32;">
  <div style="max-width:560px;margin:24px auto;background:#fff;border:1px solid #d8e8df;border-radius:8px;overflow:hidden;">
    <div style="background:#3A6048;color:#fff;padding:14px 20px;font-weight:700;font-size:15px;">
      Centro Cultural Lucy Tejada
    </div>
    <div style="padding:20px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#5a8a6e;margin-bottom:6px;">${safeCategoria}</div>
      <h2 style="margin:0 0 10px;font-size:18px;color:#1E2D26;">${safeTitulo}</h2>
      <p style="margin:0;font-size:14px;line-height:1.5;color:#2c3a32;">${safeMensaje}</p>
    </div>
    <div style="background:#f4f6f5;color:#4a5a52;padding:12px 20px;font-size:11px;">
      Este es un mensaje automático. Para revisar tus notificaciones, ingresa a la plataforma.
    </div>
  </div>
</body></html>`;
}

export async function enviarEmailNotificacion({ correo, titulo, mensaje, categoria }) {
  return sendEmail({
    to: correo,
    subject: `[Lucy Tejada] ${titulo}`,
    text: `${titulo}\n\n${mensaje}`,
    html: notificacionHtml({ titulo, mensaje, categoria }),
  });
}
