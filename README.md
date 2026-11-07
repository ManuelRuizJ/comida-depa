# Cocina Depa

Aplicación web para organizar la comida de un departamento compartido: menú de lunes a viernes, inventario de ingredientes, lista de compras calculada y recetas. Manda recordatorios por correo y descuenta del inventario lo que se cocina.

Next.js 14 (App Router) sobre Vercel, datos en Supabase y tareas programadas en GitHub Actions.

## Contenido

- [Funciones](#funciones)
- [Requisitos](#requisitos)
- [Instalación local](#instalación-local)
- [Variables de entorno](#variables-de-entorno)
- [Comandos](#comandos)
- [Despliegue](#despliegue)
- [Tareas programadas](#tareas-programadas)
- [Acceso](#acceso)
- [Modelo de datos](#modelo-de-datos)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Calidad y auditorías](#calidad-y-auditorías)
- [Seguridad](#seguridad)
- [Mantenimiento de datos](#mantenimiento-de-datos)

## Funciones

| Sección    | Qué hace                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Hoy        | Platillos del día con sus ingredientes. Al marcar uno como comido se descuenta su receta del inventario; "Deshacer" la regresa.             |
| Menú       | Tablero de lunes a viernes. Un día admite varios platillos y un platillo puede repetirse.                                                   |
| Inventario | Cantidad actual y mínima de cada ingrediente. Un ingrediente pasa a "Comprar" cuando lo que hay no supera el mínimo.                        |
| Compras    | Lo que piden los platillos pendientes de la semana menos lo que hay. Se comparte como texto (WhatsApp, notas) o se copia al portapapeles.   |
| Recetas    | Ingredientes y cantidades por platillo. Al escribir un ingrediente se sugieren los existentes y se respeta la unidad que usa el inventario. |

La interfaz tiene barra lateral en escritorio y barra de pestañas en celular, modo oscuro automático y se puede instalar en la pantalla de inicio del teléfono.

## Requisitos

- Node.js 22 (ver `.nvmrc`). Los scripts usan el WebSocket nativo de Node 22 para Supabase.
- Un proyecto de Supabase con las tablas descritas en [Modelo de datos](#modelo-de-datos).
- Para los correos: una cuenta de Gmail con [contraseña de aplicación](https://support.google.com/accounts/answer/185833).

## Instalación local

```bash
npm install
cp .env.local.example .env.local   # completar los valores
npm run dev
```

La app queda en `http://localhost:3000` y pide la palabra clave definida en `APP_PASSWORD`.

## Variables de entorno

| Variable             | Dónde se usa      | Descripción                                                                        |
| -------------------- | ----------------- | ---------------------------------------------------------------------------------- |
| `SUPABASE_URL`       | App y scripts     | URL del proyecto (Supabase → Project Settings → API).                              |
| `SUPABASE_ANON_KEY`  | App y scripts     | Clave `anon`. Solo se usa en el servidor; nunca llega al navegador.                |
| `APP_PASSWORD`       | App               | Palabra clave de acceso. No distingue mayúsculas ni espacios al inicio o al final. |
| `APP_URL`            | Scripts de correo | URL pública de la app para los enlaces de los correos. Opcional.                   |
| `GMAIL_USER`         | Scripts de correo | Cuenta que envía los correos.                                                      |
| `GMAIL_APP_PASSWORD` | Scripts de correo | Contraseña de aplicación de esa cuenta.                                            |
| `EMAIL_TO`           | Scripts de correo | Destinatarios separados por coma.                                                  |

En local se leen de `.env.local`. En Vercel van en Project Settings → Environment Variables y en GitHub, como secretos del repositorio.

## Comandos

| Comando                | Descripción                                                        |
| ---------------------- | ------------------------------------------------------------------ |
| `npm run dev`          | Servidor de desarrollo.                                            |
| `npm run build`        | Build de producción.                                               |
| `npm start`            | Sirve el build de producción.                                      |
| `npm run lint`         | ESLint sobre todo el repositorio, sin advertencias permitidas.     |
| `npm run format`       | Formatea con Prettier.                                             |
| `npm run format:check` | Verifica el formato sin modificar archivos.                        |
| `npm test`             | Pruebas unitarias con `node:test`.                                 |
| `npm run check`        | Lint, formato y pruebas en una sola corrida.                       |
| `npm run seed`         | Carga las recetas definidas en `scripts/seed.mjs`. Es idempotente. |

## Despliegue

El proyecto se despliega en Vercel, que detecta Next.js sin configuración adicional.

1. Importar el repositorio en Vercel (Add New → Project).
2. Configurar `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `APP_PASSWORD` en Environment Variables.
3. Desplegar. Vercel toma la versión de Node de `engines.node` en `package.json`.
4. En GitHub, agregar como secretos `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GMAIL_USER`, `GMAIL_APP_PASSWORD` y `EMAIL_TO` para las tareas programadas.
5. Si la URL de Vercel cambia, actualizar `APP_URL` en los archivos de `.github/workflows/`.

Cambiar `APP_PASSWORD` cierra la sesión en todos los dispositivos. Vercel aplica el valor nuevo en el siguiente despliegue.

## Tareas programadas

Se ejecutan en GitHub Actions. Los horarios de cron están en UTC; Puebla está en UTC−6 todo el año.

| Workflow           | Cron (UTC)   | Hora en Puebla | Script                     | Qué hace                                                                                 |
| ------------------ | ------------ | -------------- | -------------------------- | ---------------------------------------------------------------------------------------- |
| `diario.yml`       | `0 19 * * *` | Diario, 13:00  | `scripts/diario.mjs`       | Manda el plan del día con un enlace para marcarlo como comido (solo de lunes a viernes). |
| `alertas.yml`      | `0 14 * * 1` | Lunes, 08:00   | `scripts/alertas.mjs`      | Lista los ingredientes en el mínimo o abajo.                                             |
| `menu.yml`         | `0 14 * * 5` | Viernes, 08:00 | `scripts/menu_semanal.mjs` | Recuerda armar el menú de la semana siguiente.                                           |
| `nueva-semana.yml` | `0 6 * * 6`  | Sábado, 00:00  | `scripts/nueva_semana.mjs` | Regresa todos los platillos a pendiente. No toca el menú ni el inventario.               |
| `compras.yml`      | `0 15 * * 6` | Sábado, 09:00  | `scripts/compras.mjs`      | Manda la lista de compras de la semana.                                                  |
| `ci.yml`           | Cada PR      |                |                            | Lint, formato, pruebas y build.                                                          |

Todas se pueden lanzar a mano desde la pestaña Actions (`workflow_dispatch`).

Para revisar un correo sin enviarlo:

```bash
node scripts/diario.mjs --mostrar    # también alertas, compras y menu_semanal
```

Imprime la ruta de un archivo HTML temporal con el correo armado con los datos reales.

## Acceso

La app usa una sola palabra clave compartida (`APP_PASSWORD`).

- `POST /api/login` valida la clave y guarda una cookie `httpOnly` con un HMAC-SHA256 derivado de ella. La cookie dura un año y no se puede falsificar sin conocer la clave.
- `middleware.js` protege todas las páginas y `/api/*`. Las llamadas de la app reciben `401`; las navegaciones del navegador se redirigen al login y regresan a la página original.
- Quedan fuera del middleware los archivos estáticos, el manifest, los iconos y `robots.txt`, que el navegador pide sin cookies.
- Los scripts de GitHub Actions se conectan directo a Supabase y no pasan por la app.

## Modelo de datos

Tablas en Supabase tal como las usa el código:

| Tabla                   | Columnas principales                                                         | Notas                                                          |
| ----------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `ingredientes`          | `id`, `nombre` (único), `unidad`, `categoria`                                | La unidad es del ingrediente y la comparte el inventario.      |
| `inventario`            | `ingrediente_id` (único), `cantidad_actual`, `cantidad_minima`, `updated_at` | Una fila por ingrediente.                                      |
| `platillos`             | `id`, `nombre` (único), `categoria`, `tiempo_min`                            |                                                                |
| `receta_ingredientes`   | `platillo_id`, `ingrediente_id`, `cantidad_requerida`                        | Cantidad para una vez que se cocina el platillo.               |
| `menu_semana`           | `id`, `dia`, `platillo_id`, `comido`                                         | `dia` va de `Lunes` a `Viernes`.                               |
| `inventario_con_estado` | Vista: inventario + nombre y unidad del ingrediente + `estado`               | La app calcula el estado por su cuenta (`lib/inventario.mjs`). |

Las llaves foráneas borran en cascada: un platillo se lleva sus filas de `receta_ingredientes` y `menu_semana`; un ingrediente, las de `inventario` y `receta_ingredientes`.

Reglas de negocio:

- **Por comprar**: `cantidad_actual <= cantidad_minima`.
- **Lista de compras**: suma de `cantidad_requerida` de los platillos del menú con `comido = false`, menos `cantidad_actual`. Lo comido no se cuenta porque ya se descontó.
- **Marcar como comido**: resta la receta del inventario sin bajar de cero. El cambio solo se aplica si el valor anterior era el contrario, así que un doble clic o abrir dos veces el enlace del correo no descuentan dos veces.
- **Guardar el menú**: solo agrega y quita lo que cambió; lo que se queda conserva su estado.

## Estructura del proyecto

```
app/                    Páginas (App Router) y rutas de API
  api/                  login, comido, confirmar, menu, inventario, recetas
  recetas/nueva/        Alta de recetas
  recetas/[id]/         Edición de recetas
  manifest.js           Manifest para instalar la app
components/             Componentes de cliente (formularios, listas, navegación)
lib/                    Código compartido
  api.js                leerJson(), errorJson()
  auth.js               Sesión con palabra clave
  supabase.js           Cliente de Supabase (solo servidor)
  menu.js               marcarComido(): menú + ajuste de inventario
  recetas.js            Guardado de ingredientes de una receta
  compras.mjs           Cálculo de la lista de compras
  constantes.mjs        Categorías, unidades y normalizarUnidad()
  fecha.mjs             Día y fecha con la zona horaria de México
  ingredientes.mjs      Limpieza y comparación de nombres
  inventario.mjs        necesitaComprar(), ajustarPorComido()
  menu-semana.mjs       Diferencias al guardar el menú
scripts/                Correos, carga inicial y mantenimiento
  lib/                  Envío por Gmail, plantilla de correo, cliente de Supabase
tests/                  Pruebas de lib/ con node:test
middleware.js           Protección de rutas
next.config.mjs         Cabeceras de seguridad
```

Los módulos de `lib/` que también importan los scripts de Node usan la extensión `.mjs`. No se puede declarar `"type": "module"` en `package.json` porque rompe `next/font` en Next 14.

## Calidad y auditorías

- **Lint y formato**: ESLint (`next/core-web-vitals`) y Prettier, verificados en CI.
- **Pruebas**: 19 pruebas unitarias sobre fechas, lista de compras, inventario, ingredientes y menú.
- **Accesibilidad**: axe-core sin violaciones WCAG 2.1 AA en todas las páginas, en tema claro y oscuro, a 1440 y 390 px.
- **Lighthouse** (build de producción): rendimiento 98–100, accesibilidad 100 y buenas prácticas 100, en celular y escritorio; CLS 0.

## Seguridad

- Cabeceras en todas las respuestas (`next.config.mjs`): Content-Security-Policy restringida al mismo dominio, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS y `X-Robots-Tag: noindex`.
- La CSP permite `'unsafe-inline'` en scripts porque Next 14 hidrata con scripts inline. Quitarlo requiere nonces por petición.
- Next 14.2.35 corrige el bypass de autorización del middleware (GHSA-f82v-jwr5-mffw). `npm audit` sigue reportando avisos de Next y PostCSS que solo se corrigen en Next 15/16; afectan funciones que esta app no usa (Image Optimization, Server Actions, rewrites). Los avisos de `glob` y `minimatch` vienen de `eslint-config-next` y solo existen en desarrollo.
- Migrar a Next 15 es el siguiente paso recomendado. Cambia `params` y `searchParams` a promesas en páginas y rutas.

## Mantenimiento de datos

Los dos scripts reportan sin modificar nada hasta que se les pasa `--aplicar`.

```bash
node scripts/unidades.mjs             # unidades escritas distinto ("pieza" y "piezas")
node scripts/unidades.mjs --aplicar

node scripts/dedup.mjs                # ingredientes duplicados y sin uso
node scripts/dedup.mjs --aplicar [--borrar-huerfanos]
```
