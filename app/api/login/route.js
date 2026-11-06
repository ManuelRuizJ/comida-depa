import { NextResponse } from "next/server";
import {
  COOKIE_SESION,
  DURACION_SESION,
  claveConfigurada,
  esClaveCorrecta,
  firmaEsperada,
} from "@/lib/auth";

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

// POST /api/login — valida la palabra clave y abre sesión
export async function POST(request) {
  if (!claveConfigurada()) {
    return NextResponse.json(
      { error: "Falta configurar APP_PASSWORD en el servidor" },
      { status: 500 }
    );
  }

  let clave = "";
  try {
    ({ clave } = await request.json());
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  if (!(await esClaveCorrecta(clave))) {
    // Pequeña pausa para frenar a quien intente adivinar a fuerza bruta.
    await esperar(800);
    return NextResponse.json({ error: "Esa no es" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_SESION, await firmaEsperada(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SESION,
  });
  return res;
}

// DELETE /api/login — cierra la sesión
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_SESION, "", { path: "/", maxAge: 0 });
  return res;
}
