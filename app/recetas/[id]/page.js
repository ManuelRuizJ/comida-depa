import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import RecetaForm from "@/components/RecetaForm";

export const dynamic = "force-dynamic";

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
    <div>
      <Link
        href="/recetas"
        className="row-sub"
        style={{ display: "inline-block", marginBottom: 12 }}
      >
        ← Volver a recetas
      </Link>
      <h1>Editar receta</h1>
      <div className="card">
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
      </div>
    </div>
  );
}

export async function generateMetadata({ params }) {
  const { data } = await supabase
    .from("platillos")
    .select("nombre")
    .eq("id", params.id)
    .single();
  return { title: data?.nombre ? `Editar ${data.nombre}` : "Editar receta" };
}