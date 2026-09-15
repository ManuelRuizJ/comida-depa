import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const ORDEN_DIAS = { Lunes: 1, Martes: 2, Miércoles: 3, Jueves: 4, Viernes: 5 };

export default async function ComprasPage() {
  const { data: menu, error: errMenu } = await supabase
    .from("menu_semana")
    .select(
      "dia, platillos(id, nombre, receta_ingredientes(cantidad_requerida, ingredientes(id, nombre, unidad)))"
    )
    .in("dia", DIAS);

  const { data: inventario, error: errInv } = await supabase
    .from("inventario_con_estado")
    .select("ingrediente_id, nombre, unidad, cantidad_actual");

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

  // --- 1. Agrupar por platillo único ---
  const platillosMap = {};
  (menu || []).forEach((fila) => {
    const p = fila.platillos;
    if (!p) return;

    if (!platillosMap[p.id]) {
      platillosMap[p.id] = {
        id: p.id,
        nombre: p.nombre,
        dias: new Set(),
        veces: 0,
        ingredientes: {},
      };
    }
    platillosMap[p.id].dias.add(fila.dia);
    platillosMap[p.id].veces += 1;

    (p.receta_ingredientes || []).forEach((ri) => {
      const ing = ri.ingredientes;
      if (!ing) return;
      if (!platillosMap[p.id].ingredientes[ing.id]) {
        platillosMap[p.id].ingredientes[ing.id] = {
          id: ing.id,
          nombre: ing.nombre,
          unidad: ing.unidad,
          por_vez: Number(ri.cantidad_requerida) || 0,
        };
      }
    });
  });

  const platillos = Object.values(platillosMap)
    .map((p) => ({
      ...p,
      dias: Array.from(p.dias).sort((a, b) => ORDEN_DIAS[a] - ORDEN_DIAS[b]),
      ingredientes: Object.values(p.ingredientes),
    }))
    .sort((a, b) => {
      const diaA = ORDEN_DIAS[a.dias[0]] || 99;
      const diaB = ORDEN_DIAS[b.dias[0]] || 99;
      if (diaA !== diaB) return diaA - diaB;
      return a.nombre.localeCompare(b.nombre);
    });

  // --- 2. Total global por ingrediente ---
  const totalPorIngrediente = {};
  platillos.forEach((p) => {
    p.ingredientes.forEach((ing) => {
      if (!totalPorIngrediente[ing.id]) {
        totalPorIngrediente[ing.id] = {
          nombre: ing.nombre,
          unidad: ing.unidad,
          requerido: 0,
        };
      }
      totalPorIngrediente[ing.id].requerido += ing.por_vez * p.veces;
    });
  });

  const invPorId = {};
  (inventario || []).forEach((i) => {
    invPorId[i.ingrediente_id] = i;
  });

  const faltantes = Object.entries(totalPorIngrediente)
    .map(([id, info]) => {
      const inv = invPorId[id];
      const disponible = inv ? Number(inv.cantidad_actual) : 0;
      return {
        id,
        ...info,
        disponible,
        faltante: Math.max(0, info.requerido - disponible),
      };
    })
    .filter((i) => i.faltante > 0)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  return (
    <div>
      <h1>Lista de compras</h1>
      <p className="row-sub">
        Calculada del menú de la semana menos lo que ya hay en el depa.
      </p>

      {platillos.length === 0 && (
        <div className="card">
          <p className="empty">
            Todavía no hay menú armado para esta semana. Ve a{" "}
            <a href="/menu">Menú</a> y elige qué van a comer.
          </p>
        </div>
      )}

      {/* --- Resumen rápido --- */}
      {faltantes.length > 0 && (
        <div className="card card-comprar">
          <h2 style={{ marginBottom: 4 }}>🛒 A comprar ({faltantes.length})</h2>
          <p className="row-sub" style={{ marginBottom: 12 }}>
            Lo que falta para cubrir todo el menú:
          </p>
          {faltantes.map((item) => (
            <div className="row" key={item.id}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row-name">{item.nombre}</div>
                <div className="row-sub">
                  Necesitas {item.requerido} {item.unidad} · tienes{" "}
                  {item.disponible}
                </div>
              </div>
              <span className="pill pill-warn">
                {item.faltante} {item.unidad}
              </span>
            </div>
          ))}
        </div>
      )}

      {platillos.length > 0 && faltantes.length === 0 && (
        <div className="card">
          <p className="empty">
            🎉 No falta nada. Todo cubierto con lo que hay en el depa.
          </p>
        </div>
      )}

      {/* --- Desglose por platillo --- */}
      {platillos.length > 0 && (
        <>
          <h2 style={{ marginTop: 32 }}>Desglose por platillo</h2>
          {platillos.map((p) => (
            <div className="card platillo-card" key={p.id}>
              <div className="platillo-head">
                <h3>{p.nombre}</h3>
                <span className="platillo-dias">
                  {p.dias.join(" · ")}
                  {p.veces > 1 && ` (×${p.veces})`}
                </span>
              </div>

              {p.ingredientes.length === 0 && (
                <p className="row-sub" style={{ margin: "8px 0 0" }}>
                  Sin ingredientes capturados en la receta.
                </p>
              )}

              {p.ingredientes.map((ing) => {
                const total = totalPorIngrediente[ing.id];
                const inv = invPorId[ing.id];
                const disp = inv ? Number(inv.cantidad_actual) : 0;
                const cubierto = disp >= total.requerido;
                const cantidadEstePlatillo = ing.por_vez * p.veces;

                return (
                  <div className="row" key={ing.id}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="row-name">{ing.nombre}</div>
                      <div className="row-sub">
                        {cantidadEstePlatillo} {ing.unidad}
                        {p.veces > 1 && (
                          <span style={{ opacity: 0.7 }}>
                            {" "}
                            ({ing.por_vez} × {p.veces})
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`pill ${cubierto ? "pill-ok" : "pill-warn"}`}
                      title={
                        cubierto
                          ? `Tienes ${disp} ${ing.unidad} en el depa`
                          : `Te faltan ${Math.max(
                              0,
                              total.requerido - disp
                            )} ${ing.unidad} para toda la semana`
                      }
                    >
                      {cubierto ? "✓" : "falta"}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </>
      )}
    </div>
  );
}