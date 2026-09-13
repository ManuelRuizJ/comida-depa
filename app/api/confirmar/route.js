import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const comido = searchParams.get("comido");

  if (!id || comido === null) {
    return new NextResponse("Faltan parámetros", { status: 400 });
  }

  const { error } = await supabase
    .from("menu_semana")
    .update({ comido: comido === "true" })
    .eq("id", id);

  if (error) {
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Cocina Depa</title>
  <style>
    body { font-family: -apple-system, sans-serif; background: #fbfaf6; color: #223226;
           display: flex; align-items: center; justify-content: center; min-height: 100vh;
           margin: 0; padding: 24px; }
    .card { background: white; border: 1px solid #dde3d4; border-radius: 14px;
            padding: 32px; text-align: center; max-width: 400px; }
    h1 { font-family: Georgia, serif; color: #3f5636; margin: 0 0 8px; font-size: 1.5rem; }
    p { color: #55655a; margin: 0 0 20px; }
    a { display: inline-block; background: #3f5636; color: white; text-decoration: none;
        padding: 10px 20px; border-radius: 999px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${comido === "true" ? "✓ ¡Buen provecho!" : "Ok, cambia el plan"}</h1>
    <p>${comido === "true" ? "Marcado como comido." : "Ve a ajustar el menú de hoy."}</p>
    <a href="/hoy">Ver hoy</a>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}