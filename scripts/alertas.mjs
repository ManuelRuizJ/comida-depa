// Lunes: avisa qué ingredientes están por debajo del mínimo.

import { supabase } from "./lib/supabase.mjs";
import { BASE_URL, COLOR, boton, correr, enviarCorreo, escapar, plantilla } from "./lib/correo.mjs";
import { formatearCantidad as fmt } from "../lib/compras.mjs";
import { necesitaComprar } from "../lib/inventario.mjs";

async function main() {
  const { data: items, error } = await supabase
    .from("inventario_con_estado")
    .select("*")
    .order("nombre");

  if (error) throw error;

  const faltantes = (items || []).filter(necesitaComprar);

  if (faltantes.length === 0) {
    console.log("No hay nada por comprar. Saliendo sin mandar correo.");
    return;
  }

  const itemsHtml = faltantes
    .map(
      (item) => `
      <div style="border-bottom: 1px solid ${COLOR.line}; padding: 10px 0;">
        <div style="color: ${COLOR.ink}; font-weight: 500;">${escapar(item.nombre)}</div>
        <div style="color: ${COLOR.mustard700}; font-size: 0.9rem;">
          Tienes ${fmt(item.cantidad_actual)} ${escapar(item.unidad)} · mínimo ${fmt(item.cantidad_minima)}
        </div>
      </div>`
    )
    .join("");

  const titulo = `${faltantes.length} cosa${faltantes.length === 1 ? "" : "s"} por comprar`;

  await enviarCorreo({
    asunto: `Inventario: ${titulo}`,
    html: plantilla({
      titulo,
      intro: "Esto está por debajo del mínimo en el depa:",
      contenido: itemsHtml + `<div style="margin-top: 20px;">${boton(`${BASE_URL}/inventario`, "Ver inventario")}</div>`,
    }),
  });
}

correr(main);
