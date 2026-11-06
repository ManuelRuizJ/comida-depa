import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularCompras, formatearCantidad, listaComoTexto } from "../lib/compras.mjs";

const huevo = { id: "h", nombre: "Huevo", unidad: "piezas" };
const tortilla = { id: "t", nombre: "Tortilla", unidad: "piezas" };
const leche = { id: "l", nombre: "Leche", unidad: "litros" };

const chilaquiles = {
  id: "p1",
  nombre: "Chilaquiles",
  receta_ingredientes: [
    { cantidad_requerida: 5, ingredientes: huevo },
    { cantidad_requerida: 15, ingredientes: tortilla },
  ],
};
const hotcakes = {
  id: "p2",
  nombre: "Hotcakes",
  receta_ingredientes: [
    { cantidad_requerida: 2, ingredientes: huevo },
    { cantidad_requerida: 0.1, ingredientes: leche },
  ],
};
const cafe = {
  id: "p3",
  nombre: "Café",
  receta_ingredientes: [{ cantidad_requerida: 0.2, ingredientes: leche }],
};

const menu = [
  { dia: "Miércoles", comido: false, platillos: chilaquiles },
  { dia: "Lunes", comido: false, platillos: chilaquiles },
  { dia: "Lunes", comido: false, platillos: hotcakes },
  { dia: "Martes", comido: false, platillos: cafe },
  { dia: "Jueves", comido: false, platillos: null },
];
const inventario = [
  { ingrediente_id: "h", cantidad_actual: 6 },
  { ingrediente_id: "t", cantidad_actual: "40" },
];

test("suma un platillo repetido y resta lo que hay", () => {
  const { faltantes } = calcularCompras(menu, inventario);
  const porNombre = Object.fromEntries(faltantes.map((f) => [f.nombre, f]));

  // Huevo: 5 × 2 (chilaquiles) + 2 (hotcakes) = 12, hay 6
  assert.equal(porNombre.Huevo.requerido, 12);
  assert.equal(porNombre.Huevo.faltante, 6);
  // Tortilla: 30 requeridas, hay 40: no se compra
  assert.equal(porNombre.Tortilla, undefined);
  // Leche: sin inventario, falta todo
  assert.equal(formatearCantidad(porNombre.Leche.faltante), "0.3");
});

test("ordena platillos por el primer día en que aparecen", () => {
  const { platillos } = calcularCompras(menu, inventario);
  assert.deepEqual(
    platillos.map((p) => p.nombre),
    ["Chilaquiles", "Hotcakes", "Café"]
  );
  assert.deepEqual(platillos[0].dias, ["Lunes", "Miércoles"]);
  assert.equal(platillos[0].veces, 2);
});

test("no cuenta lo que ya se comió (ya salió del inventario)", () => {
  const conComido = menu.map((f) =>
    f.platillos?.id === "p1" && f.dia === "Lunes" ? { ...f, comido: true } : f
  );
  const { faltantes } = calcularCompras(conComido, inventario);
  const huevoFalta = faltantes.find((f) => f.nombre === "Huevo");
  // Queda un chilaquiles (5) + hotcakes (2) = 7, hay 6
  assert.equal(huevoFalta.faltante, 1);
});

test("menú vacío no truena", () => {
  assert.deepEqual(calcularCompras(null, null).faltantes, []);
});

test("listaComoTexto arma una lista lista para compartir", () => {
  const texto = listaComoTexto([{ nombre: "Leche", faltante: 0.30000000000000004, unidad: "litros" }]);
  assert.match(texto, /Leche: 0\.3 litros/);
});
