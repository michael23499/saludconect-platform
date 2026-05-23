export type ReservaStatus = "confirmada" | "pendiente" | "completada" | "cancelada";

export type ReservaPro = {
  id: string;
  clinic: string;
  clinicLogo?: string;
  city: string;
  specialty: string;
  date: string; // ISO yyyy-mm-dd
  start: string;
  end: string;
  hours: number;
  rateLabel: string;
  fee: number;
  status: ReservaStatus;
  shift: "Mañana" | "Tarde" | "Día completo";
  contact: string;
  notes?: string;
  message?: string;
};

export type ReservaClinica = {
  id: string;
  professional: string;
  role: string;
  city: string;
  level: "Rising Star" | "Trusted" | "Top Rated" | "Expert" | "Elite";
  date: string;
  start: string;
  end: string;
  hours: number;
  rateLabel: string;
  fee: number;
  status: ReservaStatus;
  shift: "Mañana" | "Tarde" | "Día completo";
  rating: number;
  notes?: string;
  message?: string;
};

export const PRO_RESERVAS: ReservaPro[] = [
  { id: "p-001", clinic: "Clínica Sanitas Norte", city: "Madrid", specialty: "Cardiología", date: "2026-05-28", start: "08:00", end: "14:00", hours: 6, rateLabel: "Especialista senior · €€€", fee: 510, status: "confirmada", shift: "Mañana", contact: "Marta Vives", message: "Necesitamos refuerzo en consulta. Acceso por entrada lateral." },
  { id: "p-002", clinic: "Hospital HM Madrid", city: "Madrid", specialty: "Cardiología", date: "2026-05-28", start: "16:00", end: "20:00", hours: 4, rateLabel: "Especialista premium · €€€€", fee: 520, status: "pendiente", shift: "Tarde", contact: "Roberto Lima", message: "Revisión urgente, paciente derivado de UCI." },
  { id: "p-003", clinic: "Centro Médico Bilbao", city: "Bilbao", specialty: "Cardiología", date: "2026-05-30", start: "16:00", end: "20:00", hours: 4, rateLabel: "Especialista senior · €€€", fee: 360, status: "pendiente", shift: "Tarde", contact: "Iker Arana" },
  { id: "p-004", clinic: "Clínica Mediterránea", city: "Valencia", specialty: "Cardiología", date: "2026-06-02", start: "09:00", end: "13:00", hours: 4, rateLabel: "Profesional consolidado · €€", fee: 220, status: "confirmada", shift: "Mañana", contact: "Lucía Bravo" },
  { id: "p-005", clinic: "Hospital Quirón Salud", city: "Madrid", specialty: "Cardiología · Quirófano", date: "2026-06-15", start: "08:00", end: "20:00", hours: 12, rateLabel: "Especialista premium · €€€€", fee: 1560, status: "confirmada", shift: "Día completo", contact: "Andrea Iglesias", notes: "Jornada en bloque quirúrgico" },
  { id: "p-006", clinic: "Clínica Sanitas Norte", city: "Madrid", specialty: "Cardiología", date: "2026-05-12", start: "08:00", end: "14:00", hours: 6, rateLabel: "Especialista senior · €€€", fee: 510, status: "completada", shift: "Mañana", contact: "Marta Vives" },
  { id: "p-007", clinic: "Centro Médico Bilbao", city: "Bilbao", specialty: "Cardiología", date: "2026-04-13", start: "16:00", end: "20:00", hours: 4, rateLabel: "Especialista senior · €€€", fee: 360, status: "completada", shift: "Tarde", contact: "Iker Arana" },
  { id: "p-008", clinic: "Centro Vital Sevilla", city: "Sevilla", specialty: "Cardiología", date: "2026-04-08", start: "09:00", end: "13:00", hours: 4, rateLabel: "Profesional consolidado · €€", fee: 220, status: "cancelada", shift: "Mañana", contact: "Pedro Galán", notes: "Cancelada por la clínica con 48 h de aviso" },
];

export const CLINICA_RESERVAS: ReservaClinica[] = [
  { id: "c-001", professional: "Dra. Lucía Martín", role: "Cardiología", city: "Madrid", level: "Elite", date: "2026-05-28", start: "08:00", end: "14:00", hours: 6, rateLabel: "Especialista senior · €€€", fee: 510, status: "confirmada", shift: "Mañana", rating: 4.9 },
  { id: "c-002", professional: "Andrés Cano", role: "Fisioterapia", city: "Madrid", level: "Top Rated", date: "2026-05-29", start: "16:00", end: "20:00", hours: 4, rateLabel: "Profesional consolidado · €€", fee: 220, status: "pendiente", shift: "Tarde", rating: 4.8, message: "Confirma disponibilidad para esta tarde" },
  { id: "c-003", professional: "Inés Vera", role: "Pediatría", city: "Madrid", level: "Trusted", date: "2026-05-30", start: "09:00", end: "13:00", hours: 4, rateLabel: "Profesional consolidado · €€", fee: 220, status: "pendiente", shift: "Mañana", rating: 4.7 },
  { id: "c-004", professional: "Dr. Jorge Pol", role: "Anestesia", city: "Madrid", level: "Elite", date: "2026-06-02", start: "08:00", end: "14:00", hours: 6, rateLabel: "Especialista premium · €€€€", fee: 780, status: "confirmada", shift: "Mañana", rating: 5.0 },
  { id: "c-005", professional: "Marta Lozano", role: "Enfermería", city: "Madrid", level: "Top Rated", date: "2026-06-04", start: "08:00", end: "20:00", hours: 12, rateLabel: "Profesional verificado · €", fee: 420, status: "pendiente", shift: "Día completo", rating: 4.8 },
  { id: "c-006", professional: "Patricia Ferrer", role: "Psicología", city: "Madrid", level: "Trusted", date: "2026-06-09", start: "16:00", end: "20:00", hours: 4, rateLabel: "Profesional consolidado · €€", fee: 220, status: "pendiente", shift: "Tarde", rating: 4.6 },
  { id: "c-007", professional: "Dra. Lucía Martín", role: "Cardiología", city: "Madrid", level: "Elite", date: "2026-05-04", start: "08:00", end: "14:00", hours: 6, rateLabel: "Especialista senior · €€€", fee: 510, status: "completada", shift: "Mañana", rating: 4.9 },
  { id: "c-008", professional: "Carlos Sánchez", role: "Fisioterapia", city: "Madrid", level: "Top Rated", date: "2026-05-06", start: "16:00", end: "20:00", hours: 4, rateLabel: "Profesional consolidado · €€", fee: 220, status: "completada", shift: "Tarde", rating: 4.8 },
  { id: "c-009", professional: "Marta Lozano", role: "Enfermería", city: "Madrid", level: "Top Rated", date: "2026-05-20", start: "09:00", end: "13:00", hours: 4, rateLabel: "Profesional verificado · €", fee: 140, status: "confirmada", shift: "Mañana", rating: 4.8 },
  { id: "c-010", professional: "Diego Alarcón", role: "Fisioterapia", city: "Madrid", level: "Top Rated", date: "2026-04-22", start: "09:00", end: "13:00", hours: 4, rateLabel: "Profesional consolidado · €€", fee: 220, status: "cancelada", shift: "Mañana", rating: 4.9, notes: "Cancelada · profesional indispuesto" },
];
