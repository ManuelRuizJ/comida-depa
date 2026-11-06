"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
      toast("No se pudo marcar, intenta de nuevo", "error");
      return;
    }

    const { ajustados = 0 } = await res.json().catch(() => ({}));
    setComido(valor);
    if (ajustados > 0) {
      toast(valor ? "Comido. Se descontó del inventario" : "Pendiente. Se regresó al inventario");
    } else {
      toast(valor ? "Marcado como comido" : "Marcado como pendiente");
    }
    router.refresh();
  }

  return (
    <div className="item-hoy">
      <div className="row">
        <div className="fila-info">
          <div className="row-name">{platillo?.nombre}</div>
          {platillo?.tiempo_min > 0 && (
            <div className="row-sub">{platillo.tiempo_min} min</div>
          )}
        </div>
        <div className="fila-controles">
          {comido ? (
            <>
              <span className="pill pill-ok">✓ Comido</span>
              <button
                className="btn btn-ghost"
                onClick={() => marcar(false)}
                disabled={cargando}
              >
                {cargando ? <span className="spinner spinner-oscuro" /> : "Deshacer"}
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-primary"
                onClick={() => marcar(true)}
                disabled={cargando}
              >
                {cargando ? <span className="spinner" /> : "Sí, lo comí"}
              </button>
              <Link href="/menu" className="btn btn-ghost">
                Cambiar
              </Link>
            </>
          )}
        </div>
      </div>

      {ingredientes.length > 0 && (
        <details className="item-hoy-receta">
          <summary>Ingredientes ({ingredientes.length})</summary>
          <ul>
            {ingredientes.map((ri, i) => (
              <li key={i}>
                {ri.ingredientes?.nombre} — {fmt(ri.cantidad_requerida)}{" "}
                {ri.ingredientes?.unidad}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
