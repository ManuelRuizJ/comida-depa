// Lunes a viernes: manda el plan del día con un botón para marcar "lo comí".

import { supabase } from "./lib/supabase.mjs";
import { BASE_URL, COLOR, boton, correr, enviarCorreo, escapar, plantilla } from "./lib/correo.mjs";
import { diaDeHoy, esDiaLaborable } from "../lib/fecha.mjs";

async function main() {
  const hoy = diaDeHoy();

  if (!esDiaLaborable(hoy)) {
    console.log(`Hoy es ${hoy}, no hay plan. Saliendo sin mandar correo.`);
    return;
  }

  const { data: items, error } = await supabase
    .from("menu_semana")
    .select("id, comido, platillos(nombre)")
    .eq("dia", hoy);

  if (error) throw error;

  if (!items || items.length === 0) {
    console.log(`No hay nada asignado para ${hoy}. Saliendo sin mandar correo.`);
    return;
  }

  const itemsHtml = items
    .map(
      (item) => `
      <div style="border: 1px solid ${COLOR.line}; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
        <div style="font-weight: 600; margin-bottom: 12px; font-size: 1.05rem; color: ${COLOR.ink};">
          ${escapar(item.platillos?.nombre)}
        </div>
        ${
          item.comido
            ? `<span style="color: ${COLOR.sage500}; font-weight: 500;">Ya marcado como comido</span>`
            : boton(`${BASE_URL}/api/confirmar?id=${item.id}&comido=true`, "Sí, lo comí") +
              boton(`${BASE_URL}/menu`, "Cambié de plan", { secundario: true })
        }
      </div>`
    )
    .join("");

  await enviarCorreo({
    asunto: `¿Qué toca hoy? — ${hoy}`,
    html: plantilla({
      titulo: `¿Qué toca hoy? — ${hoy}`,
      intro: "Este es el plan para hoy en el depa:",
      contenido: itemsHtml,
    }),
  });
}

correr(main);
