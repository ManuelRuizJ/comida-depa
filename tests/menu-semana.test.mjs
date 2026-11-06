import { test } from "node:test";
import assert from "node:assert/strict";
import { diferenciasMenu } from "../lib/menu-semana.mjs";

const actuales = [
  { id: "1", dia: "Lunes", platillo_id: "a" },
  { id: "2", dia: "Lunes", platillo_id: "b" },
  { id: "3", dia: "Martes", platillo_id: "a" },
];

test("solo borra lo deseleccionado y crea lo nuevo", () => {
  const { aBorrar, aCrear } = diferenciasMenu(actuales, [
    { dia: "Lunes", platillo_ids: ["a", "c"] },
    { dia: "Martes", platillo_ids: ["a"] },
  ]);
  assert.deepEqual(aBorrar, ["2"]);
  assert.deepEqual(aCrear, [{ dia: "Lunes", platillo_id: "c", comido: false }]);
});

test("sin cambios no toca nada (se conserva lo comido)", () => {
  const { aBorrar, aCrear } = diferenciasMenu(actuales, [
    { dia: "Lunes", platillo_ids: ["b", "a"] },
    { dia: "Martes", platillo_ids: ["a"] },
  ]);
  assert.deepEqual(aBorrar, []);
  assert.deepEqual(aCrear, []);
});

test("vaciar un día borra todo ese día y no los demás", () => {
  const { aBorrar } = diferenciasMenu(actuales, [{ dia: "Lunes", platillo_ids: [] }]);
  assert.deepEqual(aBorrar, ["1", "2"]);
});
