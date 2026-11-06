# Cocina Depa — Web

Frontend en Next.js + Supabase, reemplaza Notion + Render.

## Estructura

- `app/` — páginas (Hoy, Menú, Inventario, Compras, Recetas) y API routes
- `components/` — piezas interactivas (chips de menú, filas editables, formularios)
- `lib/` — código compartido:
  - `supabase.js` — cliente de Supabase, solo se usa en el servidor
  - `auth.js` — sesión con palabra clave
  - `api.js` — helpers de las API routes (`leerJson`, `errorJson`)
  - `constantes.js` — categorías y unidades
  - `fecha.mjs` — qué día es hoy, siempre con la hora de México
  - `compras.mjs` — cálculo de la lista de compras (lo usan la página y el correo)
- `scripts/` — correos automáticos (GitHub Actions), `seed` y `dedup`
  - `scripts/lib/` — envío por Gmail, plantilla del correo y cliente de Supabase

`fecha.mjs` y `compras.mjs` son `.mjs` para que los scripts de node también
los puedan importar.

## Probar un correo sin mandarlo

```bash
node scripts/diario.mjs --mostrar   # también alertas, compras, menu_semanal
```

Arma el correo con los datos reales pero no lo envía: imprime la ruta de un
`.html` temporal para abrirlo en el navegador.

## Correr en tu compu (opcional, para probar antes de subir)

```bash
npm install
cp .env.local.example .env.local   # y llena con tus credenciales de Supabase
npm run dev
```

Abre `http://localhost:3000`.

## Subir a GitHub y desplegar en Vercel

1. Dentro de esta carpeta:
   ```bash
   git init
   git add .
   git commit -m "primer commit del frontend"
   git remote add origin https://github.com/TU-USUARIO/cocina-depa-web.git
   git push -u origin main
   ```
2. En [vercel.com](https://vercel.com) → "Add New" → "Project" → selecciona el repo `cocina-depa-web`.
3. Vercel detecta que es Next.js automáticamente. Antes de darle "Deploy", abre "Environment Variables" y agrega:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `APP_PASSWORD` (la palabra clave para entrar)
   (los mismos valores de tu `.env.local`)
4. Dale "Deploy". En 1-2 minutos tienes una URL pública tipo `cocina-depa-web.vercel.app`.

## Acceso con palabra clave

La app pide una palabra clave (`APP_PASSWORD`) antes de dejar ver o modificar cualquier cosa.

- Se escribe una vez por dispositivo y queda recordada **1 año** (cookie `httpOnly`).
- No distingue mayúsculas ni espacios al inicio/final.
- **Cambiar `APP_PASSWORD` en Vercel cierra la sesión en todos los dispositivos** (hay que redeployar para que tome el valor nuevo).
- `middleware.js` protege todas las páginas y `/api/*`; los links del correo diario mandan al login y, al entrar, regresan al link.
- Los scripts de GitHub Actions hablan directo con Supabase, no les afecta.

## Por qué esta estructura

- **Server components** (`app/*/page.js`) leen datos directo de Supabase en el servidor — más rápido, y las credenciales nunca llegan al navegador.
- **API routes** (`app/api/*/route.js`) manejan las escrituras (guardar menú, marcar comido, actualizar inventario) — mismo patrón que antes con Flask, pero sin servidor que se duerma.
- **Componentes cliente** (`"use client"`) solo donde hace falta interactividad (chips, botones) — el resto es HTML generado en servidor, más rápido de cargar.
