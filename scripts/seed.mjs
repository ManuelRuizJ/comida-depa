/**
 * scripts/seed.mjs
 * -------------------
 * Carga masiva de recetas a Supabase. Mismo espíritu que tu
 * cargar_datos.py de Notion: edita RECETAS abajo, corre el script,
 * y crea ingredientes + platillos + la conexión entre ellos +
 * filas de inventario en 0 (si no existían ya).
 *
 * Es idempotente: correrlo varias veces no duplica nada — usa el
 * nombre como llave única.
 *
 * Uso:
 *   npm run seed
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// ============================================================
// 1. EDITA AQUÍ TUS RECETAS (copiado y traducido de tu Notion)
// Unidad: "piezas" | "gramos" | "ml" | "litros"
// ============================================================
const RECETAS = {
  Chilaquiles: {
  categoria: "Desayuno",
  tiempo: 20,
  ingredientes: [
    ["Tortilla", 15, "piezas"],
    ["Huevo", 5, "piezas"],
    ["Jitomate", 4, "piezas"],
    ["Cebolla", 1, "pieza"],
    ["Queso fresco", 120, "gramos"],
  ],
},

Toast: {
  categoria: "Desayuno",
  tiempo: 10,
  ingredientes: [
    ["Pan", 5, "piezas"],
    ["Lechuga", 50, "gramos"],
    ["Frijoles refritos", 220, "gramos"],
    ["Salsa Habanero", 30, "gramos"],
    ["Aguacate", 1, "pieza"],
  ],
},

"Comida de mamá": {
  categoria: "Comida",
  tiempo: 30,
  ingredientes: [],
},

"Macarrones con codo (saludable)": {
  categoria: "Comida",
  tiempo: 25,
  ingredientes: [
    ["Pasta de macarrones", 250, "gramos"],
    ["Yogur griego", 120, "gramos"],
    ["Queso cottage", 120, "gramos"],
    ["Aguacate", 1, "pieza"],
    ["Cilantro", 25, "gramos"],
    ["Ajo", 2, "diente"],
    ["Cebolla", 70, "gramos"],
    ["Aceite de oliva", 35, "ml"],
  ],
},

"Sopa fría": {
  categoria: "Comida",
  tiempo: 15,
  ingredientes: [
    ["Pasta de macarrones", 250, "gramos"],
    ["Crema agria", 70, "gramos"],
    ["Mayonesa", 50, "gramos"],
    ["Jamón", 120, "gramos"],
  ],
},

"Pasta fusilli al chipotle": {
  categoria: "Comida",
  tiempo: 30,
  ingredientes: [
    ["Chile chipotle", 40, "gramos"],
    ["Crema agria", 90, "gramos"],
    ["Yogur griego", 90, "gramos"],
    ["Carne molida de res", 350, "gramos"],
    ["Zanahoria", 120, "gramos"],
    ["Papa", 250, "gramos"],
    ["Pimienta negra", 10, "gramos"],
  ],
},

"Noche libre": {
  categoria: "Cena",
  tiempo: 15,
  ingredientes: [],
},

"Huevo sobre pan": {
  categoria: "Desayuno",
  tiempo: 10,
  ingredientes: [
    ["Huevos", 5, "piezas"],
    ["Aguacate", 1, "pieza"],
    ["Aceite", 20, "ml"],
    ["Queso panela", 90, "gramos"],
    ["Pan", 5, "piezas"],
  ],
},

"Hot cakes de avena": {
  categoria: "Desayuno",
  tiempo: 15,
  ingredientes: [
    ["Avena", 140, "gramos"],
    ["Leche", 220, "ml"],
    ["Huevos", 2, "piezas"],
    ["Plátanos", 2, "piezas"],
    ["Mantequilla", 20, "gramos"],
    ["Mermelada", 40, "gramos"],
  ],
},

"Ensalada de quinua con pollo": {
  categoria: "Comida",
  tiempo: 25,
  ingredientes: [
    ["Pechuga de pollo", 350, "gramos"],
    ["Quinua", 220, "gramos"],
    ["Lechuga", 70, "gramos"],
    ["Aceite de oliva", 30, "ml"],
    ["Sal", 10, "gramos"],
    ["Pimienta negra", 10, "gramos"],
    ["Ajo en polvo", 10, "gramos"],
  ],
},

"Espagueti de mamá": {
  categoria: "Comida",
  tiempo: 25,
  ingredientes: [
    ["Milanesa de pollo", 350, "gramos"],
  ],
},

"Milanesa de pollo en plato": {
  categoria: "Comida",
  tiempo: 25,
  ingredientes: [
    ["Milanesa de pollo", 350, "gramos"],
    ["Jitomate", 2, "pieza"],
    ["Aguacate", 1, "pieza"],
    ["Aceite", 30, "ml"],
    ["Lechuga", 70, "gramos"],
    ["Mayonesa", 30, "gramos"],
    ["Pepino", 120, "gramos"],
    ["Frijoles refritos", 180, "gramos"],
  ],
},

"Pozole de mamá": {
  categoria: "Comida",
  tiempo: 40,
  ingredientes: [
    ["Tostada", 5, "piezas"],
    ["Limón", 2, "pieza"],
    ["Chile en polvo", 20, "gramos"],
    ["Lechuga", 70, "gramos"],
    ["Rábano", 90, "gramos"],
  ],
},

"Arroz con huevo": {
  categoria: "Desayuno",
  tiempo: 15,
  ingredientes: [
    ["Huevos", 5, "piezas"],
    ["Arroz de mamá", 220, "gramos"],
    ["Limón", 1, "piezas"],
    ["Salsa macha", 30, "gramos"],
    ["Salsa habanero", 30, "gramos"],
    ["Tortilla", 5, "piezas"],
  ],
},

"Mole de mamá": {
  categoria: "Comida",
  tiempo: 20,
  ingredientes: [
    ["Tortilla", 7, "piezas"],
  ],
},

"Sopa de fideo de mamá": {
  categoria: "Comida",
  tiempo: 20,
  ingredientes: [
    ["Tortilla", 5, "piezas"],
  ],
},

"Torta de milanesa de pollo": {
  categoria: "Desayuno",
  tiempo: 15,
  ingredientes: [
    ["Torta", 3, "piezas"],
    ["Frijoles refritos", 120, "gramos"],
    ["Aguacate", 1, "pieza"],
    ["Queso Oaxaca", 120, "gramos"],
    ["Jitomate", 2, "pieza"],
    ["Mayonesa", 35, "gramos"],
    ["Chile chipotle", 40, "gramos"],
  ],
},

"Avena con fruta": {
  categoria: "Desayuno",
  tiempo: 10,
  ingredientes: [
    ["Avena", 120, "gramos"],
    ["Yogur", 220, "gramos"],
    ["Plátanos", 2, "pieza"],
    ["Fresas", 120, "gramos"],
    ["Kiwi", 2, "pieza"],
    ["Leche", 220, "ml"],
    ["Manzanas", 2, "pieza"],
    ["Nueces", 40, "gramos"],
    ["Chía", 20, "gramos"],
    ["Arándanos", 35, "gramos"],
  ],
},

"Torta de jamón": {
  categoria: "Desayuno",
  tiempo: 10,
  ingredientes: [
    ["Torta", 3, "piezas"],
    ["Jamón", 6, "rebanadas"],
    ["Frijoles refritos", 120, "gramos"],
    ["Aguacate", 1, "pieza"],
    ["Queso Oaxaca", 90, "gramos"],
    ["Jitomate", 2, "pieza"],
    ["Mayonesa", 35, "gramos"],
    ["Chile chipotle", 40, "gramos"],
  ],
},

"Huevos revueltos con jamón": {
  categoria: "Desayuno",
  tiempo: 10,
  ingredientes: [
    ["Huevos", 5, "piezas"],
    ["Aceite", 20, "ml"],
    ["Jamón", 5, "rebanadas"],
    ["Sal", 7, "gramos"],
    ["Tortilla", 5, "piezas"],
    ["Cebolla", 50, "gramos"],
    ["Frijoles refritos", 140, "gramos"],
  ],
},

"Cereal con leche": {
  categoria: "Desayuno",
  tiempo: 5,
  ingredientes: [
    ["Cereal", 120, "gramos"],
    ["Leche", 350, "ml"],
    ["Plátanos", 1, "pieza"],
  ],
},

"Wrap de atún": {
  categoria: "Comida",
  tiempo: 10,
  ingredientes: [
    ["Atún en lata", 2, "latas"],
    ["Tortilla de harina", 3, "piezas"],
    ["Lechuga", 70, "gramos"],
    ["Jitomate", 2, "pieza"],
    ["Mayonesa", 35, "gramos"],
  ],
},

"Arroz frito económico": {
  categoria: "Comida",
  tiempo: 15,
  ingredientes: [
    ["Arroz cocido", 350, "gramos"],
    ["Huevo", 3, "piezas"],
    ["Verduras congeladas", 120, "gramos"],
    ["Salsa de soya", 35, "ml"],
    ["Aceite", 20, "ml"],
  ],
},

"Pasta con atún": {
  categoria: "Comida",
  tiempo: 15,
  ingredientes: [
    ["Pasta", 250, "gramos"],
    ["Atún en lata", 2, "latas"],
    ["Crema agria", 70, "gramos"],
    ["Cebolla", 50, "gramos"],
  ],
},

"Quesadillas con frijol": {
  categoria: "Cena",
  tiempo: 10,
  ingredientes: [
    ["Tortilla", 7, "piezas"],
    ["Queso Oaxaca", 140, "gramos"],
    ["Frijoles refritos", 120, "gramos"],
  ],
},

"Smoothie verde energético": {
  categoria: "Desayuno",
  tiempo: 5,
  ingredientes: [
    ["Espinaca", 90, "gramos"],
    ["Plátanos", 2, "pieza"],
    ["Leche", 450, "ml"],
    ["Avena", 70, "gramos"],
  ],
},

"Tacos de papa con chorizo": {
  categoria: "Comida",
  tiempo: 25,
  ingredientes: [
    ["Papa", 450, "gramos"],
    ["Chorizo", 120, "gramos"],
    ["Tortilla", 9, "piezas"],
    ["Aceite", 35, "ml"],
    ["Lechuga", 70, "gramos"],
    ["Queso fresco", 70, "gramos"],
  ],
},

"Sándwich de huevo y aguacate": {
  categoria: "Desayuno",
  tiempo: 10,
  ingredientes: [
    ["Pan", 5, "piezas"],
    ["Huevo", 3, "piezas"],
    ["Aguacate", 1, "pieza"],
    ["Jitomate", 2, "pieza"],
    ["Sal", 5, "gramos"],
  ],
},

"Quesadillas de pollo deshebrado": {
  categoria: "Cena",
  tiempo: 15,
  ingredientes: [
    ["Tortilla", 7, "piezas"],
    ["Pechuga de pollo", 250, "gramos"],
    ["Queso Oaxaca", 140, "gramos"],
    ["Cebolla", 50, "gramos"],
  ],
},

"Huevos a la mexicana": {
  categoria: "Desayuno",
  tiempo: 10,
  ingredientes: [
    ["Huevo", 5, "piezas"],
    ["Jitomate", 2, "pieza"],
    ["Cebolla", 70, "gramos"],
    ["Chile serrano", 2, "piezas"],
    ["Aceite", 20, "ml"],
    ["Tortilla", 5, "piezas"],
  ],
},

"Ensalada rápida de garbanzo": {
  categoria: "Comida",
  tiempo: 10,
  ingredientes: [
    ["Garbanzos en lata", 350, "gramos"],
    ["Jitomate", 2, "pieza"],
    ["Cebolla", 50, "gramos"],
    ["Pepino", 120, "gramos"],
    ["Aceite de oliva", 30, "ml"],
    ["Limón", 2, "pieza"],
  ],
},

"Hot cakes de plátano": {
  categoria: "Desayuno",
  tiempo: 15,
  ingredientes: [
    ["Plátanos", 2, "pieza"],
    ["Huevo", 2, "piezas"],
    ["Avena", 120, "gramos"],
    ["Leche", 120, "ml"],
    ["Mantequilla", 20, "gramos"],
  ],
},

"Tostadas de frijol con queso": {
  categoria: "Cena",
  tiempo: 10,
  ingredientes: [
    ["Tostada", 7, "piezas"],
    ["Frijoles refritos", 180, "gramos"],
    ["Queso fresco", 90, "gramos"],
    ["Lechuga", 70, "gramos"],
    ["Crema agria", 50, "gramos"],
  ],
},
};

// ============================================================
// 2. No necesitas tocar nada de aquí para abajo
// ============================================================

async function getOrCreateIngrediente(nombre, unidad) {
  const { data, error } = await supabase
    .from("ingredientes")
    .upsert({ nombre, unidad }, { onConflict: "nombre" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function asegurarInventario(ingredienteId, nombre) {
  const { error } = await supabase
    .from("inventario")
    .upsert(
      { ingrediente_id: ingredienteId, cantidad_actual: 0, cantidad_minima: 1 },
      { onConflict: "ingrediente_id", ignoreDuplicates: true }
    );
  if (error) throw error;
  console.log(`  📦 Inventario listo para: ${nombre}`);
}

async function getOrCreatePlatillo(nombre, categoria, tiempo) {
  const { data, error } = await supabase
    .from("platillos")
    .upsert({ nombre, categoria, tiempo_min: tiempo }, { onConflict: "nombre" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function conectarReceta(platilloId, ingredienteId, cantidad) {
  const { error } = await supabase
    .from("receta_ingredientes")
    .upsert(
      { platillo_id: platilloId, ingrediente_id: ingredienteId, cantidad_requerida: cantidad },
      { onConflict: "platillo_id,ingrediente_id" }
    );
  if (error) throw error;
}

async function main() {
  for (const [nombrePlatillo, datos] of Object.entries(RECETAS)) {
    console.log(`\n=== ${nombrePlatillo} ===`);
    const platilloId = await getOrCreatePlatillo(nombrePlatillo, datos.categoria, datos.tiempo);
    console.log(`🍽️  Platillo listo: ${nombrePlatillo}`);

    for (const [nombreIng, cantidad, unidad] of datos.ingredientes) {
      const ingredienteId = await getOrCreateIngrediente(nombreIng, unidad);
      await asegurarInventario(ingredienteId, nombreIng);
      await conectarReceta(platilloId, ingredienteId, cantidad);
      console.log(`  🔗 Conectado: ${nombrePlatillo} - ${nombreIng} (${cantidad} ${unidad})`);
    }
  }
  console.log("\n✅ Carga completa. Ve a /inventario en tu sitio y pon las cantidades reales.");
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
