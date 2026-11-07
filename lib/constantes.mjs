// Listas que comparten formularios, filtros, API y scripts.
// Los días de la semana viven en lib/fecha.mjs.

export const CATEGORIAS_PLATILLO = ["Desayuno", "Comida", "Cena", "Snack"];

export const CATEGORIAS_INGREDIENTE = [
  "Verdura",
  "Proteína",
  "Lácteo",
  "Abarrotes",
  "Condimento",
  "Otro",
];

export const UNIDADES = ["piezas", "gramos", "ml", "litros", "latas", "rebanadas", "dientes"];

// Variantes que se han colado en la base (singulares, abreviaturas).
const ALIAS_UNIDAD = {
  pieza: "piezas",
  pza: "piezas",
  pzas: "piezas",
  gramo: "gramos",
  g: "gramos",
  gr: "gramos",
  mililitro: "ml",
  mililitros: "ml",
  litro: "litros",
  l: "litros",
  lata: "latas",
  rebanada: "rebanadas",
  diente: "dientes",
};

// "Pieza " → "piezas". Una unidad desconocida se respeta tal cual (en minúsculas).
export function normalizarUnidad(unidad) {
  const u = String(unidad ?? "")
    .trim()
    .toLowerCase();
  if (!u) return "piezas";
  return ALIAS_UNIDAD[u] ?? u;
}
