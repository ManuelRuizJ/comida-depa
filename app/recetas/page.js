import { supabase } from "@/lib/supabase";
import Link from "next/link";
import RecetaForm from "@/components/RecetaForm";
import BotonBorrarReceta from "@/components/BotonBorrarReceta";

export const dynamic = "force-dynamic";

export default async function RecetasPage() {
  const { data: platillos } = await supabase
    .from("platillos")
    .select(
      "id, nombre, categoria, tiempo_min, receta_ingredientes(cantidad_requerida, ingredientes(nombre, unidad))"
    )
    .order("nombre");

  return (
    <div>
      <h1>Recetas</h1>

      <div className="card">
        <h2>Agregar receta</h2>
        <RecetaForm />
      </div>

      <h2 style={{ marginTop: 28 }}>
        Ya guardadas ({platillos?.length || 0})
      </h2>
      {(!platillos || platillos.length === 0) && (
        <p className="empty">Todavía no hay recetas.</p>
      )}
      {platillos?.map((p) => (
        <div className="card" key={p.id}>
          <div className="receta-header">
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2>{p.nombre}</h2>
              <p className="row-sub" style={{ margin: 0 }}>
                {p.categoria} · {p.tiempo_min} min
              </p>
            </div>
            <div className="receta-acciones">
              <Link href={`/recetas/${p.id}`} className="btn btn-secondary">
                Editar
              </Link>
              <BotonBorrarReceta id={p.id} nombre={p.nombre} />
            </div>
          </div>
          {p.receta_ingredientes.length > 0 && (
            <ul style={{ margin: "12px 0 0", paddingLeft: 20 }}>
              {p.receta_ingredientes.map((ri, i) => (
                <li key={i} className="row-sub">
                  {ri.ingredientes?.nombre} — {ri.cantidad_requerida}{" "}
                  {ri.ingredientes?.unidad}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}