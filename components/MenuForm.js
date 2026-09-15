"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastProvider";

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

  function toggle(dia, platilloId) {
    setSeleccion((prev) => {
      const copia = { ...prev, [dia]: new Set(prev[dia]) };
      if (copia[dia].has(platilloId)) {
        copia[dia].delete(platilloId);
      } else {
        copia[dia].add(platilloId);
      }
      return copia;
    });
  }

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
      {DIAS.map((dia) => (
        <div className="day-block" key={dia}>
          <div className="day-title">{dia}</div>
          <div className="chip-row">
            {platillos.map((p) => {
              const activo = seleccion[dia].has(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`chip ${activo ? "selected" : ""}`}
                  onClick={() => toggle(dia, p.id)}
                >
                  {p.nombre}
                </button>
              );
            })}
            {platillos.length === 0 && (
              <span className="row-sub">No hay platillos cargados todavía.</span>
            )}
          </div>
        </div>
      ))}

      <button
        className="btn btn-primary"
        onClick={guardar}
        disabled={guardando}
      >
        {guardando ? <span className="spinner" /> : "Guardar menú"}
      </button>
    </div>
  );
}