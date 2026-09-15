import { supabase } from "@/lib/supabase";
import NuevoIngredienteForm from "@/components/NuevoIngredienteForm";
import ListaInventario from "@/components/ListaInventario";

export const dynamic = "force-dynamic";

export const metadata = { title: "Inventario" };

export default async function InventarioPage() {
  const { data, error } = await supabase
    .from("inventario_con_estado")
    .select("*")
    .order("nombre");

  const { data: usos } = await supabase
    .from("receta_ingredientes")
    .select("ingrediente_id");

  const usosPorIngrediente = {};
  (usos || []).forEach((u) => {
    usosPorIngrediente[u.ingrediente_id] =
      (usosPorIngrediente[u.ingrediente_id] || 0) + 1;
  });

  return (
    <div>
      <h1>Inventario</h1>
      <p className="row-sub">
        Actualiza lo que tienen en el depa. Los cambios se guardan en bloque.
      </p>

      <div className="card">
        <NuevoIngredienteForm />
      </div>

      {error && (
        <div className="card">
          <p className="empty">Error cargando inventario: {error.message}</p>
        </div>
      )}

      {!error && (!data || data.length === 0) && (
        <div className="card">
          <p className="empty">Todavía no hay ingredientes en el inventario.</p>
        </div>
      )}

      {!error && data && data.length > 0 && (
        <ListaInventario items={data} usosPorIngrediente={usosPorIngrediente} />
      )}
    </div>
  );
}