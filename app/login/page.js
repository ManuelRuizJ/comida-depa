import LoginForm from "@/components/LoginForm";
import { rutaSegura } from "@/lib/auth";

export const metadata = { title: "Entrar" };

export default function LoginPage({ searchParams }) {
  const next = rutaSegura(searchParams?.next);

  return (
    <div className="login-wrap">
      <div className="card login-card">
        <h1>Hola de nuevo 👋</h1>
        <p className="login-sub">Escribe la palabra clave para entrar a la cocina.</p>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
