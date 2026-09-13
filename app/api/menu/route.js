import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

const DIAS_VALIDOS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

export async function POST(request) {
  const body = await request.json();
  const { dias } = body;

  if (!Array.isArray(dias)) {
    return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
  }

  for (const { dia, platillo_ids } of dias) {
    if (!DIAS_VALIDOS.includes(dia) || !Array.isArray(platillo_ids)) {
      return NextResponse.json({ error: `Día inválido: ${dia}` }, { status: 400 });
    }

    // Limpia lo que había ese día y mete la selección nueva.
    // (En Postgres esto podría ser una transacción; para 2 usuarios
    // y ~5 filas por día, el riesgo de condición de carrera es mínimo.)
    const { error: deleteError } = await supabase.from("menu_semana").delete().eq("dia", dia);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    if (platillo_ids.length > 0) {
      const filas = platillo_ids.map((platillo_id) => ({
        dia,
        platillo_id,
        comido: false,
      }));
      const { error: insertError } = await supabase.from("menu_semana").insert(filas);
      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ ok: true });
}