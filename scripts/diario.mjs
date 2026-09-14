import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer"; // ✅ Cambio: usamos nodemailer
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ✅ Cambio: Configuramos el transportador de Gmail
const transporter = nodemailer.createTransport({
  service: "gmail", // Atajo para la configuración de Gmail
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function diaDeHoy() {
  return DIAS[new Date().getDay()];
}

async function main() {
  const hoy = diaDeHoy();

  if (hoy === "Sábado" || hoy === "Domingo") {
    console.log(`Hoy es ${hoy}, no hay plan. Saliendo sin mandar correo.`);
    return;
  }

  const { data: items, error } = await supabase
    .from("menu_semana")
    .select("id, comido, platillos(nombre)")
    .eq("dia", hoy);

  if (error) throw error;

  if (!items || items.length === 0) {
    console.log(`No hay nada asignado para ${hoy}. Saliendo sin mandar correo.`);
    return;
  }

  const baseUrl = process.env.APP_URL || "https://comida-depa-rh8t.vercel.app";

  const itemsHtml = items
    .map(
      (item) => `
      <div style="border: 1px solid #dde3d4; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
        <div style="font-weight: 600; margin-bottom: 12px; font-size: 1.05rem; color: #223226;">
          ${item.platillos?.nombre}
        </div>
        ${
          item.comido
            ? `<span style="color: #5f7a52; font-weight: 500;">✓ Ya marcado como comido</span>`
            : `<a href="${baseUrl}/api/confirmar?id=${item.id}&comido=true"
                 style="display: inline-block; background: #3f5636; color: white; text-decoration: none;
                        padding: 10px 18px; border-radius: 999px; font-weight: 600; margin-right: 8px;">
              Sí, lo comí
            </a>
            <a href="${baseUrl}/menu"
               style="display: inline-block; background: transparent; color: #55655a; text-decoration: none;
                      padding: 10px 18px; border-radius: 999px; font-weight: 500; border: 1px solid #dde3d4;">
              Cambié de plan
            </a>`
        }
      </div>`
    )
    .join("");

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h1 style="font-family: Georgia, serif; color: #223226; font-size: 1.5rem;">
        ¿Qué toca hoy? — ${hoy}
      </h1>
      <p style="color: #55655a; margin-bottom: 20px;">
        Este es el plan para hoy en el depa:
      </p>
      ${itemsHtml}
      <p style="color: #889; font-size: 0.85rem; margin-top: 24px;">
        Cocina Depa
      </p>
    </div>`;

  // ✅ Cambio: Usamos transporter.sendMail
  const result = await transporter.sendMail({
    from: `"Cocina Depa" <${process.env.GMAIL_USER}>`,
    to: getDestinatarios(),
    subject: `¿Qué toca hoy? — ${hoy}`,
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