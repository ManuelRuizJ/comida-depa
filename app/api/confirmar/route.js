import { NextResponse } from "next/server";
import { marcarComido } from "@/lib/menu";

// GET /api/confirmar?id=...&comido=true — link del correo diario.
// Responde una página HTML suelta porque se abre desde el cliente de correo.

function pagina({ titulo, texto, ok }) {
  return `<!DOCTYPE html>
<html lang="es-MX">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>${titulo} · Cocina Depa</title>
  <style>
    :root { --bg: #f3f4f1; --surface: #fff; --border: #e0e3db; --text: #1a211c; --muted: #59635c;
            --accent: #2e5b39; --on-accent: #fff; --estado: ${ok ? "#2f6b3f" : "#b3261e"}; color-scheme: light; }
    @media (prefers-color-scheme: dark) {
      :root { --bg: #101411; --surface: #171c18; --border: #2a312c; --text: #e6eae6; --muted: #a4ada6;
              --accent: #8cc49a; --on-accent: #0e1a11; --estado: ${ok ? "#8cc49a" : "#f08a80"}; color-scheme: dark; }
    }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px;
           background: var(--bg); color: var(--text);
           font: 15px/1.5 -apple-system, "Segoe UI", Roboto, sans-serif; }
    main { width: 100%; max-width: 380px; padding: 28px 24px; border: 1px solid var(--border);
           border-radius: 10px; background: var(--surface); }
    svg { color: var(--estado); }
    h1 { margin: 14px 0 6px; font-size: 1.25rem; letter-spacing: -0.01em; }
    p { margin: 0 0 20px; color: var(--muted); }
    a { display: inline-block; padding: 9px 16px; border-radius: 8px; background: var(--accent);
        color: var(--on-accent); font-weight: 600; text-decoration: none; }
  </style>
</head>
<body>
  <main>
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      ${ok ? '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>' : '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>'}
    </svg>
    <h1>${titulo}</h1>
    <p>${texto}</p>
    <a href="/">Abrir Cocina Depa</a>
  </main>
</body>
</html>`;
}

function responder(html, status = 200) {
  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const comido = searchParams.get("comido");

  if (!id || comido === null) {
    return responder(
      pagina({
        titulo: "Enlace incompleto",
        texto: "Al enlace le faltan datos. Márcalo desde la app.",
        ok: false,
      }),
      400
    );
  }

  const { error } = await marcarComido(id, comido === "true");

  if (error) {
    return responder(
      pagina({
        titulo: "No se pudo guardar",
        texto: "Intenta de nuevo o márcalo desde la app.",
        ok: false,
      }),
      500
    );
  }

  return responder(
    comido === "true"
      ? pagina({
          titulo: "Marcado como comido",
          texto: "Los ingredientes se descontaron del inventario.",
          ok: true,
        })
      : pagina({
          titulo: "Marcado como pendiente",
          texto: "Puedes cambiar el plan de hoy desde el menú.",
          ok: true,
        })
  );
}
