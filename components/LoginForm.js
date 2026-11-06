"use client";

import { useState } from "react";

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
      setError(data.error || "No se pudo entrar");
      setClave("");
    } catch {
      setError("Sin conexión, intenta de nuevo");
    }
    setCargando(false);
  }

  return (
    <form onSubmit={entrar} className="login-form">
      <div className="form-field">
        <label htmlFor="clave">Palabra clave</label>
        <div className="login-input">
          <input
            id="clave"
            name="clave"
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
            placeholder="••••••••"
          />
          <button
            type="button"
            className="login-ver"
            onClick={() => setVer((v) => !v)}
            aria-label={ver ? "Ocultar palabra clave" : "Mostrar palabra clave"}
          >
            {ver ? "Ocultar" : "Ver"}
          </button>
        </div>
      </div>

      {error && <p className="pill pill-warn login-error">{error}</p>}

      <button
        type="submit"
        className="btn btn-primary login-btn"
        disabled={cargando || !clave.trim()}
      >
        {cargando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
