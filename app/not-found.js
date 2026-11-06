import Link from "next/link";

export const metadata = { title: "No encontrada" };

export default function NotFound() {
  return (
    <div className="pagina-aviso">
      <span className="eyebrow">Error 404</span>
      <h1>Esta página no existe</h1>
      <p>Puede que el enlace esté mal escrito o que la receta se haya borrado.</p>
      <Link href="/" className="btn btn-primary">
        Ir al inicio
      </Link>
    </div>
  );
}
