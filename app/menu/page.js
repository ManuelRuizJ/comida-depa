import { supabase } from "@/lib/supabase";
import { diaDeHoy } from "@/lib/fecha";
import MenuForm from "@/components/MenuForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Menú" };

export default async function MenuPage() {
  const [{ data: platillos, error: errPlatillos }, { data: menuActual, error: errMenu }] =
    await Promise.all([
      supabase.from("platillos").select("id, nombre, categoria").order("nombre"),
      supabase.from("menu_semana").select("id, dia, platillo_id, comido"),
    ]);

  if (errPlatillos || errMenu) {
    throw new Error(`No se pudo cargar el menú: ${(errPlatillos || errMenu).message}`);
  }

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Menú de la semana</h1>
          <p className="page-sub">
            Lunes a viernes. Un día puede tener varios platillos y un platillo puede repetirse.
          </p>
        </div>
      </header>

      <MenuForm platillos={platillos} menuActual={menuActual} hoy={diaDeHoy()} />
    </>
  );
}
