import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { errorJson, leerJson } from "@/lib/api";
import { DIAS_SEMANA } from "@/lib/fecha";
import { diferenciasMenu } from "@/lib/menu-semana";

// POST /api/menu — { dias: [{ dia, platillo_ids }] }
//
// Solo agrega lo nuevo y quita lo que se deseleccionó. Lo que se queda
// conserva su estado de "comido": borrarlo y volverlo a crear lo
// regresaría a pendiente y su receta se descontaría dos veces del inventario.
export async function POST(request) {
  const body = await leerJson(request);
  const dias = body?.dias;

  if (!Array.isArray(dias)) {
    return errorJson("Formato inválido", 400);
  }

  for (const d of dias) {
    if (!DIAS_SEMANA.includes(d?.dia) || !Array.isArray(d.platillo_ids)) {
      return errorJson(`Día inválido: ${d?.dia}`, 400);
    }
  }

  const { data: actuales, error: errActuales } = await supabase
    .from("menu_semana")
    .select("id, dia, platillo_id")
    .in(
      "dia",
      dias.map((d) => d.dia)
    );
  if (errActuales) return errorJson(errActuales.message);

  const { aBorrar, aCrear } = diferenciasMenu(actuales, dias);

  if (aBorrar.length > 0) {
    const { error } = await supabase.from("menu_semana").delete().in("id", aBorrar);
    if (error) return errorJson(error.message);
  }

  if (aCrear.length > 0) {
    const { error } = await supabase.from("menu_semana").insert(aCrear);
    if (error) return errorJson(error.message);
  }

  return NextResponse.json({ ok: true, agregados: aCrear.length, quitados: aBorrar.length });
}
