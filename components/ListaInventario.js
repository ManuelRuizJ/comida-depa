"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Plus, Search } from "lucide-react";
import { useToast } from "./ToastProvider";
import FilaInventario from "./FilaInventario";
import NuevoIngredienteForm from "./NuevoIngredienteForm";
import { necesitaComprar } from "@/lib/inventario";

function valoresDe(items) {
  const v = {};
  items.forEach((item) => {
    v[item.ingrediente_id] = {
      cantidad_actual: item.cantidad_actual,
      cantidad_minima: item.cantidad_minima,
    };
  });
  return v;
}

function cambio(item, v) {
  return (
    v &&
    (Number(v.cantidad_actual) !== Number(item.cantidad_actual) ||
      Number(v.cantidad_minima) !== Number(item.cantidad_minima))
  );
}

export default function ListaInventario({ items, usosPorIngrediente }) {
  const router = useRouter();
  const { toast } = useToast();

  const [valores, setValores] = useState(() => valoresDe(items));
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [nuevoAbierto, setNuevoAbierto] = useState(false);

  // Al refrescar desde el servidor (otro ingrediente, guardado), conservar lo
  // que se está editando y agregar lo nuevo.
  const [itemsPrevios, setItemsPrevios] = useState(items);
  if (items !== itemsPrevios) {
    setItemsPrevios(items);
    setValores((prev) => ({ ...valoresDe(items), ...prev }));
  }

  const cambios = items.filter((item) => cambio(item, valores[item.ingrediente_id]));
  const totalFaltantes = items.filter(necesitaComprar).length;

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return items.filter(
      (item) =>
        (!q || item.nombre.toLowerCase().includes(q)) &&
        (filtro !== "faltantes" || necesitaComprar(item))
    );
  }, [items, busqueda, filtro]);

  function cambiar(id, campo, valor) {
    setValores((prev) => ({ ...prev, [id]: { ...prev[id], [campo]: valor } }));
  }

  async function guardarTodo() {
    const lote = cambios.map((item) => ({
      id: item.ingrediente_id,
      cantidad_actual: Number(valores[item.ingrediente_id].cantidad_actual),
      cantidad_minima: Number(valores[item.ingrediente_id].cantidad_minima),
    }));

    if (
      lote.some((c) => !Number.isFinite(c.cantidad_actual) || !Number.isFinite(c.cantidad_minima))
    ) {
      toast("Hay cantidades vacías o que no son números.", "error");
      return;
    }

    setGuardando(true);
    const res = await fetch("/api/inventario", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cambios: lote }),
    }).catch(() => null);
    setGuardando(false);

    if (!res?.ok) {
      toast("No se pudieron guardar los cambios. Intenta de nuevo.", "error");
      return;
    }

    toast(lote.length === 1 ? "1 cambio guardado" : `${lote.length} cambios guardados`);
    setValores((prev) => {
      const sig = { ...prev };
      lote.forEach((c) => delete sig[c.id]);
      return sig;
    });
    router.refresh();
  }

  return (
    <>
      <div className="toolbar">
        <label className="input-buscar">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Buscar ingrediente</span>
          <input
            type="search"
            className="input"
            placeholder="Buscar ingrediente"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </label>
        <div className="segmented" role="group" aria-label="Filtrar">
          <button
            type="button"
            aria-pressed={filtro === "todos"}
            onClick={() => setFiltro("todos")}
          >
            Todos<span className="conteo">{items.length}</span>
          </button>
          <button
            type="button"
            aria-pressed={filtro === "faltantes"}
            onClick={() => setFiltro("faltantes")}
          >
            Por comprar<span className="conteo">{totalFaltantes}</span>
          </button>
        </div>
        {!nuevoAbierto && (
          <button type="button" className="btn btn-secondary" onClick={() => setNuevoAbierto(true)}>
            <Plus size={16} aria-hidden="true" />
            Agregar ingrediente
          </button>
        )}
      </div>

      {nuevoAbierto && <NuevoIngredienteForm onCerrar={() => setNuevoAbierto(false)} />}

      <div className="panel inv-tabla">
        <div className="inv-encabezado" aria-hidden="true">
          <span>Ingrediente</span>
          <span>Estado</span>
          <span className="der">Hay</span>
          <span className="der">Mínimo</span>
          <span />
        </div>

        {visibles.length === 0 && (
          <div className="vacio">
            <Package size={28} aria-hidden="true" />
            <strong>{items.length === 0 ? "El inventario está vacío" : "Sin resultados"}</strong>
            <p>
              {items.length === 0
                ? "Agrega el primer ingrediente con el botón de arriba."
                : busqueda
                  ? "Ningún ingrediente coincide con la búsqueda."
                  : "No hay nada por comprar."}
            </p>
          </div>
        )}

        {visibles.map((item) => (
          <FilaInventario
            key={item.ingrediente_id}
            item={item}
            usos={usosPorIngrediente[item.ingrediente_id] || 0}
            valores={valores[item.ingrediente_id] ?? item}
            cambiado={cambio(item, valores[item.ingrediente_id])}
            onChange={(campo, valor) => cambiar(item.ingrediente_id, campo, valor)}
            onBorrado={() => router.refresh()}
          />
        ))}
      </div>

      {(cambios.length > 0 || guardando) && (
        <div className="guardar-bar" role="region" aria-label="Cambios sin guardar">
          <span className="guardar-bar-texto">
            {guardando
              ? "Guardando…"
              : cambios.length === 1
                ? "1 cambio sin guardar"
                : `${cambios.length} cambios sin guardar`}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setValores(valoresDe(items))}
            disabled={guardando}
          >
            Descartar
          </button>
          <button className="btn btn-primary btn-sm" onClick={guardarTodo} disabled={guardando}>
            {guardando ? <span className="spinner" /> : "Guardar"}
          </button>
        </div>
      )}
    </>
  );
}
