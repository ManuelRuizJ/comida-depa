import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import RecetaEditForm from "@/components/RecetaEditForm";

export const dynamic = "force-dynamic";

export default async function EditarRecetaPage({ params }) {
  const { data: platillo, error } = await supabase
    .from("platillos")
    .select(
      "id, nombre, categoria, tiempo_min, receta_ingredientes(cantidad_requerida, ingredientes(id, nombre, unidad))"
    )
    .eq("id", params.id)
    .single();

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
        <RecetaEditForm
          id={platillo.id}
          nombreInicial={platillo.nombre}
          categoriaInicial={platillo.categoria || "Comida"}
          tiempoInicial={platillo.tiempo_min || 20}
          ingredientesIniciales={
            ingredientes.length > 0
              ? ingredientes
              : [{ nombre: "", cantidad: "", unidad: "piezas" }]
          }
        />
      </div>
    </div>
  );
}