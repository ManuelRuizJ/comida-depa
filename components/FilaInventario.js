"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FilaInventario({ item }) {
  const router = useRouter();
  const [cantidad, setCantidad] = useState(item.cantidad_actual);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const faltante = item.estado.includes("Comprar");

  async function guardar() {
    setGuardando(true);
    setGuardado(false);

    const res = await fetch("/api/inventario", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, cantidad_actual: Number(cantidad) }),
    });

    setGuardando(false);

    if (!res.ok) {
      alert("No se pudo guardar, intenta de nuevo.");
      return;
    }

    setGuardado(true);
    setTimeout(() => setGuardado(false), 1500);

    // Trae los datos frescos del servidor
    router.refresh();
  }

  return (
    <div className="row">
      <div>
        <div className="row-name">{item.nombre}</div>
        <div className="row-sub">{item.unidad}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className={`pill ${faltante ? "pill-warn" : "pill-ok"}`}>{item.estado}</span>
        <input
          type="number"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
        />
        <button className="btn btn-secondary" onClick={guardar} disabled={guardando}>
          {guardado ? "✓" : "Guardar"}
        </button>
      </div>
    </div>
  );
}