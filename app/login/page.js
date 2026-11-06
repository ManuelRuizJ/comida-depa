import LoginForm from "@/components/LoginForm";
import Logo from "@/components/Logo";
import { rutaSegura } from "@/lib/auth";

export const metadata = { title: "Entrar" };

export default function LoginPage({ searchParams }) {
  const next = rutaSegura(searchParams?.next);

  return (
    <div className="login-wrap">
      <div className="panel login-card">
        <header>
          <Logo className="marca-logo login-logo" />
          <div className="fila-texto">
            <h1>Cocina Depa</h1>
            <p>Escribe la palabra clave para entrar.</p>
          </div>
        </header>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
