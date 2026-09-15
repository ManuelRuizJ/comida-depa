"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastProvider";

export default function FilaInventario({ item, usos = 0 }) {
  const router = useRouter();
  const { toast } = useToast();
  const [cantidad, setCantidad] = useState(item.cantidad_actual);
  const [minima, setMinima] = useState(item.cantidad_minima);
  const [guardando, setGuardando] = useState(false);
  const [borrando, setBorrando] = useState(false);

  const faltante = item.estado.includes("Comprar");

  async function guardar() {
    setGuardando(true);

    const res = await fetch(`/api/inventario/${item.ingrediente_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cantidad_actual: Number(cantidad),
        cantidad_minima: Number(minima),
      }),
    });

    setGuardando(false);

    if (!res.ok) {
      toast("No se pudo guardar, intenta de nuevo", "error");
      return;
    }

    toast(`${item.nombre} actualizado`);
    router.refresh();
  }

  async function borrar() {
    let mensaje = `¿Borrar "${item.nombre}" del inventario?`;
    if (usos > 0) {
      mensaje += `\n\n⚠️ Está usado en ${usos} receta(s). También se quitará de ahí.`;
    }
    if (!confirm(mensaje)) return;

    setBorrando(true);
    const res = await fetch(`/api/inventario/${item.ingrediente_id}`, {
      method: "DELETE",
    });
    setBorrando(false);

    if (!res.ok) {
      toast("No se pudo borrar", "error");
      return;
    }

    toast(`"${item.nombre}" borrado`, "warn");
    router.refresh();
  }

  return (
    <div className="fila-inventario">
      <div className="fila-info">
        <div className="row-name">{item.nombre}</div>
        <div className="row-sub">
          {item.unidad}
          {usos > 0 && ` · ${usos} receta${usos === 1 ? "" : "s"}`}
        </div>
      </div>

      <div className="fila-controles">
        <span className={`pill ${faltante ? "pill-warn" : "pill-ok"}`}>
          {item.estado}
        </span>

        <div className="inv-inputs">
          <label className="inv-input">
            <span className="inv-label">Tienes</span>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
            />
          </label>
          <label className="inv-input">
            <span className="inv-label">Mínimo</span>
            <input
              type="number"
              value={minima}
              onChange={(e) => setMinima(e.target.value)}
            />
          </label>
        </div>

        <button
          className="btn btn-secondary"
          onClick={guardar}
          disabled={guardando}
        >
          {guardando ? <span className="spinner" /> : "Guardar"}
        </button>

        <button
          className="btn btn-ghost btn-borrar"
          onClick={borrar}
          disabled={borrando}
          aria-label="Borrar"
        >
          {borrando ? "..." : "✕"}
        </button>
      </div>
    </div>
  );
}