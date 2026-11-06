/**
 * Cierra la semana: regresa a "pendiente" todos los platillos del menú.
 *
 * El menú se queda igual (si la próxima semana repiten platillos no hay
 * que volver a armarlo) y el inventario no se toca: lo que se comió ya
 * se descontó. Corre los sábados antes del correo de compras para que la
 * lista cuente la semana completa.
 *
 * Uso:
 *   node scripts/nueva_semana.mjs
 */

import { supabase } from "./lib/supabase.mjs";

async function main() {
  const { data, error } = await supabase
    .from("menu_semana")
    .update({ comido: false })
    .eq("comido", true)
    .select("id");

  if (error) throw error;
  console.log(`Semana cerrada: ${data.length} platillo(s) regresados a pendiente.`);
}

main().catch((err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
