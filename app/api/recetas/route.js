import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();
  const { nombre, categoria, tiempo, ingredientes } = body;

  if (!nombre || !nombre.trim()) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  }

  // 1. Crear (o reusar si ya existe) el platillo
  const { data: platillo, error: errPlatillo } = await supabase
    .from("platillos")
    .upsert({ nombre, categoria, tiempo_min: tiempo }, { onConflict: "nombre" })
    .select("id")
    .single();

  if (errPlatillo) {
    return NextResponse.json({ error: errPlatillo.message }, { status: 500 });
  }

  // 2. Por cada ingrediente: crear si no existe, asegurar fila de inventario, conectar
  for (const ing of ingredientes || []) {
    const { data: ingrediente, error: errIng } = await supabase
      .from("ingredientes")
      .upsert({ nombre: ing.nombre, unidad: ing.unidad }, { onConflict: "nombre" })
      .select("id")
      .single();

    if (errIng) {
      return NextResponse.json({ error: errIng.message }, { status: 500 });
    }

    await supabase
      .from("inventario")
      .upsert(
        { ingrediente_id: ingrediente.id, cantidad_actual: 0, cantidad_minima: 1 },
        { onConflict: "ingrediente_id", ignoreDuplicates: true }
      );

    const { error: errReceta } = await supabase
      .from("receta_ingredientes")
      .upsert(
        {
          platillo_id: platillo.id,
          ingrediente_id: ingrediente.id,
          cantidad_requerida: ing.cantidad,
        },
        { onConflict: "platillo_id,ingrediente_id" }
      );

    if (errReceta) {
      return NextResponse.json({ error: errReceta.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, id: platillo.id });
}