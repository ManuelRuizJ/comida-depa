import Link from "next/link";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ListaRecetas from "@/components/ListaRecetas";

export const dynamic = "force-dynamic";
export const metadata = { title: "Recetas" };

export default async function RecetasPage() {
  const { data: platillos, error } = await supabase
    .from("platillos")
    .select(
      "id, nombre, categoria, tiempo_min, receta_ingredientes(cantidad_requerida, ingredientes(nombre, unidad))"
    )
    .order("nombre");

  if (error) {
    throw new Error(`No se pudieron cargar las recetas: ${error.message}`);
  }

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Recetas</h1>
          <p className="page-sub">
            Cada receta dice qué ingredientes usa y cuánto. De aquí salen la lista de compras y lo que se
            descuenta del inventario.
          </p>
        </div>
        <div className="page-acciones">
          <Link href="/recetas/nueva" className="btn btn-primary">
            <Plus size={16} aria-hidden="true" />
            Nueva receta
          </Link>
        </div>
      </header>

      <ListaRecetas platillos={platillos} />
    </>
  );
}
