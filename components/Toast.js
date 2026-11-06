"use client";

import { useEffect } from "react";

const ICONOS = { ok: "✓", warn: "⚠", error: "✕" };

export default function Toast({ id, mensaje, tipo = "ok", onClose }) {
  useEffect(() => {
    const t = setTimeout(() => onClose(id), 3000);
    return () => clearTimeout(t);
  }, [id, onClose]);

  const clase = ICONOS[tipo] ? tipo : "ok";

  return (
    <div
      className={`toast toast-${clase}`}
      onClick={() => onClose(id)}
      role={clase === "error" ? "alert" : "status"}
    >
      {ICONOS[clase]} {mensaje}
    </div>
  );
}