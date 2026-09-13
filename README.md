# Cocina Depa — Web

Frontend en Next.js + Supabase, reemplaza Notion + Render.

## Estructura

- `app/` — páginas (Hoy, Menú, Inventario) y API routes
- `lib/supabase.js` — cliente de Supabase, solo se usa en el servidor
- `components/` — piezas interactivas (chips de menú, filas editables)
- `supabase/schema.sql` — el esquema que ya corriste en Supabase

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
   (los mismos valores de tu `.env.local`)
4. Dale "Deploy". En 1-2 minutos tienes una URL pública tipo `cocina-depa-web.vercel.app`.

## Por qué esta estructura

- **Server components** (`app/*/page.js`) leen datos directo de Supabase en el servidor — más rápido, y las credenciales nunca llegan al navegador.
- **API routes** (`app/api/*/route.js`) manejan las escrituras (guardar menú, marcar comido, actualizar inventario) — mismo patrón que antes con Flask, pero sin servidor que se duerma.
- **Componentes cliente** (`"use client"`) solo donde hace falta interactividad (chips, botones) — el resto es HTML generado en servidor, más rápido de cargar.

## Siguiente paso

Todavía falta: cargar los datos reales (ingredientes, platillos, recetas) y conectar los correos automáticos (GitHub Actions + Resend) a esta base nueva en vez de Notion.