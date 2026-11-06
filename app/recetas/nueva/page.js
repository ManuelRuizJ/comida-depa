import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import RecetaForm from "@/components/RecetaForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nueva receta" };

export default async function NuevaRecetaPage() {
  const { data: catalogo } = await supabase.from("ingredientes").select("nombre, unidad").order("nombre");

  return (
    <>
      <Link href="/recetas" className="volver">
        <ArrowLeft size={16} aria-hidden="true" />
        Recetas
      </Link>
      <header className="page-head">
        <div>
          <h1>Nueva receta</h1>
          <p className="page-sub">
            Escribe las cantidades para una vez que se cocina. Los ingredientes que ya existen se sugieren
            al escribir.
          </p>
        </div>
      </header>
      <RecetaForm catalogo={catalogo || []} />
    </>
  );
}
