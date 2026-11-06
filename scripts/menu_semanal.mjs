// Viernes: recordatorio para armar el menú de la próxima semana.

import { BASE_URL, boton, correr, enviarCorreo, plantilla } from "./lib/correo.mjs";

async function main() {
  await enviarCorreo({
    asunto: "🍳 Arma el menú de la próxima semana",
    html: plantilla({
      titulo: "Arma el menú de la próxima semana",
      intro: "Es viernes, toca decidir qué van a comer la próxima semana en el depa.",
      contenido: boton(`${BASE_URL}/menu`, "Elegir el menú"),
    }),
  });
}

correr(main);
