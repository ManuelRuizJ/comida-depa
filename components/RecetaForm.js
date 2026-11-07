"use client";

import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, Plus, X } from "lucide-react";
import { useToast } from "./ToastProvider";
import { CATEGORIAS_PLATILLO as CATEGORIAS, UNIDADES, normalizarUnidad } from "@/lib/constantes";
import { claveNombre } from "@/lib/ingredientes";

// `unidadElegida`: la unidad se cambió a mano en el desplegable. Mientras no,
// un ingrediente que ya existe muestra la unidad que tiene en el catálogo.
const filaVacia = () => ({ nombre: "", cantidad: "", unidad: "piezas", unidadElegida: false });

// Sirve para crear (sin `receta`) y para editar (con `receta`).
// `catalogo` son los ingredientes que ya existen: se sugieren al escribir y,
// si se elige uno, se propone su unidad. Cambiarla aquí la cambia también en
// el ingrediente (inventario y demás recetas), porque la unidad es del ingrediente.
export default function RecetaForm({ receta, catalogo = [] }) {
  const editando = Boolean(receta?.id);
  const { toast } = useToast();
  const router = useRouter();
  const id = useId();

  const [nombre, setNombre] = useState(receta?.nombre ?? "");
  const [categoria, setCategoria] = useState(receta?.categoria ?? "Comida");
  const [tiempo, setTiempo] = useState(receta?.tiempo ?? 20);
  const [ingredientes, setIngredientes] = useState(
    receta?.ingredientes?.length ? receta.ingredientes : [filaVacia()]
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const catalogoPorClave = useMemo(
    () => new Map(catalogo.map((i) => [claveNombre(i.nombre), i])),
    [catalogo]
  );

  function actualizarIngrediente(i, campo, valor) {
    setIngredientes((prev) =>
      prev.map((ing, idx) => (idx === i ? { ...ing, [campo]: valor } : ing))
    );
  }

  // Unidad que se muestra y se guarda para una fila.
  function unidadDeFila(ing) {
    const existente = catalogoPorClave.get(claveNombre(ing.nombre));
    return normalizarUnidad(ing.unidadElegida || !existente ? ing.unidad : existente.unidad);
  }

  function quitarFila(i) {
    setIngredientes((prev) =>
      prev.length === 1 ? [filaVacia()] : prev.filter((_, idx) => idx !== i)
    );
  }

  async function guardar(e) {
    e.preventDefault();
    setError("");

    if (!nombre.trim()) {
      setError("Escribe el nombre de la receta.");
      return;
    }

    const validos = ingredientes.filter((i) => i.nombre.trim() && Number(i.cantidad) > 0);
    const incompletos = ingredientes.filter(
      (i) => (i.nombre.trim() && !(Number(i.cantidad) > 0)) || (!i.nombre.trim() && i.cantidad)
    );
    if (incompletos.length > 0) {
      setError("Hay ingredientes sin nombre o sin cantidad. Complétalos o quítalos.");
      return;
    }

    setGuardando(true);
    const res = await fetch(editando ? `/api/recetas/${receta.id}` : "/api/recetas", {
      method: editando ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: nombre.trim(),
        categoria,
        tiempo: Number(tiempo) || null,
        ingredientes: validos.map((i) => ({
          nombre: i.nombre.trim(),
          cantidad: Number(i.cantidad),
          unidad: unidadDeFila(i),
        })),
      }),
    }).catch(() => null);
    setGuardando(false);

    if (!res?.ok) {
      const data = await res?.json().catch(() => ({}));
      setError(data?.error || "No se pudo guardar. Revisa la conexión e intenta de nuevo.");
      return;
    }

    toast(editando ? "Cambios guardados" : `Receta "${nombre.trim()}" creada`);
    router.push("/recetas");
    router.refresh();
  }

  return (
    <form className="panel form-receta" onSubmit={guardar} noValidate>
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
            placeholder="Ej. Chilaquiles verdes"
            autoFocus={!editando}
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
            <label className="field-label" htmlFor={`${id}-tiempo`}>
              Tiempo de preparación (min)
            </label>
            <input
              id={`${id}-tiempo`}
              type="number"
              inputMode="numeric"
              min="0"
              className="input input-num"
              value={tiempo}
              onChange={(e) => setTiempo(e.target.value)}
            />
          </div>
        </div>
      </div>

      <fieldset className="panel-body fields form-seccion">
        <legend className="sr-only">Ingredientes</legend>
        <div className="form-seccion-head">
          <h2>Ingredientes</h2>
          <p>Cantidad para una vez que se cocina.</p>
        </div>

        <datalist id={`${id}-catalogo`}>
          {catalogo.map((i) => (
            <option key={i.nombre} value={i.nombre} />
          ))}
        </datalist>

        <div className="ing-filas">
          <div className="ing-encabezado" aria-hidden="true">
            <span>Ingrediente</span>
            <span>Cantidad</span>
            <span>Unidad</span>
            <span />
          </div>
          {ingredientes.map((ing, i) => {
            const existente = catalogoPorClave.get(claveNombre(ing.nombre));
            const unidad = unidadDeFila(ing);
            const cambiaUnidad = existente && unidad !== normalizarUnidad(existente.unidad);
            const n = i + 1;
            return (
              <div key={i} className="ing-fila">
                <input
                  className="input ing-nombre"
                  placeholder="Ingrediente"
                  list={`${id}-catalogo`}
                  autoComplete="off"
                  value={ing.nombre}
                  onChange={(e) => actualizarIngrediente(i, "nombre", e.target.value)}
                  aria-label={`Ingrediente ${n}`}
                />
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  className="input input-num"
                  placeholder="0"
                  value={ing.cantidad}
                  onChange={(e) => actualizarIngrediente(i, "cantidad", e.target.value)}
                  aria-label={`Cantidad del ingrediente ${n}`}
                />
                <select
                  className="select"
                  value={unidad}
                  onChange={(e) =>
                    setIngredientes((prev) =>
                      prev.map((fila, idx) =>
                        idx === i ? { ...fila, unidad: e.target.value, unidadElegida: true } : fila
                      )
                    )
                  }
                  aria-label={`Unidad del ingrediente ${n}`}
                  aria-describedby={cambiaUnidad ? `${id}-aviso-${i}` : undefined}
                >
                  {(UNIDADES.includes(unidad) ? UNIDADES : [unidad, ...UNIDADES]).map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  onClick={() => quitarFila(i)}
                  aria-label={`Quitar ingrediente ${n}`}
                >
                  <X size={16} aria-hidden="true" />
                </button>
                {cambiaUnidad && (
                  <p id={`${id}-aviso-${i}`} className="ing-aviso">
                    {existente.nombre} pasará de {normalizarUnidad(existente.unidad)} a {unidad} en
                    el inventario y en las demás recetas. Revisa su cantidad en Inventario.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIngredientes((prev) => [...prev, filaVacia()])}
          >
            <Plus size={15} aria-hidden="true" />
            Agregar ingrediente
          </button>
        </div>
      </fieldset>

      <div className="panel-pie fields">
        {error && (
          <p className="texto-error" role="alert">
            <CircleAlert size={16} aria-hidden="true" />
            {error}
          </p>
        )}
        <div className="form-acciones">
          <button type="submit" className="btn btn-primary" disabled={guardando}>
            {guardando ? (
              <span className="spinner" />
            ) : editando ? (
              "Guardar cambios"
            ) : (
              "Crear receta"
            )}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => router.push("/recetas")}>
            Cancelar
          </button>
        </div>
      </div>
    </form>
  );
}
