// Diferencias entre el menú guardado y el que se quiere guardar.

/**
 * @param actuales  filas de menu_semana [{ id, dia, platillo_id }]
 * @param dias      [{ dia, platillo_ids }] lo que eligió el usuario
 * @returns {{ aBorrar: string[], aCrear: { dia, platillo_id, comido }[] }}
 *
 * Lo que se queda no aparece en ninguna lista: así conserva su "comido".
 */
export function diferenciasMenu(actuales, dias) {
  const aBorrar = [];
  const aCrear = [];

  for (const { dia, platillo_ids } of dias) {
    const elegidos = new Set(platillo_ids);
    const delDia = (actuales || []).filter((f) => f.dia === dia);
    const yaEstan = new Set(delDia.map((f) => f.platillo_id));

    for (const f of delDia) {
      if (!elegidos.has(f.platillo_id)) aBorrar.push(f.id);
    }
    for (const platillo_id of elegidos) {
      if (!yaEstan.has(platillo_id)) aCrear.push({ dia, platillo_id, comido: false });
    }
  }

  return { aBorrar, aCrear };
}
