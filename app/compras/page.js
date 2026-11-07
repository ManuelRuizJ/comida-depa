import Link from "next/link";
import { CircleCheck, ShoppingCart, TriangleAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";
import BotonCompartirLista from "@/components/BotonCompartirLista";
import { DIAS_SEMANA } from "@/lib/fecha";
import {
  SELECT_INVENTARIO_COMPRAS,
  SELECT_MENU_COMPRAS,
  calcularCompras,
  formatearCantidad as fmt,
  listaComoTexto,
} from "@/lib/compras";

export const dynamic = "force-dynamic";
export const metadata = { title: "Compras" };

export default async function ComprasPage() {
  const [{ data: menu, error: errMenu }, { data: inventario, error: errInv }] = await Promise.all([
    supabase.from("menu_semana").select(SELECT_MENU_COMPRAS).in("dia", DIAS_SEMANA),
    supabase.from("inventario_con_estado").select(SELECT_INVENTARIO_COMPRAS),
  ]);

  if (errMenu || errInv) {
    throw new Error(`No se pudo calcular la lista: ${(errMenu || errInv).message}`);
  }

  const { platillos, faltantes, disponible } = calcularCompras(menu, inventario);

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Lista de compras</h1>
          <p className="page-sub">
            Lo que piden los platillos pendientes de la semana, menos lo que ya hay en el
            inventario.
          </p>
        </div>
        {faltantes.length > 0 && (
          <div className="page-acciones">
            <BotonCompartirLista texto={listaComoTexto(faltantes)} />
          </div>
        )}
      </header>

      {platillos.length === 0 ? (
        <div className="panel vacio">
          <ShoppingCart size={28} aria-hidden="true" />
          <strong>No hay platillos pendientes esta semana</strong>
          <p>La lista se arma sola a partir del menú.</p>
          <Link href="/menu" className="btn btn-secondary btn-sm">
            Armar el menú
          </Link>
        </div>
      ) : (
        <div className="grid-2 invertida">
          <section className="panel sticky-top" aria-labelledby="titulo-comprar">
            <div className="panel-head">
              <div>
                <h2 id="titulo-comprar">Por comprar</h2>
                <p>
                  {faltantes.length === 0
                    ? "Con lo que hay alcanza para todo el menú."
                    : faltantes.length === 1
                      ? "1 ingrediente"
                      : `${faltantes.length} ingredientes`}
                </p>
              </div>
            </div>
            {faltantes.length === 0 ? (
              <div className="vacio">
                <CircleCheck size={28} aria-hidden="true" />
                <strong>No falta nada</strong>
              </div>
            ) : (
              <ul className="lista">
                {faltantes.map((item) => (
                  <li key={item.id} className="compra-fila">
                    <div className="fila-texto">
                      <span className="fila-titulo">{item.nombre}</span>
                      <span className="fila-sub num">
                        Se necesitan {fmt(item.requerido)}, hay {fmt(item.disponible)}
                      </span>
                    </div>
                    <span className="cantidad">
                      {fmt(item.faltante)}
                      <small>{item.unidad}</small>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="titulo-desglose" className="stack">
            <h2 id="titulo-desglose" className="sr-only">
              Por platillo
            </h2>
            {platillos.map((p) => (
              <article className="panel" key={p.id}>
                <div className="panel-head">
                  <div>
                    <h3>{p.nombre}</h3>
                    <p>
                      {p.dias.join(", ")}
                      {p.veces > 1 && ` · ${p.veces} veces`}
                    </p>
                  </div>
                </div>

                {p.ingredientes.length === 0 ? (
                  <p className="panel-body fila-sub">
                    Esta receta no tiene ingredientes capturados.
                  </p>
                ) : (
                  <ul className="lista">
                    {p.ingredientes.map((ing) => {
                      const hay = disponible(ing.id);
                      return (
                        <li key={ing.id} className="desglose-fila">
                          <span>{ing.nombre}</span>
                          <span className="cantidad">
                            {fmt(ing.total)}
                            <small>{ing.unidad}</small>
                            {p.veces > 1 && (
                              <span className="por-vez num">
                                {" "}
                                ({fmt(ing.por_vez)} × {p.veces})
                              </span>
                            )}
                          </span>
                          <span
                            className="icono-estado"
                            data-falta={!ing.cubierto}
                            title={
                              ing.cubierto
                                ? `Hay ${fmt(hay)} ${ing.unidad}`
                                : `Hay ${fmt(hay)} ${ing.unidad}: no alcanza para la semana`
                            }
                          >
                            {ing.cubierto ? (
                              <CircleCheck size={16} aria-label="Alcanza" />
                            ) : (
                              <TriangleAlert size={16} aria-label="Falta" />
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </article>
            ))}
          </section>
        </div>
      )}
    </>
  );
}
