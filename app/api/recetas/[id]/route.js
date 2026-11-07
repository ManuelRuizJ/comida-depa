import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { DUPLICADO, errorJson, leerJson } from "@/lib/api";
import { limpiarNombre } from "@/lib/ingredientes";
import { guardarIngredientesDeReceta } from "@/lib/recetas";

// PUT /api/recetas/[id] — editar nombre, categoría, tiempo e ingredientes
export async function PUT(request, { params }) {
  const { id } = params;
  const body = await leerJson(request);
  if (!body) return errorJson("Datos inválidos", 400);

  const { categoria, tiempo, ingredientes } = body;
  const nombre = limpiarNombre(body.nombre);

  if (!nombre) {
    return errorJson("El nombre es obligatorio", 400);
  }

  const { error: errPlatillo } = await supabase
    .from("platillos")
    .update({ nombre, categoria, tiempo_min: tiempo })
    .eq("id", id);

  if (errPlatillo?.code === DUPLICADO) {
    return errorJson(`Ya existe otra receta llamada "${nombre}".`, 409);
  }
  if (errPlatillo) {
    return errorJson(errPlatillo.message);
  }

  const errIngredientes = await guardarIngredientesDeReceta(id, ingredientes, { reemplazar: true });
  if (errIngredientes) {
    return errorJson(errIngredientes.message);
  }

  return NextResponse.json({ ok: true, id });
}

// DELETE /api/recetas/[id]
export async function DELETE(request, { params }) {
  const { id } = params;

  // ON DELETE CASCADE borra automáticamente:
  //   - receta_ingredientes de este platillo
  //   - menu_semana de este platillo (lo quita del menú si estaba)
  const { error } = await supabase.from("platillos").delete().eq("id", id);

  if (error) {
    return errorJson(error.message);
  }

  return NextResponse.json({ ok: true });
}
