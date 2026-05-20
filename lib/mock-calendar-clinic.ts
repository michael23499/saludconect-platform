import type { CalendarData } from "@/components/dashboard/InteractiveCalendar";

export const CLINIC_CALENDAR: CalendarData = {
  "2026-05-04": { shift: "morning", appointments: [
    { id: "c1", shift: "Mañana", start: "08:00", end: "14:00", clinic: "Dra. Lucía Martín", city: "Madrid", specialty: "Cardiología", rateLabel: "Especialista senior · €€€", status: "completada", contact: "Lucía Martín" },
  ]},
  "2026-05-06": { shift: "afternoon", appointments: [
    { id: "c2", shift: "Tarde", start: "16:00", end: "20:00", clinic: "Carlos Sánchez", city: "Madrid", specialty: "Fisioterapia", rateLabel: "Profesional consolidado · €€", status: "completada", contact: "Carlos Sánchez" },
  ]},
  "2026-05-11": { shift: "morning" },
  "2026-05-13": { shift: "morning" },
  "2026-05-14": { shift: "afternoon" },
  "2026-05-18": { shift: "both" },
  "2026-05-20": { shift: "morning", appointments: [
    { id: "c3", shift: "Mañana", start: "09:00", end: "13:00", clinic: "Marta Lozano", city: "Madrid", specialty: "Enfermería · Urgencias", rateLabel: "Profesional verificado · €", status: "confirmada", contact: "Marta Lozano" },
  ]},
  "2026-05-21": { shift: "afternoon" },
  "2026-05-25": { shift: "morning" },
  "2026-05-27": { shift: "both" },
  "2026-05-28": {
    shift: "both",
    appointments: [
      { id: "c4", shift: "Mañana", start: "08:00", end: "14:00", clinic: "Dra. Lucía Martín", city: "Madrid", specialty: "Cardiología", rateLabel: "Especialista senior · €€€", status: "confirmada", contact: "Lucía Martín" },
      { id: "c5", shift: "Tarde", start: "16:00", end: "20:00", clinic: "Andrés Cano (suplente)", city: "Madrid", specialty: "Fisioterapia", rateLabel: "Profesional consolidado · €€", status: "pendiente", contact: "Andrés Cano" },
    ],
  },
  "2026-05-29": { shift: "morning", appointments: [
    { id: "c6", shift: "Mañana", start: "09:00", end: "13:00", clinic: "Inés Vera", city: "Madrid", specialty: "Pediatría · Neonatología", rateLabel: "Profesional consolidado · €€", status: "pendiente", contact: "Inés Vera" },
  ]},
  "2026-06-02": {
    shift: "morning",
    appointments: [
      { id: "c7", shift: "Mañana", start: "08:00", end: "14:00", clinic: "Dr. Jorge Pol", city: "Madrid", specialty: "Anestesia · Quirófano", rateLabel: "Especialista premium · €€€€", status: "confirmada", contact: "Jorge Pol" },
    ],
  },
  "2026-06-09": { shift: "afternoon" },
  "2026-06-16": { shift: "both" },
  "2026-06-23": { shift: "morning" },
};
