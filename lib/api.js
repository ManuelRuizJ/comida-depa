import { NextResponse } from "next/server";

export function errorJson(mensaje, status = 500) {
  return NextResponse.json({ error: mensaje }, { status });
}

// request.json() truena con un body vacío o mal formado; aquí regresa null
// para que la ruta conteste 400 en vez de un 500 sin explicación.
export async function leerJson(request) {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? body : null;
  } catch {
    return null;
  }
}

// Código de Postgres para "ya existe un registro con ese valor único".
export const DUPLICADO = "23505";
