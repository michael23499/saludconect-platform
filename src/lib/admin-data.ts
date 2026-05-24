// Datos de ejemplo del panel admin. Centralizados aquí para que el resumen
// (/admin) y las páginas de detalle (/admin/approvals, /admin/payments, …)
// compartan la misma fuente. Sustituir por queries reales cuando existan.

export const APROBACIONES = [
  { name: "Dra. Beatriz Soler", role: "Médico/a · Oftalmología · Sevilla", date: "hace 12 min", docs: 4 },
  { name: "Roberto Vela", role: "Fisioterapeuta · Madrid", date: "hace 1 h", docs: 3 },
  { name: "Clínica Salud Vives", role: "Centro multi-sede · 4 ubicaciones", date: "hace 2 h", docs: 6 },
  { name: "Laura Gómez", role: "Enfermero/a · Sevilla", date: "hace 5 h", docs: 2 },
] as const;

export const PAGOS = [
  { client: "Clínica Mediterránea", plan: "Clínica Pro", amount: "149 €", state: "paid", date: "15 May" },
  { client: "Centro Dental Norte", plan: "Clínica Starter", amount: "79 €", state: "paid", date: "14 May" },
  { client: "Clínica Sanitas Norte", plan: "Clínica Pro", amount: "149 €", state: "pending", date: "14 May" },
  { client: "Salud Vives", plan: "Clínica Pro × 4", amount: "596 €", state: "paid", date: "12 May" },
  { client: "Clínica Bilbao", plan: "Clínica Starter", amount: "79 €", state: "failed", date: "11 May" },
] as const;

export const BOXES = [
  { titleKey: "topCities", items: [["Madrid", "1.842"], ["Barcelona", "962"], ["Valencia", "618"], ["Sevilla", "412"], ["Bilbao", "297"]] },
  { titleKey: "topSpecialties", items: [["Enfermería", "1.042"], ["Fisioterapia", "521"], ["Odontología", "384"], ["Pediatría", "218"], ["Cardiología", "142"]] },
  { titleKey: "conversion", items: [["Visitantes web", "42.180"], ["Registros", "1.892"], ["Verificados", "1.612"], ["Activos", "1.247"], ["Clínicas pagando", "321"]] },
] as const;

export const ACTIVITY = [
  42, 51, 38, 60, 72, 55, 80, 67, 90, 84, 95, 88, 103, 96, 110, 118, 112, 126,
  134, 121, 142, 138, 150, 162, 156, 170, 178, 165, 188, 196,
];
