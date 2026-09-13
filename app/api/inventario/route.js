import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function PATCH(request) {
  const body = await request.json();
  const { id, cantidad_actual } = body;

  if (!id || cantidad_actual === undefined || Number.isNaN(Number(cantidad_actual))) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { error } = await supabase
    .from("inventario")
    .update({ cantidad_actual: Number(cantidad_actual), updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}