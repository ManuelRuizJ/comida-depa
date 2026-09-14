import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const APLICAR = process.argv.includes("--aplicar");
const BORRAR_HUERFANOS = process.argv.includes("--borrar-huerfanos");

function normalizar(nombre) {
  return nombre
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function singularizar(nombre) {
  if (nombre.endsWith("es") && nombre.length > 4) return nombre.slice(0, -2);
  if (nombre.endsWith("s") && nombre.length > 3) return nombre.slice(0, -1);
  return nombre;
}

function claveDuplicado(nombre) {
  return singularizar(normalizar(nombre));
}

async function main() {
  console.log(`🔍 Modo: ${APLICAR ? "APLICAR" : "reporte (dry-run)"}\n`);

  // 1. Todos los ingredientes
  const { data: ingredientes, error: errIng } = await supabase
    .from("ingredientes")
    .select("id, nombre, unidad");
  if (errIng) throw errIng;

  // 2. Cuántas recetas usan cada uno
  const { data: usos } = await supabase
    .from("receta_ingredientes")
    .select("ingrediente_id");
  const usosPorId = {};
  (usos || []).forEach((u) => {
    usosPorId[u.ingrediente_id] = (usosPorId[u.ingrediente_id] || 0) + 1;
  });

  // 3. Agrupar por clave normalizada
  const grupos = {};
  ingredientes.forEach((ing) => {
    const clave = claveDuplicado(ing.nombre);
    if (!grupos[clave]) grupos[clave] = [];
    grupos[clave].push({ ...ing, usos: usosPorId[ing.id] || 0 });
  });

  const duplicados = Object.values(grupos).filter((g) => g.length > 1);
  const huerfanos = ingredientes.filter((i) => (usosPorId[i.id] || 0) === 0);

  // Ordenar cada grupo: ganador primero
  for (const grupo of duplicados) {
    grupo.sort((a, b) => {
      if (b.usos !== a.usos) return b.usos - a.usos;
      if (a.nombre.length !== b.nombre.length)
        return a.nombre.length - b.nombre.length;
      return a.nombre.localeCompare(b.nombre);
    });
  }

  // --- Reporte ---
  if (duplicados.length === 0) {
    console.log("✅ No hay duplicados.");
  } else {
    console.log(`📦 ${duplicados.length} grupo(s) de duplicados:\n`);
    for (const grupo of duplicados) {
      const ganador = grupo[0];
      const perdedores = grupo.slice(1);
      console.log(`   ✓ "${ganador.nombre}" (${ganador.unidad}, ${ganador.usos} usos) ← ganador`);
      for (const p of perdedores) {
        console.log(
          `     → fusionar "${p.nombre}" (${p.unidad}, ${p.usos} usos)`
        );
      }
      console.log("");
    }
  }

  if (huerfanos.length > 0) {
    console.log(`⚠️  ${huerfanos.length} ingrediente(s) sin ninguna receta:`);
    huerfanos.forEach((h) => console.log(`   - "${h.nombre}" (${h.unidad})`));
    console.log("");
  }

  // --- Aplicar ---
  if (!APLICAR) {
    console.log("💡 Para aplicar los cambios:");
    console.log("   node scripts/dedup.mjs --aplicar");
    console.log("   node scripts/dedup.mjs --aplicar --borrar-huerfanos");
    return;
  }

  console.log("🚀 Aplicando cambios...\n");

  for (const grupo of duplicados) {
    const ganador = grupo[0];
    const perdedores = grupo.slice(1);

    for (const p of perdedores) {
      console.log(`🔀 "${p.nombre}" → "${ganador.nombre}"`);

      // Reasignar receta_ingredientes
      const { data: filasPerdedor } = await supabase
        .from("receta_ingredientes")
        .select("id, platillo_id")
        .eq("ingrediente_id", p.id);

      for (const fila of filasPerdedor || []) {
        const { data: existe } = await supabase
          .from("receta_ingredientes")
          .select("id")
          .eq("platillo_id", fila.platillo_id)
          .eq("ingrediente_id", ganador.id)
          .maybeSingle();

        if (existe) {
          await supabase.from("receta_ingredientes").delete().eq("id", fila.id);
        } else {
          await supabase
            .from("receta_ingredientes")
            .update({ ingrediente_id: ganador.id })
            .eq("id", fila.id);
        }
      }

      // Borrar inventario del perdedor
      await supabase.from("inventario").delete().eq("ingrediente_id", p.id);

      // Borrar ingrediente perdedor
      const { error: errDel } = await supabase
        .from("ingredientes")
        .delete()
        .eq("id", p.id);

      if (errDel) {
        console.error(`   ❌ Error: ${errDel.message}`);
      } else {
        console.log(`   ✓ Listo`);
      }
    }
  }

  if (BORRAR_HUERFANOS) {
    console.log("\n🗑️  Borrando huérfanos...");
    for (const h of huerfanos) {
      const { error } = await supabase
        .from("inventario")
        .delete()
        .eq("ingrediente_id", h.id);
      if (error) {
        console.error(`   ❌ ${h.nombre}: ${error.message}`);
        continue;
      }
      const { error: errDel } = await supabase
        .from("ingredientes")
        .delete()
        .eq("id", h.id);
      if (errDel) {
        console.error(`   ❌ ${h.nombre}: ${errDel.message}`);
      } else {
        console.log(`   ✓ "${h.nombre}" borrado`);
      }
    }
  }

  console.log("\n✅ Deduplicación completa.");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});