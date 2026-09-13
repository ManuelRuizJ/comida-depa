import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function PATCH(request) {
  const { id, comido } = await request.json();

  if (!id || typeof comido !== "boolean") {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { error } = await supabase.from("menu_semana").update({ comido }).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}