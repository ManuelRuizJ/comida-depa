import { supabase } from "@/lib/supabase";
import MenuForm from "@/components/MenuForm";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const { data: platillos } = await supabase.from("platillos").select("id, nombre").order("nombre");
  const { data: menuActual } = await supabase.from("menu_semana").select("dia, platillo_id");

  return (
    <div>
      <h1>Menú de la semana</h1>
      <p className="row-sub">
        Toca los platillos que quieran comer cada día — puedes elegir varios por día, o repetir el mismo en varios días.
      </p>
      <div className="card">
        <MenuForm platillos={platillos || []} menuActual={menuActual || []} />
      </div>
    </div>
  );
}