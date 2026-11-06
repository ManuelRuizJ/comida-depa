"use client";

import Link from "next/link";
import { CircleAlert } from "lucide-react";

export default function Error({ error, reset }) {
  return (
    <div className="pagina-aviso">
      <CircleAlert size={28} aria-hidden="true" color="var(--danger)" />
      <h1>No se pudo cargar esta página</h1>
      <p>{error?.message || "Ocurrió un error inesperado."}</p>
      <p>Si se repite, revisa la conexión con Supabase en la configuración del despliegue.</p>
      <div className="form-acciones">
        <button onClick={() => reset()} className="btn btn-primary">
          Intentar de nuevo
        </button>
        <Link href="/" className="btn btn-secondary">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
