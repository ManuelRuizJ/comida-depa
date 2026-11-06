"use client";

import { useToast } from "./ToastProvider";

// En el celular abre el menú de compartir (WhatsApp, notas…);
// en la compu copia la lista al portapapeles.
export default function BotonCompartirLista({ texto }) {
  const { toast } = useToast();

  async function compartir() {
    if (navigator.share) {
      try {
        await navigator.share({ text: texto });
        return;
      } catch (err) {
        if (err?.name === "AbortError") return; // cerró el menú de compartir
      }
    }

    try {
      await navigator.clipboard.writeText(texto);
      toast("Lista copiada");
    } catch {
      toast("No se pudo copiar la lista", "error");
    }
  }

  return (
    <button type="button" className="btn btn-secondary" onClick={compartir}>
      Compartir lista
    </button>
  );
}
