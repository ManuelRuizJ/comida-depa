// Nombres de ingredientes: limpieza y comparación sin duplicados.

import { normalizarUnidad } from "./constantes.mjs";

// "  queso   fresco " → "queso fresco"
export function limpiarNombre(nombre) {
  return String(nombre ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

// Clave para comparar nombres: sin mayúsculas, acentos ni espacios extra.
// "Jitomate", "jitomate " y "JITOMÁTE" son el mismo ingrediente.
export function claveNombre(nombre) {
  return limpiarNombre(nombre).toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

/**
 * Limpia los ingredientes que manda el formulario de recetas:
 * descarta filas vacías o sin cantidad y junta los repetidos.
 *
 * @returns [{ nombre, clave, cantidad, unidad }]
 */
export function prepararIngredientes(ingredientes) {
  const porClave = new Map();
  for (const ing of ingredientes || []) {
    const nombre = limpiarNombre(ing?.nombre);
    const cantidad = Number(ing?.cantidad);
    if (!nombre || !Number.isFinite(cantidad) || cantidad <= 0) continue;

    const clave = claveNombre(nombre);
    const previo = porClave.get(clave);
    if (previo) {
      previo.cantidad += cantidad;
    } else {
      porClave.set(clave, { nombre, clave, cantidad, unidad: normalizarUnidad(ing.unidad) });
    }
  }
  return [...porClave.values()];
}
