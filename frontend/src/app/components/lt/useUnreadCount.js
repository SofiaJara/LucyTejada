"use client";
import { useEffect, useState } from "react";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/lib/AuthContext";

// Sondea notificaciones y devuelve el conteo de no leídas. Refresca cada 60s
// y al cambiar de ruta (vía el listener 'lt:notifs-changed' que disparan las
// pantallas que marcan notificaciones como leídas).
export default function useUnreadCount() {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const cargar = () =>
      api("/api/notificaciones")
        .then((ns) => { if (!cancelled) setUnread(ns.filter((n) => !n.leida).length); })
        .catch(() => {});
    cargar();
    const id = setInterval(cargar, 60000);
    const onChange = () => cargar();
    window.addEventListener("lt:notifs-changed", onChange);
    return () => {
      cancelled = true;
      clearInterval(id);
      window.removeEventListener("lt:notifs-changed", onChange);
    };
  }, [user]);

  return unread;
}
