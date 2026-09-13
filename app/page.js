import Link from "next/link";
import { supabase } from "@/lib/supabase";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

function diaDeHoy() {
  const nombres = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  return nombres[new Date().getDay()];
}

export default async function Home() {
  const hoy = diaDeHoy();
  const esDiaDeSemana = DIAS.includes(hoy);

  let itemsHoy = [];
  let faltantes = 0;

  if (esDiaDeSemana) {
    const { data } = await supabase
      .from("menu_semana")
      .select("id, comido, platillos(nombre)")
      .eq("dia", hoy);
    itemsHoy = data || [];
  }

  const { data: inventario } = await supabase.from("inventario_con_estado").select("*");
  faltantes = (inventario || []).filter((i) => i.estado.includes("Comprar")).length;

  return (
    <div>
      <h1>Buenas, ¿qué toca hoy?</h1>

      <div className="card">
        <h2>{hoy}</h2>
        {!esDiaDeSemana && <p className="row-sub">No comen en el depa este día.</p>}
        {esDiaDeSemana && itemsHoy.length === 0 && (
          <p className="row-sub">Nada asignado todavía para hoy.</p>
        )}
        {itemsHoy.map((item) => (
          <div className="row" key={item.id}>
            <span className="row-name">{item.platillos?.nombre}</span>
            <span className={`pill ${item.comido ? "pill-ok" : "pill-warn"}`}>
              {item.comido ? "Comido" : "Pendiente"}
            </span>
          </div>
        ))}
      </div>

      <div className="grid-links">
        <Link href="/hoy" className="card card-link">
          <h2>Hoy</h2>
          <p>Marca qué ya comieron o cambia el plan.</p>
        </Link>
        <Link href="/menu" className="card card-link">
          <h2>Menú de la semana</h2>
          <p>Elige qué van a comer de lunes a viernes.</p>
        </Link>
        <Link href="/inventario" className="card card-link">
          <h2>Inventario</h2>
          <p>
            {faltantes > 0
              ? `${faltantes} cosa(s) se están acabando.`
              : "Todo en orden por ahora."}
          </p>
        </Link>
      </div>
    </div>
  );
}