// Sábado: la lista de compras de la semana (menú menos inventario).

import { supabase } from "./lib/supabase.mjs";
import { BASE_URL, COLOR, boton, correr, enviarCorreo, escapar, plantilla } from "./lib/correo.mjs";
import { DIAS_SEMANA } from "../lib/fecha.mjs";
import {
  SELECT_INVENTARIO_COMPRAS,
  SELECT_MENU_COMPRAS,
  calcularCompras,
  formatearCantidad as fmt,
} from "../lib/compras.mjs";

async function main() {
  const [{ data: menu, error: errMenu }, { data: inventario, error: errInv }] =
    await Promise.all([
      supabase.from("menu_semana").select(SELECT_MENU_COMPRAS).in("dia", DIAS_SEMANA),
      supabase.from("inventario_con_estado").select(SELECT_INVENTARIO_COMPRAS),
    ]);

  if (errMenu) throw errMenu;
  if (errInv) throw errInv;

  const { faltantes: porComprar } = calcularCompras(menu, inventario);

  if (porComprar.length === 0) {
    console.log("No falta nada. Saliendo sin mandar correo.");
    return;
  }

  const itemsHtml = porComprar
    .map(
      (item) => `
      <div style="border-bottom: 1px solid ${COLOR.line}; padding: 10px 0;">
        <div style="color: ${COLOR.ink}; font-weight: 500;">${escapar(item.nombre)}</div>
        <div style="color: ${COLOR.inkSoft}; font-size: 0.9rem;">
          Necesitas ${fmt(item.requerido)} ${escapar(item.unidad)} · tienes ${fmt(item.disponible)}
          → <strong style="color: ${COLOR.mustard700};">comprar ${fmt(item.faltante)} ${escapar(item.unidad)}</strong>
        </div>
      </div>`
    )
    .join("");

  await enviarCorreo({
    asunto: `Lista de compras (${porComprar.length} cosa${porComprar.length === 1 ? "" : "s"})`,
    html: plantilla({
      titulo: "Lista de compras de la semana",
      intro: "Calculada del menú de esta semana menos lo que ya tienen en el depa:",
      contenido: itemsHtml + `<div style="margin-top: 20px;">${boton(`${BASE_URL}/compras`, "Ver lista completa")}</div>`,
    }),
  });
}

correr(main);
