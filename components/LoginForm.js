"use client";

import { useState } from "react";
import { CircleAlert, Eye, EyeOff } from "lucide-react";

export default function LoginForm({ next }) {
  const [clave, setClave] = useState("");
  const [ver, setVer] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    if (!clave.trim() || cargando) return;

    setCargando(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clave }),
      });
      if (res.ok) {
        // Recarga completa para que todo se pinte ya con la sesión.
        window.location.replace(next);
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(res.status === 401 ? "Esa no es la palabra clave." : data.error || "No se pudo entrar.");
      setClave("");
    } catch {
      setError("Sin conexión. Revisa el internet e intenta de nuevo.");
    }
    setCargando(false);
  }

  const Icono = ver ? EyeOff : Eye;

  return (
    <form onSubmit={entrar} className="fields">
      <div className="field">
        <label className="field-label" htmlFor="clave">
          Palabra clave
        </label>
        <div className="login-clave">
          <input
            id="clave"
            name="clave"
            className="input"
            type={ver ? "text" : "password"}
            value={clave}
            onChange={(e) => {
              setClave(e.target.value);
              if (error) setError("");
            }}
            autoFocus
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "clave-error" : undefined}
          />
          <button
            type="button"
            className="btn btn-ghost btn-icon btn-sm"
            onClick={() => setVer((v) => !v)}
            aria-label={ver ? "Ocultar palabra clave" : "Mostrar palabra clave"}
            aria-pressed={ver}
          >
            <Icono size={17} aria-hidden="true" />
          </button>
        </div>
      </div>

      {error && (
        <p className="texto-error" id="clave-error" role="alert">
          <CircleAlert size={16} aria-hidden="true" />
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary btn-block" disabled={cargando || !clave.trim()}>
        {cargando ? <span className="spinner" /> : "Entrar"}
      </button>
    </form>
  );
}
