// Logo de la app (misma olla que app/icon.svg). Decorativo: el nombre va al lado.
export default function Logo({ className = "marca-logo" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#2e5b39" />
      <path
        d="M24 22 Q22 16 25 11"
        stroke="#f3f4f1"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M40 22 Q42 16 39 11"
        stroke="#f3f4f1"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M12 32 Q12 52 32 52 Q52 52 52 32 Z" fill="#f3f4f1" />
      <path
        d="M18 40 Q32 44 46 40"
        stroke="#c99a2e"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
