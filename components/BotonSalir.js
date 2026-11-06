"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

export default function BotonSalir() {
  const [saliendo, setSaliendo] = useState(false);

  async function salir() {
    if (saliendo) return;
    setSaliendo(true);
    try {
      await fetch("/api/login", { method: "DELETE" });
    } finally {
      window.location.replace("/login");
    }
  }

  return (
    <button
      type="button"
      className="btn-salir"
      onClick={salir}
      disabled={saliendo}
      title="Cerrar sesión"
    >
      <LogOut size={16} aria-hidden="true" />
      <span>{saliendo ? "Saliendo…" : "Cerrar sesión"}</span>
    </button>
  );
}
