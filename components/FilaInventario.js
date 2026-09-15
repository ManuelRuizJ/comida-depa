"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastProvider";

export default function FilaInventario({
  item,
  usos = 0,
  valores,
  onChange,
  onBorrado,
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [borrando, setBorrando] = useState(false);

  const faltante = item.estado.includes("Comprar");
  const cambiado =
    Number(valores.cantidad_actual) !== Number(item.cantidad_actual) ||
    Number(valores.cantidad_minima) !== Number(item.cantidad_minima);

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
    onBorrado?.();
  }

  return (
    <div className={`fila-inventario ${cambiado ? "fila-cambiada" : ""}`}>
      <div className="fila-info">
        <div className="row-name">{item.nombre}</div>
        <div className="row-sub">
          {item.unidad}
          {usos > 0 && ` · ${usos} receta${usos === 1 ? "" : "s"}`}
          {cambiado && <span className="badge-sin-guardar"> · sin guardar</span>}
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
              value={valores.cantidad_actual}
              onChange={(e) => onChange("cantidad_actual", e.target.value)}
            />
          </label>
          <label className="inv-input">
            <span className="inv-label">Mínimo</span>
            <input
              type="number"
              value={valores.cantidad_minima}
              onChange={(e) => onChange("cantidad_minima", e.target.value)}
            />
          </label>
        </div>

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