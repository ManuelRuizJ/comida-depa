"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastProvider";
import { CATEGORIAS_PLATILLO as CATEGORIAS, UNIDADES } from "@/lib/constantes";
import { claveNombre } from "@/lib/ingredientes";

const filaVacia = () => ({ nombre: "", cantidad: "", unidad: "piezas" });

// Sirve para crear (sin `receta`) y para editar (con `receta`).
// `catalogo` son los ingredientes que ya existen: se sugieren al escribir y,
// si se elige uno, se usa su unidad (es la que lleva el inventario).
export default function RecetaForm({ receta, catalogo = [] }) {
  const editando = Boolean(receta?.id);
  const { toast } = useToast();
  const router = useRouter();

  const [nombre, setNombre] = useState(receta?.nombre ?? "");
  const [categoria, setCategoria] = useState(receta?.categoria ?? "Comida");
  const [tiempo, setTiempo] = useState(receta?.tiempo ?? 20);
  const [ingredientes, setIngredientes] = useState(
    receta?.ingredientes?.length ? receta.ingredientes : [filaVacia()],
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const catalogoPorClave = useMemo(
    () => new Map(catalogo.map((i) => [claveNombre(i.nombre), i])),
    [catalogo],
  );

  function actualizarIngrediente(i, campo, valor) {
    setIngredientes((prev) => {
      const copia = [...prev];
      copia[i] = { ...copia[i], [campo]: valor };
      return copia;
    });
  }

  function agregarFila() {
    setIngredientes((prev) => [...prev, filaVacia()]);
  }

  function quitarFila(i) {
    setIngredientes((prev) => prev.filter((_, idx) => idx !== i));
  }

  function limpiar() {
    setNombre("");
    setCategoria("Comida");
    setTiempo(20);
    setIngredientes([filaVacia()]);
  }

  async function guardar(e) {
    e.preventDefault();
    setError("");

    if (!nombre.trim()) {
      setError("Ponle un nombre a la receta.");
      return;
    }

    const ingredientesValidos = ingredientes.filter(
      (i) => i.nombre.trim() && Number(i.cantidad) > 0,
    );

    setGuardando(true);
    const res = await fetch(editando ? `/api/recetas/${receta.id}` : "/api/recetas", {
      method: editando ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: nombre.trim(),
        categoria,
        tiempo: Number(tiempo) || null,
        ingredientes: ingredientesValidos.map((i) => ({
          nombre: i.nombre.trim(),
          cantidad: Number(i.cantidad),
          unidad: i.unidad,
        })),
      }),
    });
    setGuardando(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(data.error || "Algo falló al guardar", "error");
      return;
    }

    if (editando) {
      toast("Cambios guardados");
      router.push("/recetas");
    } else {
      toast("Receta guardada");
      limpiar();
    }
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
          placeholder="ej. Chilaquiles"
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
          <input type="number" min="0" value={tiempo} onChange={(e) => setTiempo(e.target.value)} />
        </div>
      </div>

      <label className="row-sub">Ingredientes</label>
      <datalist id="catalogo-ingredientes">
        {catalogo.map((i) => (
          <option key={i.nombre} value={i.nombre} />
        ))}
      </datalist>
      {ingredientes.map((ing, i) => {
        const existente = catalogoPorClave.get(claveNombre(ing.nombre));
        const unidad = existente?.unidad ?? ing.unidad;
        return (
          <div key={i} className="ingrediente-row">
            <input
              type="text"
              placeholder="Ingrediente"
              list="catalogo-ingredientes"
              autoComplete="off"
              value={ing.nombre}
              onChange={(e) => actualizarIngrediente(i, "nombre", e.target.value)}
              className="ing-nombre"
            />
            <input
              type="number"
              min="0"
              step="any"
              placeholder="Cant."
              value={ing.cantidad}
              onChange={(e) => actualizarIngrediente(i, "cantidad", e.target.value)}
              className="ing-cantidad"
            />
            <select
              value={unidad}
              onChange={(e) => actualizarIngrediente(i, "unidad", e.target.value)}
              className="ing-unidad"
              disabled={Boolean(existente)}
              title={existente ? "Unidad del inventario" : undefined}
            >
              {/* Si el ingrediente ya tenía una unidad fuera de la lista, se respeta. */}
              {(UNIDADES.includes(unidad) ? UNIDADES : [unidad, ...UNIDADES]).map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-ghost btn-quitar"
              onClick={() => quitarFila(i)}
              aria-label="Quitar ingrediente"
            >
              ✕
            </button>
          </div>
        );
      })}

      <button
        type="button"
        className="btn btn-secondary"
        style={{ marginTop: 10 }}
        onClick={agregarFila}
      >
        + Ingrediente
      </button>

      {error && <p className="texto-error">{error}</p>}

      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <button type="submit" className="btn btn-primary" disabled={guardando}>
          {guardando ? (
            <span className="spinner" />
          ) : editando ? (
            "Guardar cambios"
          ) : (
            "Guardar receta"
          )}
        </button>
        {editando && (
          <button type="button" className="btn btn-ghost" onClick={() => router.push("/recetas")}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
