import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { DIAS_SEMANA } from "@/lib/fecha";
import {
  SELECT_INVENTARIO_COMPRAS,
  SELECT_MENU_COMPRAS,
  calcularCompras,
  formatearCantidad as fmt,
} from "@/lib/compras";

export const dynamic = "force-dynamic";
export const metadata = { title: "Compras" };

export default async function ComprasPage() {
  const [{ data: menu, error: errMenu }, { data: inventario, error: errInv }] =
    await Promise.all([
      supabase.from("menu_semana").select(SELECT_MENU_COMPRAS).in("dia", DIAS_SEMANA),
      supabase.from("inventario_con_estado").select(SELECT_INVENTARIO_COMPRAS),
    ]);

  if (errMenu || errInv) {
    return (
      <div>
        <h1>Lista de compras</h1>
        <div className="card">
          <p className="empty texto-error">Error: {errMenu?.message || errInv?.message}</p>
        </div>
      </div>
    );
  }

  const { platillos, faltantes, disponible } = calcularCompras(menu, inventario);
  const faltantePorId = Object.fromEntries(faltantes.map((f) => [f.id, f.faltante]));

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
            <Link href="/menu">Menú</Link> y elige qué van a comer.
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
                  Necesitas {fmt(item.requerido)} {item.unidad} · tienes{" "}
                  {fmt(item.disponible)}
                </div>
              </div>
              <span className="pill pill-warn">
                {fmt(item.faltante)} {item.unidad}
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

              {p.ingredientes.map((ing) => (
                <div className="row" key={ing.id}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row-name">{ing.nombre}</div>
                    <div className="row-sub">
                      {fmt(ing.total)} {ing.unidad}
                      {p.veces > 1 && (
                        <span style={{ opacity: 0.7 }}>
                          {" "}
                          ({fmt(ing.por_vez)} × {p.veces})
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`pill ${ing.cubierto ? "pill-ok" : "pill-warn"}`}
                    title={
                      ing.cubierto
                        ? `Tienes ${fmt(disponible(ing.id))} ${ing.unidad} en el depa`
                        : `Te faltan ${fmt(faltantePorId[ing.id] ?? 0)} ${ing.unidad} para toda la semana`
                    }
                  >
                    {ing.cubierto ? "✓" : "falta"}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
