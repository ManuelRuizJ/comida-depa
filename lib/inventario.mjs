// Reglas del inventario que no dependen de Supabase.

// Mismo criterio que la vista inventario_con_estado: se compra cuando lo
// que hay no supera el mínimo. Se calcula aquí para no depender del texto
// que arma la vista.
export function necesitaComprar(item) {
  return Number(item.cantidad_actual) <= Number(item.cantidad_minima);
}

/**
 * Cantidades nuevas del inventario al marcar un platillo como comido
 * (signo = -1: se descuenta la receta) o al deshacerlo (signo = +1).
 *
 * @param receta  [{ ingrediente_id, cantidad_requerida }]
 * @param stock   { [ingrediente_id]: cantidad_actual }
 * @returns       [{ ingrediente_id, cantidad_actual }] de los que están en `stock`
 */
export function ajustarPorComido(receta, stock, signo) {
  const total = {};
  for (const ri of receta || []) {
    const cantidad = Number(ri.cantidad_requerida) || 0;
    if (!ri.ingrediente_id || cantidad <= 0) continue;
    total[ri.ingrediente_id] = (total[ri.ingrediente_id] || 0) + cantidad;
  }

  return Object.entries(total)
    .filter(([id]) => id in stock)
    .map(([id, cantidad]) => {
      const actual = Number(stock[id]) || 0;
      // Nunca negativo; redondeo a 3 decimales para no arrastrar 0.30000000000000004.
      const nueva = Math.round(Math.max(0, actual + signo * cantidad) * 1000) / 1000;
      return { ingrediente_id: id, cantidad_actual: nueva };
    });
}
