import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { DUPLICADO, errorJson, leerJson } from "@/lib/api";
import { limpiarNombre } from "@/lib/ingredientes";
import { guardarIngredientesDeReceta } from "@/lib/recetas";

// POST /api/recetas — crear una receta con sus ingredientes
export async function POST(request) {
  const body = await leerJson(request);
  if (!body) return errorJson("Datos inválidos", 400);

  const { categoria, tiempo, ingredientes } = body;
  const nombre = limpiarNombre(body.nombre);

  if (!nombre) {
    return errorJson("El nombre es obligatorio", 400);
  }

  // Antes era un upsert y, si el nombre ya existía, pisaba la receta
  // guardada y le sumaba ingredientes sin avisar.
  const { data: platillo, error: errPlatillo } = await supabase
    .from("platillos")
    .insert({ nombre, categoria, tiempo_min: tiempo })
    .select("id")
    .single();

  if (errPlatillo?.code === DUPLICADO) {
    return errorJson(`Ya existe una receta llamada "${nombre}". Edítala desde la lista.`, 409);
  }
  if (errPlatillo) {
    return errorJson(errPlatillo.message);
  }

  const errIngredientes = await guardarIngredientesDeReceta(platillo.id, ingredientes);
  if (errIngredientes) {
    // Sin ingredientes la receta quedaría a medias: mejor no dejarla.
    await supabase.from("platillos").delete().eq("id", platillo.id);
    return errorJson(errIngredientes.message);
  }

  return NextResponse.json({ ok: true, id: platillo.id });
}
