"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, Pencil, Search } from "lucide-react";
import BotonBorrarReceta from "./BotonBorrarReceta";
import { CATEGORIAS_PLATILLO } from "@/lib/constantes";

export default function ListaRecetas({ platillos }) {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");

  const conteo = useMemo(() => {
    const c = { Todas: platillos.length };
    platillos.forEach((p) => (c[p.categoria] = (c[p.categoria] || 0) + 1));
    return c;
  }, [platillos]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return platillos.filter(
      (p) =>
        (categoria === "Todas" || p.categoria === categoria) &&
        (!q ||
          p.nombre.toLowerCase().includes(q) ||
          p.receta_ingredientes.some((ri) => ri.ingredientes?.nombre.toLowerCase().includes(q)))
    );
  }, [platillos, busqueda, categoria]);

  if (platillos.length === 0) {
    return (
      <div className="panel vacio">
        <BookOpen size={28} aria-hidden="true" />
        <strong>Todavía no hay recetas</strong>
        <p>Crea la primera con el botón de arriba.</p>
      </div>
    );
  }

  return (
    <>
      <div className="toolbar">
        <label className="input-buscar">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Buscar receta o ingrediente</span>
          <input
            type="search"
            className="input"
            placeholder="Buscar receta o ingrediente"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </label>
        <div className="segmented" role="group" aria-label="Categoría">
          {["Todas", ...CATEGORIAS_PLATILLO]
            .filter((c) => conteo[c])
            .map((c) => (
              <button key={c} type="button" aria-pressed={categoria === c} onClick={() => setCategoria(c)}>
                {c}
                <span className="conteo">{conteo[c]}</span>
              </button>
            ))}
        </div>
      </div>

      {visibles.length === 0 ? (
        <div className="panel vacio">
          <strong>Sin resultados</strong>
          <p>Ninguna receta coincide con la búsqueda.</p>
        </div>
      ) : (
        <div className="recetas-grid">
          {visibles.map((p) => {
            const n = p.receta_ingredientes.length;
            return (
              <article key={p.id} className="panel receta-card">
                <div className="panel-body">
                  <div className="fila-texto">
                    <h2>{p.nombre}</h2>
                    <div className="meta">
                      {p.categoria && <span>{p.categoria}</span>}
                      {p.tiempo_min > 0 && (
                        <span>
                          <Clock size={14} aria-hidden="true" />
                          {p.tiempo_min} min
                        </span>
                      )}
                      <span>{n === 1 ? "1 ingrediente" : `${n} ingredientes`}</span>
                    </div>
                  </div>
                  <p className="receta-ingredientes">
                    {n === 0
                      ? "Sin ingredientes capturados."
                      : p.receta_ingredientes.map((ri) => ri.ingredientes?.nombre).join(", ")}
                  </p>
                </div>
                <div className="panel-pie">
                  <BotonBorrarReceta id={p.id} nombre={p.nombre} />
                  <Link href={`/recetas/${p.id}`} className="btn btn-secondary btn-sm">
                    <Pencil size={14} aria-hidden="true" />
                    Editar
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
