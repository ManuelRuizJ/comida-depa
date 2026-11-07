"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useToast } from "./ToastProvider";

export default function BotonBorrarReceta({ id, nombre }) {
  const router = useRouter();
  const { toast } = useToast();
  const [borrando, setBorrando] = useState(false);

  async function borrar() {
    const confirmado = window.confirm(
      `¿Borrar la receta "${nombre}"?\n\nSi está en el menú de la semana, también se quitará de ahí.`
    );
    if (!confirmado) return;

    setBorrando(true);
    const res = await fetch(`/api/recetas/${id}`, { method: "DELETE" }).catch(() => null);
    setBorrando(false);

    if (!res?.ok) {
      toast(`No se pudo borrar "${nombre}".`, "error");
      return;
    }
    toast(`Receta "${nombre}" borrada`, "warn");
    router.refresh();
  }

  return (
    <button className="btn btn-ghost btn-peligro btn-sm" onClick={borrar} disabled={borrando}>
      {borrando ? <span className="spinner" /> : <Trash2 size={14} aria-hidden="true" />}
      Borrar
    </button>
  );
}
