import { Fraunces, Public_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600"],
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "Cocina Depa",
  description: "Inventario y menú semanal, para dos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${fraunces.variable} ${publicSans.variable}`}>
      <body>
        <header className="topbar">
          <Link href="/" className="brand">
            Cocina Depa
          </Link>
          <nav className="nav">
            <Link href="/hoy">Hoy</Link>
            <Link href="/menu">Menú</Link>
            <Link href="/inventario">Inventario</Link>
            <Link href="/compras">Compras</Link>
            <Link href="/recetas">Recetas</Link>
          </nav>
        </header>
        <main className="page">{children}</main>
      </body>
    </html>
  );
}