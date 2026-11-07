import { NextResponse } from "next/server";
import { errorJson, leerJson } from "@/lib/api";
import { marcarComido } from "@/lib/menu";

// PATCH /api/comido — { id, comido } marca un platillo de hoy y ajusta el inventario
export async function PATCH(request) {
  const body = await leerJson(request);
  if (!body) return errorJson("Datos inválidos", 400);
  const { id, comido } = body;

  if (!id || typeof comido !== "boolean") {
    return errorJson("Datos inválidos", 400);
  }

  const { error, cambiado, ajustados } = await marcarComido(id, comido);
  if (error) return errorJson(error.message);

  return NextResponse.json({ ok: true, cambiado, ajustados });
}
