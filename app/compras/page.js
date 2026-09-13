import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

export default async function ComprasPage() {
  // 1. Todo el menú de la semana, con los ingredientes de cada platillo
  const { data: menu, error: errMenu } = await supabase
    .from("menu_semana")
    .select(
      "dia, platillos(nombre, receta_ingredientes(cantidad_requerida, ingredientes(id, nombre, unidad)))"
    )
    .in("dia", DIAS);

  // 2. Inventario completo con su estado
  const { data: inventario, error: errInv } = await supabase
    .from("inventario_con_estado")
    .select("ingrediente_id, nombre, unidad, cantidad_actual, estado");

  if (errMenu || errInv) {
    return (
      <div>
        <h1>Lista de compras</h1>
        <div className="card">
          <p className="empty" style={{ color: "#b03a2e" }}>
            Error: {errMenu?.message || errInv?.message}
          </p>
        </div>
      </div>
    );
  }

  // 3. Sumar cuánto se necesita de cada ingrediente en toda la semana
  const necesidades = {};
  (menu || []).forEach((fila) => {
    const receta = fila.platillos?.receta_ingredientes || [];
    receta.forEach((ri) => {
      const ing = ri.ingredientes;
      if (!ing) return;
      if (!necesidades[ing.id]) {
        necesidades[ing.id] = {
          nombre: ing.nombre,
          unidad: ing.unidad,
          requerido: 0,
        };
      }
      necesidades[ing.id].requerido += Number(ri.cantidad_requerida) || 0;
    });
  });

  // 4. Cruzar con inventario y calcular faltante
  const invPorId = {};
  (inventario || []).forEach((i) => {
    invPorId[i.ingrediente_id] = i;
  });

  const lista = Object.entries(necesidades)
    .map(([id, n]) => {
      const inv = invPorId[id];
      const disponible = inv ? Number(inv.cantidad_actual) : 0;
      const faltante = Math.max(0, n.requerido - disponible);
      return {
        id,
        nombre: n.nombre,
        unidad: n.unidad,
        requerido: n.requerido,
        disponible,
        faltante,
        comprar: faltante > 0,
      };
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  const porComprar = lista.filter((i) => i.comprar);
  const yaTienen = lista.filter((i) => !i.comprar);

  return (
    <div>
      <h1>Lista de compras</h1>
      <p className="row-sub">
        Calculada del menú de la semana menos lo que ya hay en el depa.
      </p>

      {lista.length === 0 && (
        <div className="card">
          <p className="empty">
            Todavía no hay menú armado para esta semana. Ve a{" "}
            <a href="/menu">Menú</a> y elige qué van a comer.
          </p>
        </div>
      )}

      {porComprar.length > 0 && (
        <>
          <h2 style={{ marginTop: 24 }}>Por comprar ({porComprar.length})</h2>
          <div className="card">
            {porComprar.map((item) => (
              <div className="row" key={item.id}>
                <div>
                  <div className="row-name">{item.nombre}</div>
                  <div className="row-sub">
                    Necesitas {item.requerido} {item.unidad} · tienes{" "}
                    {item.disponible}
                  </div>
                </div>
                <span className="pill pill-warn">
                  Comprar {item.faltante} {item.unidad}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {porComprar.length === 0 && lista.length > 0 && (
        <div className="card">
          <p className="empty">
            🎉 No falta nada. Todo cubierto con lo que hay en el depa.
          </p>
        </div>
      )}

      {yaTienen.length > 0 && (
        <>
          <h2 style={{ marginTop: 32 }}>Ya tienes suficiente</h2>
          <div className="card">
            {yaTienen.map((item) => (
              <div className="row" key={item.id}>
                <div>
                  <div className="row-name">{item.nombre}</div>
                  <div className="row-sub">
                    Necesitas {item.requerido} {item.unidad} · tienes{" "}
                    {item.disponible}
                  </div>
                </div>
                <span className="pill pill-ok">✓ Suficiente</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}