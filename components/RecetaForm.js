"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const UNIDADES = ["piezas", "gramos", "ml", "litros"];
const CATEGORIAS = ["Desayuno", "Comida", "Cena", "Snack"];

export default function RecetaForm() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("Comida");
  const [tiempo, setTiempo] = useState(20);
  const [ingredientes, setIngredientes] = useState([{ nombre: "", cantidad: "", unidad: "piezas" }]);
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
    const res = await fetch("/api/recetas", {
      method: "POST",
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

    setNombre("");
    setTiempo(20);
    setIngredientes([{ nombre: "", cantidad: "", unidad: "piezas" }]);
    router.refresh();
  }

  return (
    <form onSubmit={guardar}>
      <div style={{ marginBottom: 12 }}>
        <label className="row-sub">Nombre de la receta</label>
        <br />
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="ej. Chilaquiles"
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--line)" }}
        />
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label className="row-sub">Categoría</label>
          <br />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--line)" }}
          >
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label className="row-sub">Tiempo (min)</label>
          <br />
          <input
            type="number"
            value={tiempo}
            onChange={(e) => setTiempo(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--line)" }}
          />
        </div>
      </div>

      <label className="row-sub">Ingredientes</label>
      {ingredientes.map((ing, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input
            type="text"
            placeholder="Ingrediente"
            value={ing.nombre}
            onChange={(e) => actualizarIngrediente(i, "nombre", e.target.value)}
            style={{ flex: 2, padding: 8, borderRadius: 8, border: "1px solid var(--line)" }}
          />
          <input
            type="number"
            placeholder="Cant."
            value={ing.cantidad}
            onChange={(e) => actualizarIngrediente(i, "cantidad", e.target.value)}
            style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid var(--line)" }}
          />
          <select
            value={ing.unidad}
            onChange={(e) => actualizarIngrediente(i, "unidad", e.target.value)}
            style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid var(--line)" }}
          >
            {UNIDADES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <button type="button" className="btn btn-ghost" onClick={() => quitarFila(i)}>
            ✕
          </button>
        </div>
      ))}

      <button type="button" className="btn btn-secondary" style={{ marginTop: 10 }} onClick={agregarFila}>
        + Ingrediente
      </button>

      {error && (
        <p style={{ color: "#b03a2e", marginTop: 12, fontSize: "0.9rem" }}>{error}</p>
      )}

      <div style={{ marginTop: 20 }}>
        <button type="submit" className="btn btn-primary" disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar receta"}
        </button>
      </div>
    </form>
  );
}