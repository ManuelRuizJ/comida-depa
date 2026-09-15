import { supabase } from "@/lib/supabase";
import MenuForm from "@/components/MenuForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Menú" };

export default async function MenuPage() {
  const { data: platillos, error: errPlatillos } = await supabase
    .from("platillos")
    .select("id, nombre, categoria")
    .order("nombre");

  const { data: menuActual } = await supabase
    .from("menu_semana")
    .select("id, dia, platillo_id, comido");

  if (errPlatillos) {
    return (
      <div>
        <h1>Menú de la semana</h1>
        <div className="card">
          <p className="empty" style={{ color: "#b03a2e" }}>
            Error al cargar platillos: {errPlatillos.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Menú de la semana</h1>
      <p className="row-sub">
        Arma lo que van a comer de lunes a viernes. Puedes repetir platillos y
        poner varios por día.
      </p>

      <MenuForm platillos={platillos || []} menuActual={menuActual || []} />
    </div>
  );
}