"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarDays, Package, ShoppingCart, Sun } from "lucide-react";

const SECCIONES = [
  { href: "/", texto: "Hoy", Icono: Sun },
  { href: "/menu", texto: "Menú", Icono: CalendarDays },
  { href: "/inventario", texto: "Inventario", Icono: Package },
  { href: "/compras", texto: "Compras", Icono: ShoppingCart },
  { href: "/recetas", texto: "Recetas", Icono: BookOpen },
];

function estaActiva(pathname, href) {
  if (href === "/") return pathname === "/" || pathname === "/hoy";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// variante="lateral": barra lateral de escritorio. variante="pestanas": barra inferior del celular.
export default function Navegacion({ variante }) {
  const pathname = usePathname();
  const lateral = variante === "lateral";

  return (
    <nav className={lateral ? "sidebar-nav" : "tabbar"} aria-label="Secciones">
      {SECCIONES.map(({ href, texto, Icono }) => (
        <Link key={href} href={href} aria-current={estaActiva(pathname, href) ? "page" : undefined}>
          <Icono
            size={lateral ? 18 : 22}
            strokeWidth={estaActiva(pathname, href) ? 2.25 : 1.75}
            aria-hidden="true"
          />
          {texto}
        </Link>
      ))}
    </nav>
  );
}
