// Reglas del inventario que no dependen de Supabase.

// Mismo criterio que la vista inventario_con_estado: se compra cuando lo
// que hay no supera el mínimo. Se calcula aquí para no depender del texto
// que arma la vista.
export function necesitaComprar(item) {
  return Number(item.cantidad_actual) <= Number(item.cantidad_minima);
}
