import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

async function main() {
  const { data: menu, error: errMenu } = await supabase
    .from("menu_semana")
    .select(
      "platillos(nombre, receta_ingredientes(cantidad_requerida, ingredientes(id, nombre, unidad)))"
    )
    .in("dia", DIAS);

  if (errMenu) throw errMenu;

  const { data: inventario } = await supabase
    .from("inventario_con_estado")
    .select("ingrediente_id, cantidad_actual");

  const invPorId = {};
  (inventario || []).forEach((i) => {
    invPorId[i.ingrediente_id] = i;
  });

  const necesidades = {};
  (menu || []).forEach((fila) => {
    const receta = fila.platillos?.receta_ingredientes || [];
    receta.forEach((ri) => {
      const ing = ri.ingredientes;
      if (!ing) return;
      if (!necesidades[ing.id]) {
        necesidades[ing.id] = {
          nombre: ing.nombre,
          unidad: ing.unidad,
          requerido: 0,
        };
      }
      necesidades[ing.id].requerido += Number(ri.cantidad_requerida) || 0;
    });
  });

  const porComprar = Object.entries(necesidades)
    .map(([id, n]) => {
      const inv = invPorId[id];
      const disponible = inv ? Number(inv.cantidad_actual) : 0;
      const faltante = Math.max(0, n.requerido - disponible);
      return {
        nombre: n.nombre,
        unidad: n.unidad,
        requerido: n.requerido,
        disponible,
        faltante,
      };
    })
    .filter((i) => i.faltante > 0)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  if (porComprar.length === 0) {
    console.log("No falta nada. Saliendo sin mandar correo.");
    return;
  }

  const baseUrl = process.env.APP_URL || "https://comida-depa-rh8t.vercel.app";

  const itemsHtml = porComprar
    .map(
      (item) => `
      <div style="border-bottom: 1px solid #dde3d4; padding: 10px 0;">
        <div style="color: #223226; font-weight: 500;">${item.nombre}</div>
        <div style="color: #55655a; font-size: 0.9rem;">
          Necesitas ${item.requerido} ${item.unidad} · tienes ${item.disponible}
          → <strong style="color: #a67322;">comprar ${item.faltante} ${item.unidad}</strong>
        </div>
      </div>`
    )
    .join("");

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h1 style="font-family: Georgia, serif; color: #223226; font-size: 1.5rem;">
        Lista de compras de la semana
      </h1>
      <p style="color: #55655a; margin-bottom: 16px;">
        Calculada del menú de esta semana menos lo que ya tienen en el depa:
      </p>
      ${itemsHtml}
      <a href="${baseUrl}/compras"
         style="display: inline-block; background: #3f5636; color: white; text-decoration: none;
                padding: 12px 22px; border-radius: 999px; font-weight: 600; margin-top: 20px;">
        Ver lista completa
      </a>
    </div>`;

  const result = await transporter.sendMail({
    from: `"Cocina Depa" <${process.env.GMAIL_USER}>`,
    to: getDestinatarios(),
    subject: `🛒 Lista de compras (${porComprar.length} cosa${porComprar.length === 1 ? "" : "s"})`,
    html,
  });

  console.log("Correo enviado:", result.messageId);
}

function getDestinatarios() {
  return (process.env.EMAIL_TO || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});