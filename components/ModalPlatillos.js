"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { CATEGORIAS_PLATILLO } from "@/lib/constantes";

const CATEGORIAS = ["Todos", ...CATEGORIAS_PLATILLO];

export default function ModalPlatillos({ dia, platillos, seleccionados, onToggle, onClose }) {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const buscarRef = useRef(null);

  // Escape cierra; el foco arranca en la búsqueda.
  useEffect(() => {
    buscarRef.current?.focus();
    const alTeclear = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", alTeclear);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const conteo = useMemo(() => {
    const c = { Todos: platillos.length };
    platillos.forEach((p) => (c[p.categoria] = (c[p.categoria] || 0) + 1));
    return c;
  }, [platillos]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return platillos.filter(
      (p) =>
        (!q || p.nombre.toLowerCase().includes(q)) &&
        (categoria === "Todos" || p.categoria === categoria)
    );
  }, [platillos, busqueda, categoria]);

  return (
    <div className="modal-fondo" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <h2 id="modal-titulo">Platillos del {dia.toLowerCase()}</h2>
            <p>
              {seleccionados.size === 1 ? "1 seleccionado" : `${seleccionados.size} seleccionados`}
            </p>
          </div>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Cerrar">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="modal-filtros">
          <label className="input-buscar">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">Buscar platillo</span>
            <input
              ref={buscarRef}
              type="search"
              className="input"
              placeholder="Buscar platillo"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </label>
          <div className="segmented" role="group" aria-label="Categoría">
            {CATEGORIAS.filter((c) => conteo[c]).map((c) => (
              <button key={c} type="button" aria-pressed={categoria === c} onClick={() => setCategoria(c)}>
                {c}
                <span className="conteo">{conteo[c]}</span>
              </button>
            ))}
          </div>
        </div>

        <ul className="modal-lista">
          {filtrados.length === 0 && (
            <li className="vacio">
              <strong>Sin resultados</strong>
              <p>Prueba con otra palabra o categoría.</p>
            </li>
          )}
          {filtrados.map((p) => {
            const activo = seleccionados.has(p.id);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  className="modal-item"
                  aria-pressed={activo}
                  onClick={() => onToggle(p.id)}
                >
                  <span className="fila-texto">
                    <span className="fila-titulo">{p.nombre}</span>
                    {p.categoria && <span className="fila-sub">{p.categoria}</span>}
                  </span>
                  <span className="modal-check" aria-hidden="true">
                    <Check size={14} strokeWidth={3} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="modal-pie">
          <button className="btn btn-primary" onClick={onClose}>
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
