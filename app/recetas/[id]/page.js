import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import RecetaForm from "@/components/RecetaForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { data } = await supabase.from("platillos").select("nombre").eq("id", params.id).single();
  return { title: data?.nombre ? `Editar ${data.nombre}` : "Editar receta" };
}

export default async function EditarRecetaPage({ params }) {
  const [{ data: platillo, error }, { data: catalogo }] = await Promise.all([
    supabase
      .from("platillos")
      .select(
        "id, nombre, categoria, tiempo_min, receta_ingredientes(cantidad_requerida, ingredientes(id, nombre, unidad))"
      )
      .eq("id", params.id)
      .single(),
    supabase.from("ingredientes").select("nombre, unidad").order("nombre"),
  ]);

  if (error || !platillo) {
    notFound();
  }

  const ingredientes = (platillo.receta_ingredientes || []).map((ri) => ({
    nombre: ri.ingredientes?.nombre || "",
    cantidad: ri.cantidad_requerida,
    unidad: ri.ingredientes?.unidad || "piezas",
  }));

  return (
    <>
      <Link href="/recetas" className="volver">
        <ArrowLeft size={16} aria-hidden="true" />
        Recetas
      </Link>
      <header className="page-head">
        <div>
          <h1>{platillo.nombre}</h1>
          <p className="page-sub">Cambia lo que necesites y guarda.</p>
        </div>
      </header>
      <RecetaForm
        catalogo={catalogo || []}
        receta={{
          id: platillo.id,
          nombre: platillo.nombre,
          categoria: platillo.categoria || "Comida",
          tiempo: platillo.tiempo_min || 20,
          ingredientes,
        }}
      />
    </>
  );
}
