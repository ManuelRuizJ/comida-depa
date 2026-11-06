// Todo lo que comparten los correos automáticos: envío por Gmail,
// destinatarios, URL de la app y la plantilla HTML.

import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export const BASE_URL = (
  process.env.APP_URL || "https://comida-depa-rh8t.vercel.app"
).replace(/\/$/, "");

// Mismos colores que la app (app/globals.css).
export const COLOR = {
  sage700: "#3f5636",
  sage500: "#5f7a52",
  ink: "#223226",
  inkSoft: "#55655a",
  line: "#dde3d4",
  mustard700: "#a67322",
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function destinatarios() {
  return (process.env.EMAIL_TO || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

// Los nombres vienen de la base: se escapan para que un "<" o "&" no
// rompa el HTML del correo.
export function escapar(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function boton(href, texto, { secundario = false } = {}) {
  const estilo = secundario
    ? `background: transparent; color: ${COLOR.inkSoft}; border: 1px solid ${COLOR.line}; font-weight: 500;`
    : `background: ${COLOR.sage700}; color: white; font-weight: 600;`;
  return `<a href="${href}"
     style="display: inline-block; ${estilo} text-decoration: none;
            padding: 10px 18px; border-radius: 999px; margin: 4px 8px 4px 0;">
    ${texto}
  </a>`;
}

// Envuelve el contenido con el encabezado y pie de todos los correos.
export function plantilla({ titulo, intro, contenido = "" }) {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h1 style="font-family: Georgia, serif; color: ${COLOR.ink}; font-size: 1.5rem;">
        ${titulo}
      </h1>
      ${intro ? `<p style="color: ${COLOR.inkSoft}; margin-bottom: 16px;">${intro}</p>` : ""}
      ${contenido}
      <p style="color: #889; font-size: 0.85rem; margin-top: 24px;">Cocina Depa</p>
    </div>`;
}

// `node scripts/diario.mjs --mostrar` arma el correo pero no lo manda:
// guarda el HTML en un archivo temporal para abrirlo en el navegador.
const SOLO_MOSTRAR = process.argv.includes("--mostrar");

export async function enviarCorreo({ asunto, html }) {
  if (SOLO_MOSTRAR) {
    const archivo = join(tmpdir(), `cocina-depa-${Date.now()}.html`);
    writeFileSync(archivo, `<meta charset="utf-8">${html}`);
    console.log(`[--mostrar] No se envió. Asunto: ${asunto}\n[--mostrar] HTML: ${archivo}`);
    return;
  }

  const to = destinatarios();
  if (to.length === 0) {
    throw new Error("EMAIL_TO está vacío: no hay a quién mandar el correo.");
  }

  const result = await transporter.sendMail({
    from: `"Cocina Depa" <${process.env.GMAIL_USER}>`,
    to,
    subject: asunto,
    html,
  });
  console.log("Correo enviado:", result.messageId);
}

// Corre main() y marca el job de GitHub Actions como fallido si truena.
export function correr(main) {
  main().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
}
