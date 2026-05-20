import type { CalendarData } from "@/components/dashboard/InteractiveCalendar";

export const PRO_CALENDAR: CalendarData = {
  // May 2026 — current month
  "2026-05-04": { shift: "morning" },
  "2026-05-05": { shift: "both" },
  "2026-05-06": { shift: "morning" },
  "2026-05-07": { shift: "afternoon" },
  "2026-05-08": { shift: "free" },
  "2026-05-11": { shift: "morning" },
  "2026-05-12": {
    shift: "morning",
    appointments: [
      { id: "a1", shift: "Mañana", start: "08:00", end: "14:00", clinic: "Clínica Sanitas Norte", city: "Madrid", specialty: "Cardiología", rateLabel: "Especialista senior · €€€", status: "completada", contact: "Marta Vives" },
    ],
  },
  "2026-05-13": { shift: "afternoon" },
  "2026-05-14": { shift: "both" },
  "2026-05-15": { shift: "morning" },
  "2026-05-18": { shift: "both" },
  "2026-05-19": { shift: "morning" },
  "2026-05-20": {
    shift: "morning",
    appointments: [
      { id: "a2", shift: "Mañana", start: "09:00", end: "13:00", clinic: "Centro Médico Bilbao", city: "Bilbao", specialty: "Cardiología", rateLabel: "Especialista senior · €€€", status: "confirmada", contact: "Iker Arana" },
    ],
  },
  "2026-05-21": {
    shift: "afternoon",
    appointments: [
      { id: "a3", shift: "Tarde", start: "16:00", end: "20:00", clinic: "Clínica Mediterránea", city: "Valencia", specialty: "Cardiología", rateLabel: "Profesional consolidado · €€", status: "confirmada", contact: "Lucía Bravo" },
    ],
  },
  "2026-05-22": { shift: "free" },
  "2026-05-25": { shift: "morning" },
  "2026-05-26": { shift: "afternoon" },
  "2026-05-27": { shift: "morning" },
  "2026-05-28": {
    shift: "both",
    appointments: [
      { id: "a4", shift: "Mañana", start: "08:00", end: "14:00", clinic: "Clínica Sanitas Norte", city: "Madrid", specialty: "Cardiología", rateLabel: "Especialista senior · €€€", status: "confirmada", contact: "Marta Vives" },
      { id: "a5", shift: "Tarde", start: "16:00", end: "20:00", clinic: "Hospital HM Madrid", city: "Madrid", specialty: "Cardiología", rateLabel: "Especialista premium · €€€€", status: "pendiente", contact: "Roberto Lima" },
    ],
  },
  "2026-05-29": { shift: "morning" },
  "2026-05-30": { shift: "blocked" },
  "2026-05-31": { shift: "blocked" },

  // June 2026 — next month
  "2026-06-01": { shift: "morning" },
  "2026-06-02": {
    shift: "morning",
    appointments: [
      { id: "b1", shift: "Mañana", start: "09:00", end: "13:00", clinic: "Clínica Mediterránea", city: "Valencia", specialty: "Cardiología", rateLabel: "Profesional consolidado · €€", status: "confirmada", contact: "Lucía Bravo" },
    ],
  },
  "2026-06-03": { shift: "both" },
  "2026-06-04": { shift: "afternoon" },
  "2026-06-05": { shift: "morning" },
  "2026-06-08": { shift: "morning" },
  "2026-06-09": { shift: "afternoon" },
  "2026-06-10": { shift: "blocked" },
  "2026-06-11": { shift: "both" },
  "2026-06-12": { shift: "morning" },
  "2026-06-15": {
    shift: "both",
    appointments: [
      { id: "b2", shift: "Día completo", start: "08:00", end: "20:00", clinic: "Hospital Quirón Salud", city: "Madrid", specialty: "Cardiología · Quirófano", rateLabel: "Especialista premium · €€€€", status: "confirmada", contact: "Andrea Iglesias" },
    ],
  },
  "2026-06-16": { shift: "morning" },
  "2026-06-17": { shift: "afternoon" },
  "2026-06-18": { shift: "free" },
  "2026-06-19": { shift: "free" },
  "2026-06-22": { shift: "morning" },
  "2026-06-23": { shift: "afternoon" },
  "2026-06-24": { shift: "blocked" },
  "2026-06-25": { shift: "blocked" },
  "2026-06-26": { shift: "blocked" },
  "2026-06-29": { shift: "morning" },
  "2026-06-30": { shift: "afternoon" },

  // April 2026 — past month (some completed)
  "2026-04-06": { shift: "morning", appointments: [
    { id: "p1", shift: "Mañana", start: "08:00", end: "14:00", clinic: "Clínica Sanitas Norte", city: "Madrid", specialty: "Cardiología", rateLabel: "Especialista senior · €€€", status: "completada", contact: "Marta Vives" },
  ]},
  "2026-04-13": { shift: "afternoon", appointments: [
    { id: "p2", shift: "Tarde", start: "16:00", end: "20:00", clinic: "Centro Médico Bilbao", city: "Bilbao", specialty: "Cardiología", rateLabel: "Especialista senior · €€€", status: "completada", contact: "Iker Arana" },
  ]},
  "2026-04-20": { shift: "morning" },
  "2026-04-27": { shift: "both" },
};
