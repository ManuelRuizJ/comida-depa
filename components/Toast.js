"use client";

import { useEffect } from "react";

const COLORES = {
  ok: { bg: "#e2e8d9", color: "#3f5636", border: "#a9bd97" },
  warn: { bg: "#fbe9d0", color: "#a67322", border: "#ecc873" },
  error: { bg: "#fde2dd", color: "#b03a2e", border: "#e89b90" },
};

export default function Toast({ id, mensaje, tipo = "ok", onClose }) {
  useEffect(() => {
    const t = setTimeout(() => onClose(id), 3000);
    return () => clearTimeout(t);
  }, [id, onClose]);

  const c = COLORES[tipo] || COLORES.ok;

  return (
    <div
      className="toast"
      style={{
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
      }}
      onClick={() => onClose(id)}
      role="status"
    >
      {tipo === "ok" && "✓ "}
      {tipo === "warn" && "⚠ "}
      {tipo === "error" && "✕ "}
      {mensaje}
    </div>
  );
}