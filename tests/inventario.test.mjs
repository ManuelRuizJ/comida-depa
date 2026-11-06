import { test } from "node:test";
import assert from "node:assert/strict";
import { ajustarPorComido, necesitaComprar } from "../lib/inventario.mjs";

test("necesitaComprar cuando lo actual no supera el mínimo", () => {
  assert.ok(necesitaComprar({ cantidad_actual: 1, cantidad_minima: 1 }));
  assert.ok(necesitaComprar({ cantidad_actual: "0", cantidad_minima: "2" }));
  assert.ok(!necesitaComprar({ cantidad_actual: 3, cantidad_minima: 1 }));
});

test("descontar una receta nunca deja negativos", () => {
  const receta = [
    { ingrediente_id: "h", cantidad_requerida: 5 },
    { ingrediente_id: "t", cantidad_requerida: 15 },
  ];
  const ajustes = ajustarPorComido(receta, { h: 3, t: 20 }, -1);
  assert.deepEqual(ajustes, [
    { ingrediente_id: "h", cantidad_actual: 0 },
    { ingrediente_id: "t", cantidad_actual: 5 },
  ]);
});

test("deshacer regresa las cantidades", () => {
  const ajustes = ajustarPorComido(
    [{ ingrediente_id: "l", cantidad_requerida: 0.1 }],
    { l: 0.2 },
    1
  );
  assert.deepEqual(ajustes, [{ ingrediente_id: "l", cantidad_actual: 0.3 }]);
});

test("ignora ingredientes sin inventario o con cantidad 0", () => {
  const receta = [
    { ingrediente_id: "x", cantidad_requerida: 2 },
    { ingrediente_id: "h", cantidad_requerida: 0 },
  ];
  assert.deepEqual(ajustarPorComido(receta, { h: 4 }, -1), []);
});
