"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastProvider";

export default function BotonBorrarReceta({ id, nombre }) {
  const router = useRouter();
  const { toast } = useToast();
  const [borrando, setBorrando] = useState(false);

  async function borrar() {
    const confirmado = confirm(
      `¿Borrar "${nombre}"?\n\nTambién se quitará del menú de la semana si estaba asignada.`
    );
    if (!confirmado) return;

    setBorrando(true);
    const res = await fetch(`/api/recetas/${id}`, { method: "DELETE" });
    setBorrando(false);

    if (!res.ok) {
      toast("No se pudo borrar", "error");
      return;
    }

    toast(`"${nombre}" borrada`, "warn");
    router.refresh();
  }

  return (
    <button
      className="btn btn-ghost"
      onClick={borrar}
      disabled={borrando}
      style={{ color: "#b03a2e" }}
    >
      {borrando ? "..." : "Borrar"}
    </button>
  );
}