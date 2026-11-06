"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECCIONES = [
  { href: "/hoy", texto: "Hoy" },
  { href: "/menu", texto: "Menú" },
  { href: "/inventario", texto: "Inventario" },
  { href: "/compras", texto: "Compras" },
  { href: "/recetas", texto: "Recetas" },
];

// Links de la barra; marca la sección actual (también en /recetas/123).
export default function NavLinks() {
  const pathname = usePathname();

  return SECCIONES.map(({ href, texto }) => {
    const activa = pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link key={href} href={href} aria-current={activa ? "page" : undefined}>
        {texto}
      </Link>
    );
  });
}
