import { supabase } from "./supabase";
import { claveNombre, prepararIngredientes } from "./ingredientes.mjs";

/**
 * Guarda los ingredientes de una receta.
 *
 * - Reusa ingredientes que ya existen aunque se escriban distinto
 *   ("jitomate" = "Jitomate") y no les cambia la unidad: la unidad es del
 *   ingrediente y la usa el inventario.
 * - Crea los que no existen, con su fila de inventario en 0.
 * - Hace todo en lotes (3 o 4 consultas) en vez de 3 por ingrediente.
 *
 * @param reemplazar  true al editar: borra antes los ingredientes anteriores
 * @returns el error de Supabase, o null si todo salió bien
 */
export async function guardarIngredientesDeReceta(platilloId, ingredientes, { reemplazar = false } = {}) {
  const lista = prepararIngredientes(ingredientes);

  const { data: existentes, error: errExistentes } = await supabase
    .from("ingredientes")
    .select("id, nombre");
  if (errExistentes) return errExistentes;

  const idPorClave = new Map(existentes.map((i) => [claveNombre(i.nombre), i.id]));
  const nuevos = lista.filter((i) => !idPorClave.has(i.clave));

  if (nuevos.length > 0) {
    const { data: creados, error: errNuevos } = await supabase
      .from("ingredientes")
      .insert(nuevos.map(({ nombre, unidad }) => ({ nombre, unidad })))
      .select("id, nombre");
    if (errNuevos) return errNuevos;

    creados.forEach((c) => idPorClave.set(claveNombre(c.nombre), c.id));

    const { error: errInv } = await supabase.from("inventario").upsert(
      creados.map((c) => ({ ingrediente_id: c.id, cantidad_actual: 0, cantidad_minima: 1 })),
      { onConflict: "ingrediente_id", ignoreDuplicates: true }
    );
    if (errInv) return errInv;
  }

  if (reemplazar) {
    const { error: errBorrar } = await supabase
      .from("receta_ingredientes")
      .delete()
      .eq("platillo_id", platilloId);
    if (errBorrar) return errBorrar;
  }

  if (lista.length === 0) return null;

  const { error: errReceta } = await supabase.from("receta_ingredientes").insert(
    lista.map((i) => ({
      platillo_id: platilloId,
      ingrediente_id: idPorClave.get(i.clave),
      cantidad_requerida: i.cantidad,
    }))
  );
  return errReceta;
}
