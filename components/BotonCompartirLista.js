"use client";

import { Share2 } from "lucide-react";
import { useToast } from "./ToastProvider";

// En el celular abre el menú de compartir (WhatsApp, notas…);
// en la compu copia la lista al portapapeles.
export default function BotonCompartirLista({ texto }) {
  const { toast } = useToast();

  async function compartir() {
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ text: texto });
        return;
      } catch (err) {
        if (err?.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(texto);
      toast("Lista copiada al portapapeles");
    } catch {
      toast("No se pudo copiar la lista.", "error");
    }
  }

  return (
    <button type="button" className="btn btn-secondary" onClick={compartir}>
      <Share2 size={16} aria-hidden="true" />
      Compartir lista
    </button>
  );
}
