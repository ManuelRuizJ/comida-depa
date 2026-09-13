import { supabase } from "@/lib/supabase";
import FilaInventario from "@/components/FilaInventario";

export const dynamic = "force-dynamic";

export default async function InventarioPage() {
  const { data, error } = await supabase
    .from("inventario_con_estado")
    .select("*")
    .order("nombre");

  return (
    <div>
      <h1>Inventario</h1>
      <p className="row-sub">Actualiza la cantidad real que tienen en el depa.</p>

      <div className="card">
        {error && <p className="empty">Error cargando inventario: {error.message}</p>}
        {!error && (!data || data.length === 0) && (
          <p className="empty">Todavía no hay ingredientes en el inventario.</p>
        )}
        {data?.map((item) => (
          <FilaInventario key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}