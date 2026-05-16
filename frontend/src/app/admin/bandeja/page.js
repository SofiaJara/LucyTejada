"use client";
import NotificacionesView from "@/app/components/lt/NotificacionesView";

export default function BandejaAdminPage() {
  return (
    <NotificacionesView
      titulo="Bandeja de notificaciones"
      descripcion="Solicitudes recibidas (p. ej. reseteos de contraseña) y avisos dirigidos a tu cuenta."
    />
  );
}
