// .mjs (y no .js) para que también lo puedan importar los scripts de node
// sin configurar "type": "module", que rompe next/font en Next 14.
//
// Qué día es "hoy" en el depa.
//
// Vercel y GitHub Actions corren en UTC, así que `new Date().getDay()`
// se adelanta un día a partir de las 6 PM en Puebla (UTC-6). Aquí se
// calcula siempre con la hora de México.

export const ZONA_HORARIA = "America/Mexico_City";

const NOMBRES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const CORTOS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Días en que se cocina en el depa (los que se pueden planear en el menú).
export const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

export function diaDeHoy(fecha = new Date()) {
  const corto = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONA_HORARIA,
    weekday: "short",
  }).format(fecha);
  return NOMBRES[CORTOS.indexOf(corto)];
}

export function esDiaLaborable(dia) {
  return DIAS_SEMANA.includes(dia);
}

// Para ordenar platillos por el primer día en que aparecen.
export function ordenDia(dia) {
  const i = DIAS_SEMANA.indexOf(dia);
  return i === -1 ? 99 : i;
}

// "Viernes 6 de noviembre", con la fecha de México.
export function fechaLarga(fecha = new Date()) {
  const diaMes = new Intl.DateTimeFormat("es-MX", {
    timeZone: ZONA_HORARIA,
    day: "numeric",
    month: "long",
  }).format(fecha);
  return `${diaDeHoy(fecha)} ${diaMes}`;
}
