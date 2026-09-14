"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const UNIDADES = ["piezas", "gramos", "ml", "litros"];
const CATEGORIAS = ["Desayuno", "Comida", "Cena", "Snack"];

export default function RecetaEditForm({
  id,
  nombreInicial,
  categoriaInicial,
  tiempoInicial,
  ingredientesIniciales,
}) {
  const router = useRouter();
  const [nombre, setNombre] = useState(nombreInicial);
  const [categoria, setCategoria] = useState(categoriaInicial);
  const [tiempo, setTiempo] = useState(tiempoInicial);
  const [ingredientes, setIngredientes] = useState(ingredientesIniciales);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  function actualizarIngrediente(i, campo, valor) {
    setIngredientes((prev) => {
      const copia = [...prev];
      copia[i] = { ...copia[i], [campo]: valor };
      return copia;
    });
  }

  function agregarFila() {
    setIngredientes((prev) => [...prev, { nombre: "", cantidad: "", unidad: "piezas" }]);
  }

  function quitarFila(i) {
    setIngredientes((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function guardar(e) {
    e.preventDefault();
    setError("");

    if (!nombre.trim()) {
      setError("Ponle un nombre a la receta.");
      return;
    }

    const ingredientesValidos = ingredientes.filter((i) => i.nombre.trim() && i.cantidad);

    setGuardando(true);
    const res = await fetch(`/api/recetas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        categoria,
        tiempo: Number(tiempo),
        ingredientes: ingredientesValidos.map((i) => ({
          nombre: i.nombre,
          cantidad: Number(i.cantidad),
          unidad: i.unidad,
        })),
      }),
    });
    setGuardando(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Algo falló al guardar.");
      return;
    }

    router.push("/recetas");
    router.refresh();
  }

  return (
    <form onSubmit={guardar}>
      <div className="form-field">
        <label className="row-sub">Nombre de la receta</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>

      <div className="form-row-2">
        <div className="form-field">
          <label className="row-sub">Categoría</label>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label className="row-sub">Tiempo (min)</label>
          <input
            type="number"
            value={tiempo}
            onChange={(e) => setTiempo(e.target.value)}
          />
        </div>
      </div>

      <label className="row-sub">Ingredientes</label>
      {ingredientes.map((ing, i) => (
        <div key={i} className="ingrediente-row">
          <input
            type="text"
            placeholder="Ingrediente"
            value={ing.nombre}
            onChange={(e) => actualizarIngrediente(i, "nombre", e.target.value)}
            className="ing-nombre"
          />
          <input
            type="number"
            placeholder="Cant."
            value={ing.cantidad}
            onChange={(e) => actualizarIngrediente(i, "cantidad", e.target.value)}
            className="ing-cantidad"
          />
          <select
            value={ing.unidad}
            onChange={(e) => actualizarIngrediente(i, "unidad", e.target.value)}
            className="ing-unidad"
          >
            {UNIDADES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-ghost btn-quitar"
            onClick={() => quitarFila(i)}
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        className="btn btn-secondary"
        style={{ marginTop: 10 }}
        onClick={agregarFila}
      >
        + Ingrediente
      </button>

      {error && (
        <p style={{ color: "#b03a2e", marginTop: 12, fontSize: "0.9rem" }}>{error}</p>
      )}

      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <button type="submit" className="btn btn-primary" disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => router.push("/recetas")}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}