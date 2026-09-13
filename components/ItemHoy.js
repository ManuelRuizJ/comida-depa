"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ItemHoy({ item }) {
  const router = useRouter();
  const [comido, setComido] = useState(item.comido);
  const [cargando, setCargando] = useState(false);

  async function marcar(valor) {
    setCargando(true);
    await fetch("/api/comido", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, comido: valor }),
    });
    setComido(valor);
    setCargando(false);
    router.refresh();
  }

  return (
    <div className="row">
      <div className="fila-info">
        <div className="row-name">{item.platillos?.nombre}</div>
      </div>
      <div className="fila-controles">
        {comido ? (
          <span className="pill pill-ok">✓ Comido</span>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => marcar(true)}
            disabled={cargando}
          >
            Sí, lo comí
          </button>
        )}
        <a href="/menu" className="btn btn-ghost">
          Cambiar
        </a>
      </div>
    </div>
  );
}