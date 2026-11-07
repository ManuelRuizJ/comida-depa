import { test } from "node:test";
import assert from "node:assert/strict";
import { diaDeHoy, esDiaLaborable, ordenDia } from "../lib/fecha.mjs";

test("diaDeHoy usa la hora de México, no UTC", () => {
  // Viernes 6 de noviembre, 23:59 en Puebla = sábado 05:59 UTC
  assert.equal(diaDeHoy(new Date("2026-11-07T05:59:00Z")), "Viernes");
  // Medianoche en Puebla ya es sábado
  assert.equal(diaDeHoy(new Date("2026-11-07T06:00:00Z")), "Sábado");
  assert.equal(diaDeHoy(new Date("2026-11-09T12:00:00Z")), "Lunes");
});

test("esDiaLaborable solo acepta lunes a viernes", () => {
  assert.ok(esDiaLaborable("Miércoles"));
  assert.ok(!esDiaLaborable("Sábado"));
  assert.ok(!esDiaLaborable("Domingo"));
});

test("ordenDia manda días desconocidos al final", () => {
  assert.ok(ordenDia("Lunes") < ordenDia("Viernes"));
  assert.equal(ordenDia("Sábado"), 99);
  assert.equal(ordenDia(undefined), 99);
});
