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

async function main() {
  const { data: items, error } = await supabase
    .from("inventario_con_estado")
    .select("*")
    .order("nombre");

  if (error) throw error;

  const faltantes = (items || []).filter((i) => i.estado.includes("Comprar"));

  if (faltantes.length === 0) {
    console.log("No hay nada por comprar. Saliendo sin mandar correo.");
    return;
  }

  const baseUrl = process.env.APP_URL || "https://comida-depa-rh8t.vercel.app";

  const itemsHtml = faltantes
    .map(
      (item) => `
      <div style="border-bottom: 1px solid #dde3d4; padding: 10px 0;">
        <div style="color: #223226; font-weight: 500;">${item.nombre}</div>
        <div style="color: #a67322; font-size: 0.9rem;">
          Tienes ${item.cantidad_actual} ${item.unidad} · mínimo ${item.cantidad_minima}
        </div>
      </div>`
    )
    .join("");

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h1 style="font-family: Georgia, serif; color: #223226; font-size: 1.5rem;">
        ${faltantes.length} cosa${faltantes.length === 1 ? "" : "s"} por comprar
      </h1>
      <p style="color: #55655a; margin-bottom: 16px;">
        Esto está por debajo del mínimo en el depa:
      </p>
      ${itemsHtml}
      <a href="${baseUrl}/inventario"
         style="display: inline-block; background: #3f5636; color: white; text-decoration: none;
                padding: 12px 22px; border-radius: 999px; font-weight: 600; margin-top: 20px;">
        Ver inventario
      </a>
    </div>`;

  const result = await transporter.sendMail({
    from: `"Cocina Depa" <${process.env.GMAIL_USER}>`,
    to: getDestinatarios(),
    subject: `🛒 ${faltantes.length} cosa${faltantes.length === 1 ? "" : "s"} por comprar`,
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