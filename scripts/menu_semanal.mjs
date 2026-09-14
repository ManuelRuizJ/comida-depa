import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function main() {
  const baseUrl = process.env.APP_URL || "https://comida-depa-rh8t.vercel.app";

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h1 style="font-family: Georgia, serif; color: #223226; font-size: 1.5rem;">
        Arma el menú de la próxima semana
      </h1>
      <p style="color: #55655a; margin-bottom: 20px;">
        Es viernes, toca decidir qué van a comer la próxima semana en el depa.
      </p>
      <a href="${baseUrl}/menu"
         style="display: inline-block; background: #3f5636; color: white; text-decoration: none;
                padding: 12px 22px; border-radius: 999px; font-weight: 600;">
        Elegir el menú
      </a>
      <p style="color: #889; font-size: 0.85rem; margin-top: 24px;">Cocina Depa</p>
    </div>`;

  const result = await transporter.sendMail({
    from: `"Cocina Depa" <${process.env.GMAIL_USER}>`,
    to: getDestinatarios(),
    subject: "🍳 Arma el menú de la próxima semana",
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