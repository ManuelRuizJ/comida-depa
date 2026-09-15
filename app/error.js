"use client";

import Link from "next/link";

export default function Error({ error, reset }) {
  return (
    <div style={{ textAlign: "center", paddingTop: 40 }}>
      <h1 style={{ fontSize: "2.2rem" }}>Algo se quemó 🔥</h1>
      <p className="row-sub" style={{ marginBottom: 24 }}>
        {error?.message || "Algo salió mal cargando esta página."}
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={() => reset()} className="btn btn-primary">
          Intentar de nuevo
        </button>
        <Link href="/" className="btn btn-ghost">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}