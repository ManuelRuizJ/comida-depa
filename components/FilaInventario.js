"use client";

import { useId, useState } from "react";
import { Trash2 } from "lucide-react";
import { useToast } from "./ToastProvider";
import { necesitaComprar } from "@/lib/inventario";

export default function FilaInventario({ item, usos = 0, valores, cambiado, onChange, onBorrado }) {
  const { toast } = useToast();
  const [borrando, setBorrando] = useState(false);
  const id = useId();

  const faltante = necesitaComprar(item);

  async function borrar() {
    let mensaje = `¿Borrar "${item.nombre}" del inventario?`;
    if (usos > 0) {
      mensaje += `\n\nSe usa en ${usos === 1 ? "1 receta" : `${usos} recetas`} y también se quitará de ahí.`;
    }
    if (!window.confirm(mensaje)) return;

    setBorrando(true);
    const res = await fetch(`/api/inventario/${item.ingrediente_id}`, { method: "DELETE" }).catch(
      () => null
    );
    setBorrando(false);

    if (!res?.ok) {
      toast(`No se pudo borrar "${item.nombre}".`, "error");
      return;
    }
    toast(`"${item.nombre}" borrado`, "warn");
    onBorrado?.();
  }

  return (
    <div className="inv-fila" data-cambiado={cambiado}>
      <div className="inv-nombre fila-texto">
        <span className="fila-titulo" id={`${id}-nombre`}>
          {item.nombre}
        </span>
        <span className="fila-sub">
          {item.unidad}
          {usos > 0 && ` · ${usos === 1 ? "1 receta" : `${usos} recetas`}`}
          {cambiado && <span className="sin-guardar"> · sin guardar</span>}
        </span>
      </div>

      <span className={`inv-estado badge ${faltante ? "badge-warn" : "badge-ok"}`}>
        {faltante ? "Comprar" : "Disponible"}
      </span>

      <div className="inv-cantidades">
        <label className="inv-campo">
          <span>Hay</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            className="input input-num"
            value={valores.cantidad_actual}
            onChange={(e) => onChange("cantidad_actual", e.target.value)}
            aria-label={`Cantidad de ${item.nombre} en ${item.unidad}`}
          />
        </label>
        <label className="inv-campo">
          <span>Mínimo</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            className="input input-num"
            value={valores.cantidad_minima}
            onChange={(e) => onChange("cantidad_minima", e.target.value)}
            aria-label={`Mínimo de ${item.nombre} en ${item.unidad}`}
          />
        </label>
      </div>

      <button
        type="button"
        className="inv-borrar btn btn-ghost btn-peligro btn-icon"
        onClick={borrar}
        disabled={borrando}
        aria-label={`Borrar ${item.nombre}`}
        title="Borrar"
      >
        {borrando ? <span className="spinner" /> : <Trash2 size={16} aria-hidden="true" />}
      </button>
    </div>
  );
}
