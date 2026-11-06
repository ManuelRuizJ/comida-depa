"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Clock, Undo2 } from "lucide-react";
import { useToast } from "./ToastProvider";
import { formatearCantidad as fmt } from "@/lib/compras";

export default function ItemHoy({ item }) {
  const router = useRouter();
  const { toast } = useToast();
  const [comido, setComido] = useState(item.comido);
  const [cargando, setCargando] = useState(false);

  const platillo = item.platillos;
  const ingredientes = platillo?.receta_ingredientes || [];

  async function marcar(valor) {
    setCargando(true);
    const res = await fetch("/api/comido", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, comido: valor }),
    }).catch(() => null);
    setCargando(false);

    if (!res?.ok) {
      toast("No se pudo guardar. Revisa la conexión e intenta de nuevo.", "error");
      return;
    }

    const { ajustados = 0 } = await res.json().catch(() => ({}));
    setComido(valor);
    if (ajustados > 0) {
      toast(
        valor
          ? "Marcado como comido. Se descontó del inventario."
          : "De vuelta a pendiente. Se regresó al inventario."
      );
    } else {
      toast(valor ? "Marcado como comido" : "De vuelta a pendiente");
    }
    router.refresh();
  }

  return (
    <article className="platillo-hoy">
      <div className="platillo-hoy-head">
        <div>
          <h3 className="platillo-hoy-nombre">{platillo?.nombre}</h3>
          <div className="meta">
            {platillo?.tiempo_min > 0 && (
              <span>
                <Clock size={14} aria-hidden="true" />
                {platillo.tiempo_min} min
              </span>
            )}
            <span>
              {ingredientes.length === 1 ? "1 ingrediente" : `${ingredientes.length} ingredientes`}
            </span>
          </div>
        </div>

        <div className="platillo-hoy-acciones">
          {comido ? (
            <>
              <span className="badge badge-ok">Comido</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => marcar(false)}
                disabled={cargando}
              >
                {cargando ? <span className="spinner" /> : <Undo2 size={16} aria-hidden="true" />}
                Deshacer
              </button>
            </>
          ) : (
            <>
              <Link href="/menu" className="btn btn-ghost btn-sm">
                Cambiar
              </Link>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => marcar(true)}
                disabled={cargando}
              >
                {cargando ? <span className="spinner" /> : <Check size={16} aria-hidden="true" />}
                Lo comimos
              </button>
            </>
          )}
        </div>
      </div>

      {ingredientes.length > 0 && (
        <ul className="ingredientes-mini" aria-label={`Ingredientes de ${platillo?.nombre}`}>
          {ingredientes.map((ri, i) => (
            <li key={ri.ingredientes?.id ?? i}>
              {ri.ingredientes?.nombre} <b>{fmt(ri.cantidad_requerida)}</b>{" "}
              {ri.ingredientes?.unidad}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
