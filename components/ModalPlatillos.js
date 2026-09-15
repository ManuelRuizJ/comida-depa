"use client";

import { useState, useMemo } from "react";

const CATEGORIAS = ["Todos", "Desayuno", "Comida", "Cena", "Snack"];

export default function ModalPlatillos({
  dia,
  platillos,
  seleccionados,
  onToggle,
  onClose,
}) {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todos");

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return platillos
      .filter((p) => {
        if (q && !p.nombre.toLowerCase().includes(q)) return false;
        if (categoria !== "Todos" && p.categoria !== categoria) return false;
        return true;
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [platillos, busqueda, categoria]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2 style={{ margin: 0 }}>Agregar a {dia}</h2>
            <p className="row-sub" style={{ margin: "2px 0 0" }}>
              {seleccionados.size} seleccionado
              {seleccionados.size === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            className="modal-cerrar"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <input
            type="text"
            placeholder="Buscar platillo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="inv-busqueda"
            autoFocus
          />

          <div className="inv-filtros" style={{ marginTop: 10 }}>
            {CATEGORIAS.map((c) => (
              <button
                key={c}
                type="button"
                className={`chip ${categoria === c ? "selected" : ""}`}
                onClick={() => setCategoria(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="modal-lista">
            {filtrados.length === 0 && (
              <p className="empty">Nada coincide con el filtro.</p>
            )}
            {filtrados.map((p) => {
              const activo = seleccionados.has(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`modal-item ${activo ? "modal-item-active" : ""}`}
                  onClick={() => onToggle(p.id)}
                >
                  <div>
                    <div className="row-name">{p.nombre}</div>
                    {p.categoria && <div className="row-sub">{p.categoria}</div>}
                  </div>
                  <span className="modal-check">{activo ? "✓" : "+"}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Listo ({seleccionados.size})
          </button>
        </div>
      </div>
    </div>
  );
}