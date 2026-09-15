"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastProvider";

const UNIDADES = ["piezas", "gramos", "ml", "litros", "latas", "rebanadas", "diente"];
const CATEGORIAS = ["Verdura", "Proteína", "Lácteo", "Abarrotes", "Condimento", "Otro"];

export default function NuevoIngredienteForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
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
      setError("Ponle nombre al ingrediente.");
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
    });
    setGuardando(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(data.error || "Algo falló al guardar", "error");
      return;
    }

    toast(`"${nombre}" agregado al inventario`);
    setNombre("");
    setCategoria("Abarrotes");
    setUnidad("piezas");
    setCantidadActual(0);
    setCantidadMinima(1);
    setAbierto(false);
    router.refresh();
  }

  if (!abierto) {
    return (
      <button className="btn btn-secondary" onClick={() => setAbierto(true)}>
        + Agregar ingrediente
      </button>
    );
  }

  return (
    <form onSubmit={guardar}>
      <div className="form-field">
        <label className="row-sub">Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="ej. Jitomate"
          autoFocus
        />
      </div>

      <div className="form-row-2">
        <div className="form-field">
          <label className="row-sub">Categoría</label>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label className="row-sub">Unidad</label>
          <select value={unidad} onChange={(e) => setUnidad(e.target.value)}>
            {UNIDADES.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row-2">
        <div className="form-field">
          <label className="row-sub">Tienes ahora</label>
          <input
            type="number"
            value={cantidadActual}
            onChange={(e) => setCantidadActual(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label className="row-sub">Mínimo (alerta)</label>
          <input
            type="number"
            value={cantidadMinima}
            onChange={(e) => setCantidadMinima(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <p style={{ color: "#b03a2e", marginTop: 12, fontSize: "0.9rem" }}>{error}</p>
      )}

      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <button type="submit" className="btn btn-primary" disabled={guardando}>
          {guardando ? <span className="spinner" /> : "Agregar"}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setAbierto(false);
            setError("");
          }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}