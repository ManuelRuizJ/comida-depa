// Autenticación mínima con una palabra clave compartida (APP_PASSWORD).
//
// La cookie de sesión guarda un HMAC-SHA256 derivado de la palabra clave,
// así que no se puede falsificar sin conocerla. Si cambias APP_PASSWORD
// en Vercel, todas las sesiones abiertas dejan de ser válidas.
//
// Usa Web Crypto (crypto.subtle) para funcionar igual en el middleware
// (runtime Edge) y en las API routes (Node).

export const COOKIE_SESION = "cd_sesion";
export const DURACION_SESION = 60 * 60 * 24 * 365; // 1 año, en segundos

const MENSAJE = "cocina-depa-sesion-v1";

// Sin distinguir mayúsculas ni espacios al inicio/final: más fácil en el celular.
export function normalizarClave(clave) {
  return String(clave ?? "")
    .trim()
    .toLowerCase();
}

export function claveConfigurada() {
  return normalizarClave(process.env.APP_PASSWORD).length > 0;
}

async function hmacHex(clave, mensaje) {
  const enc = new TextEncoder();
  const llave = await crypto.subtle.importKey(
    "raw",
    enc.encode(clave),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const firma = await crypto.subtle.sign("HMAC", llave, enc.encode(mensaje));
  return Array.from(new Uint8Array(firma))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Comparación de tiempo constante para no filtrar información por timing.
function igualesSeguro(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// Valor que debe tener la cookie de sesión.
export async function firmaEsperada() {
  return hmacHex(normalizarClave(process.env.APP_PASSWORD), MENSAJE);
}

export async function esCookieValida(valor) {
  if (!claveConfigurada() || !valor) return false;
  return igualesSeguro(valor, await firmaEsperada());
}

export async function esClaveCorrecta(intento) {
  if (!claveConfigurada()) return false;
  // Se comparan los HMAC (misma longitud siempre) en vez del texto plano.
  const [a, b] = await Promise.all([hmacHex(normalizarClave(intento), MENSAJE), firmaEsperada()]);
  return igualesSeguro(a, b);
}

// Evita redirecciones abiertas: solo rutas internas tipo "/menu".
export function rutaSegura(next) {
  if (typeof next !== "string") return "/";
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return "/";
  }
  return next;
}
