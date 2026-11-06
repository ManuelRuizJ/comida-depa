import { Public_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";
import BotonSalir from "@/components/BotonSalir";
import Navegacion from "@/components/Navegacion";
import Logo from "@/components/Logo";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "Cocina Depa",
    template: "%s · Cocina Depa",
  },
  description: "Menú semanal, inventario y lista de compras del depa.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f4f1" },
    { media: "(prefers-color-scheme: dark)", color: "#101411" },
  ],
};

function Marca() {
  return (
    <Link href="/" className="marca">
      <Logo />
      Cocina Depa
    </Link>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="es-MX" className={publicSans.variable}>
      <body>
        <a href="#contenido" className="skip-link">
          Saltar al contenido
        </a>
        <ToastProvider>
          <aside className="sidebar">
            <Marca />
            <Navegacion variante="lateral" />
            <div className="sidebar-pie">
              <BotonSalir />
            </div>
          </aside>

          <header className="topbar">
            <Marca />
            <BotonSalir />
          </header>

          <main className="main" id="contenido">
            {children}
          </main>

          <Navegacion variante="pestanas" />
        </ToastProvider>
      </body>
    </html>
  );
}
