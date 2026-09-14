import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  const { id } = params;
  const body = await request.json();
  const { nombre, categoria, tiempo, ingredientes } = body;

  if (!nombre || !nombre.trim()) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  }

  // 1. Actualizar platillo
  const { error: errPlatillo } = await supabase
    .from("platillos")
    .update({ nombre, categoria, tiempo_min: tiempo })
    .eq("id", id);

  if (errPlatillo) {
    return NextResponse.json({ error: errPlatillo.message }, { status: 500 });
  }

  // 2. Borrar los ingredientes viejos de esta receta
  const { error: errDelete } = await supabase
    .from("receta_ingredientes")
    .delete()
    .eq("platillo_id", id);

  if (errDelete) {
    return NextResponse.json({ error: errDelete.message }, { status: 500 });
  }

  // 3. Insertar los nuevos
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
      .insert({
        platillo_id: id,
        ingrediente_id: ingrediente.id,
        cantidad_requerida: ing.cantidad,
      });

    if (errReceta) {
      return NextResponse.json({ error: errReceta.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, id });
}

export async function DELETE(request, { params }) {
  const { id } = params;

  // ON DELETE CASCADE borra automáticamente:
  //   - receta_ingredientes de este platillo
  //   - menu_semana de este platillo (lo quita del menú si estaba)
  const { error } = await supabase.from("platillos").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}