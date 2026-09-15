import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", paddingTop: 40 }}>
      <h1 style={{ fontSize: "2.2rem" }}>Aquí no hay nada 🍳</h1>
      <p className="row-sub" style={{ marginBottom: 24 }}>
        La página que buscas no existe, o se movió a otro lado.
      </p>
      <Link href="/" className="btn btn-primary">
        Volver al inicio
      </Link>
    </div>
  );
}