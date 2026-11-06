"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, X } from "lucide-react";
import { useToast } from "./ToastProvider";
import ModalPlatillos from "./ModalPlatillos";
import { DIAS_SEMANA as DIAS } from "@/lib/fecha";

function seleccionDe(menu) {
  const sel = {};
  DIAS.forEach((dia) => {
    sel[dia] = new Set(menu.filter((m) => m.dia === dia).map((m) => m.platillo_id));
  });
  return sel;
}

export default function MenuForm({ platillos, menuActual, hoy }) {
  const router = useRouter();
  const { toast } = useToast();

  const [seleccion, setSeleccion] = useState(() => seleccionDe(menuActual));
  const [guardando, setGuardando] = useState(false);
  const [modalDia, setModalDia] = useState(null);

  const platillosPorId = useMemo(() => new Map(platillos.map((p) => [p.id, p])), [platillos]);

  const comidos = useMemo(
    () => new Set(menuActual.filter((m) => m.comido).map((m) => `${m.dia}:${m.platillo_id}`)),
    [menuActual]
  );

  const original = useMemo(() => seleccionDe(menuActual), [menuActual]);

  const hayCambios = DIAS.some((dia) => {
    const a = original[dia];
    const b = seleccion[dia];
    return a.size !== b.size || [...b].some((id) => !a.has(id));
  });

  function cambiar(dia, platilloId, agregar) {
    setSeleccion((prev) => {
      const nuevo = new Set(prev[dia]);
      if (agregar ?? !nuevo.has(platilloId)) nuevo.add(platilloId);
      else nuevo.delete(platilloId);
      return { ...prev, [dia]: nuevo };
    });
  }

  async function guardar() {
    setGuardando(true);
    const res = await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dias: DIAS.map((dia) => ({ dia, platillo_ids: [...seleccion[dia]] })),
      }),
    }).catch(() => null);
    setGuardando(false);

    if (!res?.ok) {
      toast("No se pudo guardar el menú. Intenta de nuevo.", "error");
      return;
    }
    toast("Menú guardado");
    router.refresh();
  }

  return (
    <>
      <div className="tablero">
        {DIAS.map((dia) => {
          const ids = [...seleccion[dia]].filter((id) => platillosPorId.has(id));
          return (
            <section key={dia} className="tablero-dia" data-hoy={dia === hoy} aria-label={dia}>
              <div className="tablero-dia-head">
                <h2>
                  {dia}
                  {dia === hoy && <span className="sr-only"> (hoy)</span>}
                </h2>
                {dia === hoy ? (
                  <span className="badge badge-ok badge-sin-punto">Hoy</span>
                ) : (
                  ids.length > 0 && <span className="conteo">{ids.length}</span>
                )}
              </div>

              {ids.length === 0 ? (
                <p className="tablero-vacio" style={{ padding: "12px 14px 4px" }}>
                  Sin platillos
                </p>
              ) : (
                <ul className="tablero-platillos">
                  {ids.map((id) => {
                    const comido = comidos.has(`${dia}:${id}`);
                    return (
                      <li key={id} className="tablero-platillo">
                        {comido && <Check size={15} className="icono-comido" aria-label="Comido" />}
                        <span>{platillosPorId.get(id).nombre}</span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => cambiar(dia, id, false)}
                          aria-label={`Quitar ${platillosPorId.get(id).nombre} del ${dia}`}
                        >
                          <X size={15} aria-hidden="true" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <button
                type="button"
                className="btn btn-secondary btn-sm tablero-agregar"
                onClick={() => setModalDia(dia)}
              >
                <Plus size={15} aria-hidden="true" />
                Agregar
              </button>
            </section>
          );
        })}
      </div>

      {modalDia && (
        <ModalPlatillos
          dia={modalDia}
          platillos={platillos}
          seleccionados={seleccion[modalDia]}
          onToggle={(id) => cambiar(modalDia, id)}
          onClose={() => setModalDia(null)}
        />
      )}

      {(hayCambios || guardando) && (
        <div className="guardar-bar" role="region" aria-label="Cambios sin guardar">
          <span className="guardar-bar-texto">
            {guardando ? "Guardando…" : "Cambios sin guardar"}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setSeleccion(seleccionDe(menuActual))}
            disabled={guardando}
          >
            Descartar
          </button>
          <button className="btn btn-primary btn-sm" onClick={guardar} disabled={guardando}>
            {guardando ? <span className="spinner" /> : "Guardar menú"}
          </button>
        </div>
      )}
    </>
  );
}
