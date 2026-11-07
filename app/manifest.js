// Permite instalar la app en la pantalla de inicio del celular.
export default function manifest() {
  return {
    name: "Cocina Depa",
    short_name: "Cocina",
    description: "Menú semanal, inventario y lista de compras del depa.",
    lang: "es-MX",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f3f4f1",
    theme_color: "#2e5b39",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
