"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { useToast } from "./ToastProvider";
import { CATEGORIAS_INGREDIENTE as CATEGORIAS, UNIDADES } from "@/lib/constantes";

export default function NuevoIngredienteForm({ onCerrar }) {
  const { toast } = useToast();
  const router = useRouter();
  const id = useId();
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("Abarrotes");
  const [unidad, setUnidad] = useState("piezas");
  const [cantidadActual, setCantidadActual] = useState(0);
  const [cantidadMinima, setCantidadMinima] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function guardar(e) {
    e.preventDefault();
    setError("");

    if (!nombre.trim()) {
      setError("Escribe el nombre del ingrediente.");
      return;
    }

    setGuardando(true);
    const res = await fetch("/api/inventario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        categoria,
        unidad,
        cantidad_actual: Number(cantidadActual) || 0,
        cantidad_minima: Number(cantidadMinima) || 1,
      }),
    }).catch(() => null);
    setGuardando(false);

    if (!res?.ok) {
      const data = await res?.json().catch(() => ({}));
      setError(data?.error || "No se pudo guardar. Intenta de nuevo.");
      return;
    }

    toast(`"${nombre.trim()}" agregado al inventario`);
    onCerrar();
    router.refresh();
  }

  return (
    <form className="panel form-nuevo" onSubmit={guardar}>
      <div className="panel-head">
        <h2>Nuevo ingrediente</h2>
      </div>
      <div className="panel-body fields">
        <div className="field">
          <label className="field-label" htmlFor={`${id}-nombre`}>
            Nombre
          </label>
          <input
            id={`${id}-nombre`}
            className="input"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Jitomate"
            autoFocus
          />
        </div>

        <div className="fields-2">
          <div className="field">
            <label className="field-label" htmlFor={`${id}-categoria`}>
              Categoría
            </label>
            <select
              id={`${id}-categoria`}
              className="select"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              {CATEGORIAS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor={`${id}-unidad`}>
              Unidad
            </label>
            <select id={`${id}-unidad`} className="select" value={unidad} onChange={(e) => setUnidad(e.target.value)}>
              {UNIDADES.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="fields-2">
          <div className="field">
            <label className="field-label" htmlFor={`${id}-actual`}>
              Hay ahora
            </label>
            <input
              id={`${id}-actual`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              className="input input-num"
              value={cantidadActual}
              onChange={(e) => setCantidadActual(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor={`${id}-minima`}>
              Mínimo
            </label>
            <input
              id={`${id}-minima`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              className="input input-num"
              value={cantidadMinima}
              onChange={(e) => setCantidadMinima(e.target.value)}
              aria-describedby={`${id}-minima-ayuda`}
            />
            <span className="field-ayuda" id={`${id}-minima-ayuda`}>
              Con esto o menos aparece en &quot;Por comprar&quot;.
            </span>
          </div>
        </div>

        {error && (
          <p className="texto-error" role="alert">
            <CircleAlert size={16} aria-hidden="true" />
            {error}
          </p>
        )}

        <div className="form-acciones">
          <button type="submit" className="btn btn-primary" disabled={guardando}>
            {guardando ? <span className="spinner" /> : "Agregar"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCerrar}>
            Cancelar
          </button>
        </div>
      </div>
    </form>
  );
}
