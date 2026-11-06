import Link from "next/link";
import { ArrowRight, Circle, CircleCheck, Package, ShoppingCart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DIAS_SEMANA, diaDeHoy, esDiaLaborable, fechaLarga } from "@/lib/fecha";
import { necesitaComprar } from "@/lib/inventario";
import { calcularCompras, formatearCantidad as fmt } from "@/lib/compras";
import ItemHoy from "@/components/ItemHoy";

export const dynamic = "force-dynamic";

const SELECT_MENU =
  "id, dia, comido, platillos(id, nombre, tiempo_min, receta_ingredientes(cantidad_requerida, ingredientes(id, nombre, unidad)))";

function plural(n, uno, varios) {
  return `${n} ${n === 1 ? uno : varios}`;
}

export default async function InicioPage() {
  const hoy = diaDeHoy();
  const laborable = esDiaLaborable(hoy);

  const [{ data: menu, error: errMenu }, { data: inventario, error: errInv }] = await Promise.all([
    supabase.from("menu_semana").select(SELECT_MENU).in("dia", DIAS_SEMANA),
    supabase
      .from("inventario_con_estado")
      .select("ingrediente_id, cantidad_actual, cantidad_minima"),
  ]);

  if (errMenu || errInv) {
    throw new Error(`No se pudo cargar el resumen: ${(errMenu || errInv).message}`);
  }

  const deHoy = laborable ? menu.filter((f) => f.dia === hoy) : [];
  const pendientes = deHoy.filter((f) => !f.comido).length;
  const bajos = inventario.filter(necesitaComprar).length;
  const { faltantes } = calcularCompras(menu, inventario);

  let resumen;
  if (!laborable) resumen = "No se cocina en el depa hoy. El menú de la semana sigue abajo.";
  else if (deHoy.length === 0) resumen = "Todavía no hay nada asignado para hoy.";
  else if (pendientes === 0) resumen = "Todo lo de hoy ya está marcado como comido.";
  else
    resumen = `${plural(pendientes, "platillo pendiente", "platillos pendientes")} de ${deHoy.length}.`;

  return (
    <>
      <header className="page-head">
        <div>
          <span className="eyebrow">{laborable ? "Hoy" : "Fin de semana"}</span>
          <h1>{fechaLarga()}</h1>
          <p className="page-sub">{resumen}</p>
        </div>
      </header>

      <div className="grid-2">
        <section className="panel" aria-labelledby="titulo-hoy">
          <div className="panel-head">
            <div>
              <h2 id="titulo-hoy">Para hoy</h2>
              <p>Márcalo cuando lo coman y se descuenta del inventario.</p>
            </div>
            {deHoy.length > 0 && (
              <span className={`badge ${pendientes === 0 ? "badge-ok" : "badge-warn"}`}>
                {pendientes === 0 ? "Listo" : plural(pendientes, "pendiente", "pendientes")}
              </span>
            )}
          </div>

          {deHoy.length > 0 ? (
            deHoy.map((item) => <ItemHoy key={item.id} item={item} />)
          ) : (
            <div className="vacio">
              <strong>{laborable ? "Nada asignado para hoy" : "Hoy no hay plan"}</strong>
              <p>
                {laborable ? "Agrega platillos desde el menú." : "El menú es de lunes a viernes."}
              </p>
              <Link href="/menu" className="btn btn-secondary btn-sm">
                Ir al menú
              </Link>
            </div>
          )}
        </section>

        <div className="stack">
          <section className="panel" aria-labelledby="titulo-compras">
            <div className="panel-head">
              <h2 id="titulo-compras">Lista de compras</h2>
              <ShoppingCart size={18} aria-hidden="true" color="var(--text-subtle)" />
            </div>
            <div className="resumen-num">
              <strong>{faltantes.length}</strong>
              <span>
                {faltantes.length === 1 ? "ingrediente falta" : "ingredientes faltan"} para el menú
              </span>
            </div>
            {faltantes.length > 0 && (
              <ul className="lista">
                {faltantes.slice(0, 4).map((f) => (
                  <li key={f.id} className="fila">
                    <span className="fila-titulo">{f.nombre}</span>
                    <span className="cantidad">
                      {fmt(f.faltante)}
                      <small>{f.unidad}</small>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="panel-pie">
              <Link href="/compras" className="btn btn-ghost btn-sm">
                {faltantes.length > 4 ? `Ver los ${faltantes.length}` : "Ver lista"}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </section>

          <section className="panel" aria-labelledby="titulo-inventario">
            <div className="panel-head">
              <h2 id="titulo-inventario">Inventario</h2>
              <Package size={18} aria-hidden="true" color="var(--text-subtle)" />
            </div>
            <div className="resumen-num">
              <strong>{bajos}</strong>
              <span>de {inventario.length} en el mínimo o abajo</span>
            </div>
            <div className="panel-pie">
              <Link href="/inventario" className="btn btn-ghost btn-sm">
                Revisar inventario
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </section>
        </div>
      </div>

      <div className="seccion-titulo">
        <h2>Esta semana</h2>
        <Link href="/menu" className="btn btn-ghost btn-sm">
          Editar menú
        </Link>
      </div>
      <div className="semana">
        {DIAS_SEMANA.map((dia) => {
          const delDia = menu.filter((f) => f.dia === dia && f.platillos);
          return (
            <section key={dia} className="semana-dia" data-hoy={dia === hoy} aria-label={dia}>
              <div className="semana-dia-head">
                {dia}
                {dia === hoy && <span className="sr-only">(hoy)</span>}
              </div>
              {delDia.length === 0 ? (
                <p className="nada">Sin platillos</p>
              ) : (
                <ul>
                  {delDia.map((f) => (
                    <li key={f.id} data-comido={f.comido}>
                      {f.comido ? (
                        <CircleCheck size={14} aria-label="Comido" />
                      ) : (
                        <Circle size={14} aria-label="Pendiente" />
                      )}
                      {f.platillos.nombre}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
