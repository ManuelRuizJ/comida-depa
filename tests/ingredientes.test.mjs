import { test } from "node:test";
import assert from "node:assert/strict";
import { claveNombre, limpiarNombre, prepararIngredientes } from "../lib/ingredientes.mjs";
import { normalizarUnidad } from "../lib/constantes.mjs";

test("limpiarNombre quita espacios sobrantes", () => {
  assert.equal(limpiarNombre("  queso   fresco "), "queso fresco");
  assert.equal(limpiarNombre(undefined), "");
});

test("claveNombre ignora mayúsculas y acentos", () => {
  assert.equal(claveNombre("Jitomáte "), claveNombre("jitomate"));
  assert.notEqual(claveNombre("Manzana"), claveNombre("Manzanas"));
});

test("normalizarUnidad unifica singulares y abreviaturas", () => {
  assert.equal(normalizarUnidad("pieza"), "piezas");
  assert.equal(normalizarUnidad(" Gr "), "gramos");
  assert.equal(normalizarUnidad("diente"), "dientes");
  assert.equal(normalizarUnidad("tazas"), "tazas");
  assert.equal(normalizarUnidad(""), "piezas");
});

test("prepararIngredientes descarta filas vacías y junta repetidos", () => {
  const lista = prepararIngredientes([
    { nombre: "Huevo", cantidad: "2", unidad: "pieza" },
    { nombre: " huevo ", cantidad: 3, unidad: "piezas" },
    { nombre: "", cantidad: 5, unidad: "gramos" },
    { nombre: "Sal", cantidad: 0, unidad: "gramos" },
    { nombre: "Leche", cantidad: "abc", unidad: "ml" },
  ]);
  assert.equal(lista.length, 1);
  assert.equal(lista[0].nombre, "Huevo");
  assert.equal(lista[0].cantidad, 5);
  assert.equal(lista[0].unidad, "piezas");
});
