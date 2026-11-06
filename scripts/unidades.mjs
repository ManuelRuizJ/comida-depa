/**
 * Corrige unidades escritas de distintas formas ("pieza" y "piezas",
 * "diente" y "dientes"...) para que todas coincidan con UNIDADES de
 * lib/constantes.mjs.
 *
 * Uso:
 *   node scripts/unidades.mjs            # solo reporta
 *   node scripts/unidades.mjs --aplicar  # guarda los cambios
 */

import { supabase } from "./lib/supabase.mjs";
import { UNIDADES, normalizarUnidad } from "../lib/constantes.mjs";

const APLICAR = process.argv.includes("--aplicar");

async function main() {
  const { data: ingredientes, error } = await supabase
    .from("ingredientes")
    .select("id, nombre, unidad")
    .order("nombre");
  if (error) throw error;

  const cambios = ingredientes
    .map((i) => ({ ...i, nueva: normalizarUnidad(i.unidad) }))
    .filter((i) => i.nueva !== i.unidad);

  const desconocidas = ingredientes.filter((i) => !UNIDADES.includes(normalizarUnidad(i.unidad)));

  console.log(`Modo: ${APLICAR ? "aplicar" : "reporte (sin cambios)"}\n`);

  if (cambios.length === 0) {
    console.log("Todas las unidades ya están normalizadas.");
  } else {
    console.log(`${cambios.length} ingrediente(s) por corregir:`);
    for (const c of cambios) console.log(`  ${c.nombre}: "${c.unidad}" -> "${c.nueva}"`);
  }

  if (desconocidas.length > 0) {
    console.log(`\nUnidades fuera de la lista (se dejan igual):`);
    for (const d of desconocidas) console.log(`  ${d.nombre}: "${d.unidad}"`);
  }

  if (!APLICAR || cambios.length === 0) {
    if (cambios.length > 0) console.log("\nCorre con --aplicar para guardar.");
    return;
  }

  for (const c of cambios) {
    const { error: errUpd } = await supabase
      .from("ingredientes")
      .update({ unidad: c.nueva })
      .eq("id", c.id);
    if (errUpd) throw errUpd;
  }
  console.log(`\nListo: ${cambios.length} unidad(es) actualizadas.`);
}

main().catch((err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
