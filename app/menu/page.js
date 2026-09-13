import { supabase } from "@/lib/supabase";
import MenuForm from "@/components/MenuForm";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const { data: platillos, error: errPlatillos } = await supabase
    .from("platillos")
    .select("id, nombre")
    .order("nombre");

  const { data: menuActual, error: errMenu } = await supabase
    .from("menu_semana")
    .select("dia, platillo_id");

  // Esto se ve en los logs de Vercel (Functions → /menu)
  console.log("MENU DEBUG → platillos:", platillos?.length, "error:", errPlatillos?.message);
  console.log("MENU DEBUG → menuActual:", menuActual?.length, "error:", errMenu?.message);

  return (
    <div>
      <h1>Menú de la semana</h1>
      <p className="row-sub">
        Toca los platillos que quieran comer cada día — puedes elegir varios por día, o repetir el mismo en varios días.
      </p>

      {errPlatillos && (
        <div className="card">
          <p className="empty" style={{ color: "#b03a2e" }}>
            Error al cargar platillos: {errPlatillos.message}
          </p>
        </div>
      )}

      <div className="card">
        <MenuForm platillos={platillos || []} menuActual={menuActual || []} />
      </div>
    </div>
  );
}