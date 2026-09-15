import { supabase } from "@/lib/supabase";
import FilaInventario from "@/components/FilaInventario";
import NuevoIngredienteForm from "@/components/NuevoIngredienteForm";

export const metadata = { title: "Inventario" };

export const dynamic = "force-dynamic";

export default async function InventarioPage() {
  const { data, error } = await supabase
    .from("inventario_con_estado")
    .select("*")
    .order("nombre");

  // Cuenta cuántas recetas usan cada ingrediente
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
        Actualiza lo que tienen en el depa. El estado se recalcula solo.
      </p>

      <div className="card">
        <NuevoIngredienteForm />
      </div>

      <div className="card">
        {error && (
          <p className="empty">Error cargando inventario: {error.message}</p>
        )}
        {!error && (!data || data.length === 0) && (
          <p className="empty">Todavía no hay ingredientes en el inventario.</p>
        )}
        {data?.map((item) => (
          <FilaInventario
            key={item.id}
            item={item}
            usos={usosPorIngrediente[item.ingrediente_id] || 0}
          />
        ))}
      </div>
    </div>
  );
}