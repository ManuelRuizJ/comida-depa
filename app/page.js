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
  if (esDiaDeSemana) {
    const { data } = await supabase
      .from("menu_semana")
      .select("id, comido, platillos(nombre)")
      .eq("dia", hoy);
    itemsHoy = data || [];
  }

  const { data: inventario } = await supabase
    .from("inventario_con_estado")
    .select("estado");

  const faltantes = (inventario || []).filter((i) =>
    i.estado.includes("Comprar")
  ).length;

  const pendientes = itemsHoy.filter((i) => !i.comido).length;

  return (
    <div>
      <h1>Buenas 👋</h1>

      {/* Hero: hoy */}
      <div className="card hero-hoy">
        <div className="hero-hoy-head">
          <h2 style={{ margin: 0 }}>{hoy}</h2>
          {esDiaDeSemana && itemsHoy.length > 0 && (
            <span className={`pill ${pendientes === 0 ? "pill-ok" : "pill-warn"}`}>
              {pendientes === 0
                ? "✓ Todo listo"
                : `${pendientes} pendiente${pendientes === 1 ? "" : "s"}`}
            </span>
          )}
        </div>

        {!esDiaDeSemana && (
          <p className="row-sub" style={{ margin: "8px 0 0" }}>
            No comen en el depa este día.
          </p>
        )}

        {esDiaDeSemana && itemsHoy.length === 0 && (
          <p className="row-sub" style={{ margin: "8px 0 0" }}>
            Nada asignado todavía.{" "}
            <Link href="/menu" style={{ fontWeight: 500 }}>
              Armar el menú
            </Link>
          </p>
        )}

        {itemsHoy.length > 0 && (
          <div style={{ marginTop: 12 }}>
            {itemsHoy.map((item) => (
              <div className="row" key={item.id}>
                <span className="row-name">{item.platillos?.nombre}</span>
                <span className={`pill ${item.comido ? "pill-ok" : "pill-warn"}`}>
                  {item.comido ? "✓ Comido" : "Pendiente"}
                </span>
              </div>
            ))}
          </div>
        )}

        {esDiaDeSemana && (
          <div style={{ marginTop: 16 }}>
            <Link href="/hoy" className="btn btn-primary">
              Ver hoy
            </Link>
          </div>
        )}
      </div>

      {/* Accesos rápidos */}
      <div className="grid-links">
        <Link href="/menu" className="card card-link">
          <h2>Menú de la semana</h2>
          <p>Elige qué van a comer de lunes a viernes.</p>
        </Link>

        <Link href="/inventario" className="card card-link">
          <h2>Inventario</h2>
          <p>
            {faltantes > 0
              ? `${faltantes} cosa${faltantes === 1 ? "" : "s"} por comprar.`
              : "Todo en orden por ahora."}
          </p>
        </Link>

        <Link href="/compras" className="card card-link">
          <h2>Lista de compras</h2>
          <p>Calculada del menú menos lo que ya tienen.</p>
        </Link>
      </div>
    </div>
  );
}