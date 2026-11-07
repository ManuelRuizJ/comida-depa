import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { errorJson, leerJson } from "@/lib/api";
import { normalizarUnidad } from "@/lib/constantes";
import { limpiarNombre } from "@/lib/ingredientes";

// POST /api/inventario — crear un ingrediente nuevo
export async function POST(request) {
  const body = await leerJson(request);
  if (!body) return errorJson("Datos inválidos", 400);
  const { nombre, categoria, unidad, cantidad_actual, cantidad_minima } = body;

  if (!nombre || !nombre.trim()) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  }

  if (!unidad || !unidad.trim()) {
    return NextResponse.json({ error: "La unidad es obligatoria" }, { status: 400 });
  }

  const { data: ingrediente, error: errIng } = await supabase
    .from("ingredientes")
    .upsert(
      {
        nombre: limpiarNombre(nombre),
        categoria: categoria || null,
        unidad: normalizarUnidad(unidad),
      },
      { onConflict: "nombre" }
    )
    .select("id")
    .single();

  if (errIng) {
    return NextResponse.json({ error: errIng.message }, { status: 500 });
  }

  const { error: errInv } = await supabase.from("inventario").upsert(
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

// PATCH /api/inventario — guardar varios cambios de un jalón (batch)
export async function PATCH(request) {
  const body = await leerJson(request);
  const cambios = body?.cambios;

  if (!Array.isArray(cambios) || cambios.length === 0) {
    return NextResponse.json({ error: "Sin cambios" }, { status: 400 });
  }

  const invalido = cambios.some(
    (c) =>
      !c?.id ||
      !Number.isFinite(Number(c.cantidad_actual)) ||
      !Number.isFinite(Number(c.cantidad_minima))
  );
  if (invalido) {
    return errorJson("Hay cantidades que no son números", 400);
  }

  const filas = cambios.map((c) => ({
    ingrediente_id: c.id,
    cantidad_actual: Number(c.cantidad_actual),
    cantidad_minima: Number(c.cantidad_minima),
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("inventario")
    .upsert(filas, { onConflict: "ingrediente_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
