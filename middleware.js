import { NextResponse } from "next/server";
import { COOKIE_SESION, esCookieValida, rutaSegura } from "@/lib/auth";

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const valida = await esCookieValida(request.cookies.get(COOKIE_SESION)?.value);

  // Ya con sesión no tiene sentido ver el login.
  if (pathname === "/login") {
    if (valida) {
      const next = rutaSegura(request.nextUrl.searchParams.get("next"));
      return NextResponse.redirect(new URL(next, request.url));
    }
    return NextResponse.next();
  }

  if (valida) return NextResponse.next();

  // Las API llamadas desde la app responden 401; pero si es una navegación
  // del navegador (p. ej. el link de confirmación del correo), se manda al
  // login y al entrar regresa al mismo link.
  const esNavegacion =
    request.method === "GET" && (request.headers.get("accept") || "").includes("text/html");

  if (pathname.startsWith("/api/") && !esNavegacion) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const url = new URL("/login", request.url);
  if (pathname !== "/") url.searchParams.set("next", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  // Todo pasa por aquí excepto los archivos estáticos, el endpoint de login
  // y lo que el navegador pide sin cookies (manifest, íconos, robots.txt).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|icon-192.png|icon-512.png|icon-maskable-512.png|manifest.webmanifest|robots.txt|api/login).*)",
  ],
};
