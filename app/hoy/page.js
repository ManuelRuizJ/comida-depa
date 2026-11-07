import { redirect } from "next/navigation";

// "Hoy" ahora es la página de inicio. Se conserva la ruta porque los
// correos y la página de confirmación enlazan aquí.
export default function HoyPage() {
  redirect("/");
}
