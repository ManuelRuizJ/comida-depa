import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();
  const { nombre, categoria, unidad, cantidad_actual, cantidad_minima } = body;

  if (!nombre || !nombre.trim()) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  }

  if (!unidad || !unidad.trim()) {
    return NextResponse.json({ error: "La unidad es obligatoria" }, { status: 400 });
  }

  // 1. Crear el ingrediente
  const { data: ingrediente, error: errIng } = await supabase
    .from("ingredientes")
    .upsert(
      {
        nombre: nombre.trim(),
        categoria: categoria || null,
        unidad: unidad.trim(),
      },
      { onConflict: "nombre" }
    )
    .select("id")
    .single();

  if (errIng) {
    return NextResponse.json({ error: errIng.message }, { status: 500 });
  }

  // 2. Asegurar la fila de inventario (con cantidad actual y mínima)
  const { error: errInv } = await supabase
    .from("inventario")
    .upsert(
      {
        ingrediente_id: ingrediente.id,
        cantidad_actual: Number(cantidad_actual) || 0,
        cantidad_minima: Number(cantidad_minima) || 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "ingrediente_id" }
    );

  if (errInv) {
    return NextResponse.json({ error: errInv.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: ingrediente.id });
}