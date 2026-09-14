import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// PATCH /api/inventario/[ingrediente_id]
// Body: { cantidad_actual, cantidad_minima }
export async function PATCH(request, { params }) {
  const { id } = params; // este es el ingrediente_id
  const body = await request.json();
  const { cantidad_actual, cantidad_minima } = body;

  const actualizada = Number(cantidad_actual);
  const minima = Number(cantidad_minima);

  if (Number.isNaN(actualizada) || Number.isNaN(minima)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { error } = await supabase
    .from("inventario")
    .update({
      cantidad_actual: actualizada,
      cantidad_minima: minima,
      updated_at: new Date().toISOString(),
    })
    .eq("ingrediente_id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/inventario/[ingrediente_id]
// Borra el ingrediente (y por cascada, su inventario y sus recetas)
export async function DELETE(request, { params }) {
  const { id } = params;

  const { error } = await supabase
    .from("ingredientes")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}