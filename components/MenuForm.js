"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastProvider";
import ModalPlatillos from "./ModalPlatillos";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

export default function MenuForm({ platillos, menuActual }) {
  const router = useRouter();
  const { toast } = useToast();

  const inicial = {};
  DIAS.forEach((dia) => {
    inicial[dia] = new Set(
      menuActual.filter((m) => m.dia === dia).map((m) => m.platillo_id)
    );
  });

  const [seleccion, setSeleccion] = useState(inicial);
  const [guardando, setGuardando] = useState(false);
  const [modalDia, setModalDia] = useState(null);

  const platillosPorId = useMemo(() => {
    const map = {};
    platillos.forEach((p) => (map[p.id] = p));
    return map;
  }, [platillos]);

  function toggle(dia, platilloId) {
    setSeleccion((prev) => {
      const copia = { ...prev, [dia]: new Set(prev[dia]) };
      if (copia[dia].has(platilloId)) copia[dia].delete(platilloId);
      else copia[dia].add(platilloId);
      return copia;
    });
  }

  function quitar(dia, platilloId) {
    setSeleccion((prev) => {
      const copia = { ...prev, [dia]: new Set(prev[dia]) };
      copia[dia].delete(platilloId);
      return copia;
    });
  }

  const hayCambios = useMemo(() => {
    return DIAS.some((dia) => {
      const original = new Set(
        menuActual.filter((m) => m.dia === dia).map((m) => m.platillo_id)
      );
      const actual = seleccion[dia];
      if (original.size !== actual.size) return true;
      for (const id of actual) if (!original.has(id)) return true;
      return false;
    });
  }, [seleccion, menuActual]);

  async function guardar() {
    setGuardando(true);
    const payload = DIAS.map((dia) => ({
      dia,
      platillo_ids: Array.from(seleccion[dia]),
    }));

    const res = await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dias: payload }),
    });

    setGuardando(false);

    if (!res.ok) {
      toast("No se pudo guardar el menú", "error");
      return;
    }

    toast("Menú guardado");
    router.refresh();
  }

  return (
    <div>
      {DIAS.map((dia) => {
        const seleccionados = Array.from(seleccion[dia]);
        return (
          <div className="day-card" key={dia}>
            <div className="day-head">
              <h3 className="day-title">{dia}</h3>
              {seleccionados.length > 0 && (
                <span className="day-count">
                  {seleccionados.length} platillo
                  {seleccionados.length === 1 ? "" : "s"}
                </span>
              )}
            </div>

            {seleccionados.length === 0 && (
              <p className="row-sub" style={{ margin: "0 0 10px" }}>
                Sin platillos asignados todavía.
              </p>
            )}

            {seleccionados.length > 0 && (
              <div className="day-chips">
                {seleccionados.map((id) => {
                  const p = platillosPorId[id];
                  if (!p) return null;
                  return (
                    <button
                      key={id}
                      type="button"
                      className="chip chip-dia"
                      onClick={() => quitar(dia, id)}
                      title="Quitar"
                    >
                      {p.nombre}
                      <span className="chip-x">✕</span>
                    </button>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              className="btn-agregar"
              onClick={() => setModalDia(dia)}
            >
              + Agregar platillo
            </button>
          </div>
        );
      })}

      {modalDia && (
        <ModalPlatillos
          dia={modalDia}
          platillos={platillos}
          seleccionados={seleccion[modalDia]}
          onToggle={(id) => toggle(modalDia, id)}
          onClose={() => setModalDia(null)}
        />
      )}

      {hayCambios && (
        <div className="guardar-bar">
          <span className="guardar-bar-texto">
            {guardando ? "Guardando..." : "Tienes cambios sin guardar"}
          </span>
          <button
            className="btn btn-primary"
            onClick={guardar}
            disabled={guardando}
          >
            {guardando ? <span className="spinner" /> : "Guardar menú"}
          </button>
        </div>
      )}
    </div>
  );
}