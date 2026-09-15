import { supabase } from "@/lib/supabase";
import MenuForm from "@/components/MenuForm";


export const metadata = { title: "Menú" };

export const dynamic = "force-dynamic";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

export default async function MenuPage() {
  const { data: platillos, error: errPlatillos } = await supabase
    .from("platillos")
    .select("id, nombre")
    .order("nombre");

  // ✅ FIX: incluir platillo_id, no solo la relación anidada
  const { data: menuActual, error: errMenu } = await supabase
    .from("menu_semana")
    .select("id, dia, platillo_id, comido, platillos(id, nombre, categoria)");

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

  const menuPorDia = {};
  DIAS.forEach((d) => (menuPorDia[d] = []));
  (menuActual || []).forEach((fila) => {
    if (menuPorDia[fila.dia]) {
      menuPorDia[fila.dia].push(fila);
    }
  });

  const totalSeleccionados = (menuActual || []).length;

  return (
    <div>
      <h1>Menú de la semana</h1>
      <p className="row-sub">
        Toca los platillos que quieran comer cada día — puedes elegir varios por día, o repetir el mismo en varios días.
      </p>

      <div className="card">
        <MenuForm platillos={platillos || []} menuActual={menuActual || []} />
      </div>

      <h2 style={{ marginTop: 32 }}>Menú guardado</h2>
      {totalSeleccionados === 0 && (
        <div className="card">
          <p className="empty">
            Todavía no han guardado nada. Elige platillos arriba y dale "Guardar menú".
          </p>
        </div>
      )}

      {totalSeleccionados > 0 &&
        DIAS.map((dia) => (
          <div className="card" key={dia}>
            <div className="day-title">{dia}</div>
            {menuPorDia[dia].length === 0 && (
              <p className="row-sub" style={{ margin: 0 }}>
                Sin platillos asignados.
              </p>
            )}
            {menuPorDia[dia].map((fila) => (
              <div className="row" key={fila.id}>
                <div>
                  <span className="row-name">{fila.platillos?.nombre}</span>
                  {fila.platillos?.categoria && (
                    <span className="row-sub"> · {fila.platillos.categoria}</span>
                  )}
                </div>
                <span className={`pill ${fila.comido ? "pill-ok" : "pill-warn"}`}>
                  {fila.comido ? "✓ Comido" : "Pendiente"}
                </span>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}