"use client";

import { useEffect } from "react";
import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-react";

const ICONOS = { ok: CircleCheck, warn: TriangleAlert, error: CircleAlert };

export default function Toast({ id, mensaje, tipo = "ok", onClose }) {
  useEffect(() => {
    const t = setTimeout(() => onClose(id), tipo === "error" ? 6000 : 3500);
    return () => clearTimeout(t);
  }, [id, tipo, onClose]);

  const clase = ICONOS[tipo] ? tipo : "ok";
  const Icono = ICONOS[clase];

  return (
    <div
      className={`toast toast-${clase}`}
      onClick={() => onClose(id)}
      role={clase === "error" ? "alert" : "status"}
    >
      <Icono size={18} aria-hidden="true" />
      <span>{mensaje}</span>
    </div>
  );
}
