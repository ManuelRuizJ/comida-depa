import { supabase } from "@/lib/supabase";
import RecetaForm from "@/components/RecetaForm";

export const dynamic = "force-dynamic";

export default async function RecetasPage() {
  const { data: platillos } = await supabase
    .from("platillos")
    .select("id, nombre, categoria, tiempo_min, receta_ingredientes(cantidad_requerida, ingredientes(nombre, unidad))")
    .order("nombre");

  return (
    <div>
      <h1>Recetas</h1>

      <div className="card">
        <h2>Agregar receta</h2>
        <RecetaForm />
      </div>

      <h2 style={{ marginTop: 28 }}>Ya guardadas</h2>
      {(!platillos || platillos.length === 0) && <p className="empty">Todavía no hay recetas.</p>}
      {platillos?.map((p) => (
        <div className="card" key={p.id}>
          <h2>{p.nombre}</h2>
          <p className="row-sub">
            {p.categoria} · {p.tiempo_min} min
          </p>
          {p.receta_ingredientes.length > 0 && (
            <ul style={{ margin: "10px 0 0", paddingLeft: 20 }}>
              {p.receta_ingredientes.map((ri, i) => (
                <li key={i} className="row-sub">
                  {ri.ingredientes?.nombre} — {ri.cantidad_requerida} {ri.ingredientes?.unidad}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}