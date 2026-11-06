// Cálculo de la lista de compras: lo que pide el menú de la semana menos
// lo que ya hay en el inventario. Lo usan la página /compras y el correo
// de los sábados (scripts/compras.mjs), así siempre dicen lo mismo.

import { ordenDia } from "./fecha.mjs";

// Columnas que hay que pedirle a `menu_semana` para poder calcular.
export const SELECT_MENU_COMPRAS =
  "dia, platillos(id, nombre, receta_ingredientes(cantidad_requerida, ingredientes(id, nombre, unidad)))";

// Columnas que hay que pedirle a `inventario_con_estado`.
export const SELECT_INVENTARIO_COMPRAS = "ingrediente_id, cantidad_actual";

/**
 * @param menu        filas de menu_semana con SELECT_MENU_COMPRAS
 * @param inventario  filas de inventario_con_estado con SELECT_INVENTARIO_COMPRAS
 * @returns {{ platillos, faltantes, disponible }}
 *   platillos: cada platillo del menú con sus días, veces y ingredientes
 *              (cada ingrediente trae `por_vez`, `total` y `cubierto`)
 *   faltantes: ingredientes que hay que comprar, ordenados por nombre
 *   disponible(id): cuánto hay de un ingrediente en el depa
 */
export function calcularCompras(menu, inventario) {
  const stock = {};
  (inventario || []).forEach((i) => {
    stock[i.ingrediente_id] = Number(i.cantidad_actual) || 0;
  });
  const disponible = (id) => stock[id] ?? 0;

  // 1. Agrupar por platillo (un platillo puede repetirse varios días).
  const porPlatillo = {};
  (menu || []).forEach((fila) => {
    const p = fila.platillos;
    if (!p) return;

    const entrada = (porPlatillo[p.id] ??= {
      id: p.id,
      nombre: p.nombre,
      dias: new Set(),
      veces: 0,
      ingredientes: {},
    });
    entrada.dias.add(fila.dia);
    entrada.veces += 1;

    (p.receta_ingredientes || []).forEach((ri) => {
      const ing = ri.ingredientes;
      if (!ing || entrada.ingredientes[ing.id]) return;
      entrada.ingredientes[ing.id] = {
        id: ing.id,
        nombre: ing.nombre,
        unidad: ing.unidad,
        por_vez: Number(ri.cantidad_requerida) || 0,
      };
    });
  });

  // 2. Total requerido por ingrediente en toda la semana.
  const requerido = {};
  Object.values(porPlatillo).forEach((p) => {
    Object.values(p.ingredientes).forEach((ing) => {
      const r = (requerido[ing.id] ??= { ...ing, requerido: 0 });
      r.requerido += ing.por_vez * p.veces;
    });
  });

  const platillos = Object.values(porPlatillo)
    .map((p) => ({
      ...p,
      dias: [...p.dias].sort((a, b) => ordenDia(a) - ordenDia(b)),
      ingredientes: Object.values(p.ingredientes).map((ing) => ({
        ...ing,
        total: ing.por_vez * p.veces,
        cubierto: disponible(ing.id) >= requerido[ing.id].requerido,
      })),
    }))
    .sort(
      (a, b) =>
        ordenDia(a.dias[0]) - ordenDia(b.dias[0]) || a.nombre.localeCompare(b.nombre)
    );

  const faltantes = Object.values(requerido)
    .map(({ id, nombre, unidad, requerido }) => ({
      id,
      nombre,
      unidad,
      requerido,
      disponible: disponible(id),
      faltante: Math.max(0, requerido - disponible(id)),
    }))
    .filter((i) => i.faltante > 0)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  return { platillos, faltantes, disponible };
}

// 0.1 + 0.2 = 0.30000000000000004 → "0.3"; 2 → "2"
export function formatearCantidad(n) {
  return Number(n).toLocaleString("es-MX", { maximumFractionDigits: 2 });
}
