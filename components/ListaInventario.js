"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastProvider";
import FilaInventario from "./FilaInventario";

export default function ListaInventario({ items, usosPorIngrediente }) {
  const router = useRouter();
  const { toast } = useToast();

  const [valores, setValores] = useState(() => {
    const init = {};
    items.forEach((item) => {
      init[item.ingrediente_id] = {
        cantidad_actual: item.cantidad_actual,
        cantidad_minima: item.cantidad_minima,
      };
    });
    return init;
  });

  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");

  const hayCambios = useMemo(() => {
    return items.some((item) => {
      const v = valores[item.ingrediente_id];
      if (!v) return false;
      return (
        Number(v.cantidad_actual) !== Number(item.cantidad_actual) ||
        Number(v.cantidad_minima) !== Number(item.cantidad_minima)
      );
    });
  }, [items, valores]);

  function cambiar(id, campo, valor) {
    setValores((prev) => ({
      ...prev,
      [id]: { ...prev[id], [campo]: valor },
    }));
  }

  async function guardarTodo() {
    setGuardando(true);

    const cambios = items
      .map((item) => {
        const v = valores[item.ingrediente_id];
        if (!v) return null;
        const ca = Number(v.cantidad_actual);
        const cm = Number(v.cantidad_minima);
        if (
          ca === Number(item.cantidad_actual) &&
          cm === Number(item.cantidad_minima)
        ) {
          return null;
        }
        return { id: item.ingrediente_id, cantidad_actual: ca, cantidad_minima: cm };
      })
      .filter(Boolean);

    if (cambios.length === 0) {
      setGuardando(false);
      toast("Nada que guardar");
      return;
    }

    const res = await fetch("/api/inventario", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cambios }),
    });

    setGuardando(false);

    if (!res.ok) {
      toast("No se pudieron guardar los cambios", "error");
      return;
    }

    toast(
      `${cambios.length} cambio${cambios.length === 1 ? "" : "s"} guardado${cambios.length === 1 ? "" : "s"}`
    );
    router.refresh();
  }

  const itemsFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return items.filter((item) => {
      if (q && !item.nombre.toLowerCase().includes(q)) return false;
      if (filtro === "faltantes" && !item.estado.includes("Comprar")) return false;
      return true;
    });
  }, [items, busqueda, filtro]);

  const totalFaltantes = items.filter((i) => i.estado.includes("Comprar")).length;

  return (
    <div>
      <div className="inv-toolbar">
        <input
          type="text"
          placeholder="Buscar ingrediente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="inv-busqueda"
        />
        <div className="inv-filtros">
          <button
            type="button"
            className={`chip ${filtro === "todos" ? "selected" : ""}`}
            onClick={() => setFiltro("todos")}
          >
            Todos ({items.length})
          </button>
          <button
            type="button"
            className={`chip ${filtro === "faltantes" ? "selected" : ""}`}
            onClick={() => setFiltro("faltantes")}
          >
            Por comprar ({totalFaltantes})
          </button>
        </div>
      </div>

      <div className="card">
        {itemsFiltrados.length === 0 && (
          <p className="empty">
            {busqueda
              ? "Nada coincide con la búsqueda."
              : "No hay ingredientes en este filtro."}
          </p>
        )}
        {itemsFiltrados.map((item) => (
          <FilaInventario
            key={item.id}
            item={item}
            usos={usosPorIngrediente[item.ingrediente_id] || 0}
            valores={valores[item.ingrediente_id]}
            onChange={(campo, valor) =>
              cambiar(item.ingrediente_id, campo, valor)
            }
            onBorrado={() => router.refresh()}
          />
        ))}
      </div>

      {(hayCambios || guardando) && (
        <div className="guardar-bar">
          <span className="guardar-bar-texto">
            {guardando ? "Guardando..." : "Tienes cambios sin guardar"}
          </span>
          <button
            className="btn btn-primary"
            onClick={guardarTodo}
            disabled={guardando}
          >
            {guardando ? <span className="spinner" /> : "Guardar cambios"}
          </button>
        </div>
      )}
    </div>
  );
}