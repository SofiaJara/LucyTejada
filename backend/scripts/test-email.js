import dotenv from 'dotenv';
dotenv.config();

import { enviarEmailNotificacion, isEmailEnabled } from '../src/services/email.js';

const destinatario = process.argv[2];
if (!destinatario) {
  console.error('Uso: node scripts/test-email.js correo@destino.com');
  process.exit(1);
}

if (!isEmailEnabled()) {
  console.error('SMTP no está configurado. Revisá tu .env (SMTP_HOST, SMTP_USER, SMTP_PASS).');
  process.exit(1);
}

const res = await enviarEmailNotificacion({
  correo: destinatario,
  titulo: 'Prueba de notificación · Lucy Tejada',
  mensaje: 'Si recibís este correo, la configuración SMTP del backend está funcionando correctamente.',
  categoria: 'sistema',
});

if (res.ok) {
  console.log('Email enviado. messageId:', res.messageId);
  process.exit(0);
} else {
  console.error('Falló el envío:', res.error || res.reason);
  process.exit(1);
}
