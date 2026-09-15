import { supabase } from "@/lib/supabase";
import ItemHoy from "@/components/ItemHoy";

export const metadata = { title: "Hoy" };

export const dynamic = "force-dynamic";

const DIAS_VALIDOS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

function diaDeHoy() {
  const nombres = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  return nombres[new Date().getDay()];
}

export default async function HoyPage() {
  const hoy = diaDeHoy();
  const esDiaDeSemana = DIAS_VALIDOS.includes(hoy);

  let items = [];
  if (esDiaDeSemana) {
    const { data } = await supabase
      .from("menu_semana")
      .select("id, comido, platillos(nombre)")
      .eq("dia", hoy);
    items = data || [];
  }

  return (
    <div>
      <h1>Hoy es {hoy}</h1>

      {!esDiaDeSemana && (
        <div className="card">
          <p className="empty">No comen en el depa este día.</p>
        </div>
      )}

      {esDiaDeSemana && items.length === 0 && (
        <div className="card">
          <p className="empty">No hay nada asignado para hoy todavía.</p>
        </div>
      )}

      {esDiaDeSemana && items.length > 0 && (
        <div className="card">
          {items.map((item) => (
            <ItemHoy key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}