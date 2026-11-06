import { supabase } from "@/lib/supabase";
import ListaInventario from "@/components/ListaInventario";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inventario" };

export default async function InventarioPage() {
  const [{ data: items, error }, { data: usos }] = await Promise.all([
    supabase
      .from("inventario_con_estado")
      .select("ingrediente_id, nombre, unidad, cantidad_actual, cantidad_minima")
      .order("nombre"),
    supabase.from("receta_ingredientes").select("ingrediente_id"),
  ]);

  if (error) {
    throw new Error(`No se pudo cargar el inventario: ${error.message}`);
  }

  const usosPorIngrediente = {};
  (usos || []).forEach((u) => {
    usosPorIngrediente[u.ingrediente_id] = (usosPorIngrediente[u.ingrediente_id] || 0) + 1;
  });

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Inventario</h1>
          <p className="page-sub">
            Lo que hay en el depa. Edita las cantidades que quieras y guarda todo junto al final.
          </p>
        </div>
      </header>

      <ListaInventario items={items} usosPorIngrediente={usosPorIngrediente} />
    </>
  );
}
