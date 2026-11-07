import { supabase } from "./supabase";
import { ajustarPorComido } from "./inventario.mjs";

/**
 * Marca un platillo del menú como comido (o lo regresa a pendiente) y
 * ajusta el inventario con los ingredientes de su receta.
 *
 * El update solo aplica si el valor realmente cambia (`.eq("comido", !comido)`),
 * así un doble clic o el link del correo abierto dos veces no descuentan
 * dos veces.
 *
 * @returns {{ error?, cambiado: boolean, ajustados: number }}
 */
export async function marcarComido(id, comido) {
  const { data: filas, error } = await supabase
    .from("menu_semana")
    .update({ comido })
    .eq("id", id)
    .eq("comido", !comido)
    .select("platillo_id");

  if (error) return { error, cambiado: false, ajustados: 0 };
  if (!filas || filas.length === 0) return { cambiado: false, ajustados: 0 };

  const { data: receta, error: errReceta } = await supabase
    .from("receta_ingredientes")
    .select("ingrediente_id, cantidad_requerida")
    .eq("platillo_id", filas[0].platillo_id);
  if (errReceta) return { error: errReceta, cambiado: true, ajustados: 0 };

  const ids = [...new Set(receta.map((r) => r.ingrediente_id))];
  if (ids.length === 0) return { cambiado: true, ajustados: 0 };

  const { data: inventario, error: errInv } = await supabase
    .from("inventario")
    .select("ingrediente_id, cantidad_actual, cantidad_minima")
    .in("ingrediente_id", ids);
  if (errInv) return { error: errInv, cambiado: true, ajustados: 0 };

  const stock = Object.fromEntries(inventario.map((i) => [i.ingrediente_id, i.cantidad_actual]));
  const minima = Object.fromEntries(inventario.map((i) => [i.ingrediente_id, i.cantidad_minima]));
  const ajustes = ajustarPorComido(receta, stock, comido ? -1 : 1);
  if (ajustes.length === 0) return { cambiado: true, ajustados: 0 };

  const ahora = new Date().toISOString();
  const { error: errUpd } = await supabase.from("inventario").upsert(
    ajustes.map((a) => ({
      ...a,
      // upsert manda la fila completa; sin la mínima chocaría con NOT NULL.
      cantidad_minima: minima[a.ingrediente_id],
      updated_at: ahora,
    })),
    { onConflict: "ingrediente_id" }
  );
  if (errUpd) return { error: errUpd, cambiado: true, ajustados: 0 };

  return { cambiado: true, ajustados: ajustes.length };
}
