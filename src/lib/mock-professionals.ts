import type { Reputation } from "./reputation";
import { levelFromScore } from "./reputation";

export type Professional = {
  id: string;
  name: string;
  profession: string;
  specialty: string;
  city: string;
  experience: number;
  shift: "Mañana" | "Tarde" | "Ambos";
  rateRange: string;     // "€€€" format
  rateLabel: string;     // "Tarifa media-alta" or "Negociable"
  available: boolean;
  verified: boolean;
  tags: string[];
  rep: Reputation;
};

function rep(score: number, partial: Omit<Reputation, "score" | "level">): Reputation {
  return { score, level: levelFromScore(score), ...partial };
}

export const PROFESSIONALS: Professional[] = [
  // ============ CARDIOLOGÍA ============
  {
    id: "p1", name: "Dra. Lucía Martín", profession: "Médico/a", specialty: "Cardiología",
    city: "Madrid", experience: 12, shift: "Ambos", rateRange: "€€€", rateLabel: "Especialista senior",
    available: true, verified: true, tags: ["Ecocardiografía", "Holter", "Estrés"],
    rep: rep(942, { rating: 4.9, reviews: 132, completed: 287, punctuality: 99, responseRate: 98, responseTime: "8 min", successRate: 99, yearsExperience: 12, badges: ["verified", "fast_responder", "five_star", "in_demand", "veteran"] }),
  },
  {
    id: "p2", name: "Dr. Roberto Vela", profession: "Médico/a", specialty: "Cardiología",
    city: "Madrid", experience: 7, shift: "Mañana", rateRange: "€€", rateLabel: "Profesional consolidado",
    available: true, verified: true, tags: ["Hemodinámica", "Arritmias"],
    rep: rep(612, { rating: 4.7, reviews: 52, completed: 96, punctuality: 96, responseRate: 92, responseTime: "16 min", successRate: 97, yearsExperience: 7, badges: ["verified", "recommended"] }),
  },
  {
    id: "p3", name: "Dra. Isabel Quintana", profession: "Médico/a", specialty: "Cardiología",
    city: "Valencia", experience: 16, shift: "Mañana", rateRange: "€€€€", rateLabel: "Especialista premium",
    available: true, verified: true, tags: ["Cardiología intervencionista", "Marcapasos"],
    rep: rep(890, { rating: 4.9, reviews: 118, completed: 224, punctuality: 99, responseRate: 96, responseTime: "10 min", successRate: 99, yearsExperience: 16, badges: ["verified", "five_star", "veteran", "in_demand"] }),
  },
  {
    id: "p4", name: "Dr. Mario Ros", profession: "Médico/a", specialty: "Cardiología",
    city: "Sevilla", experience: 9, shift: "Tarde", rateRange: "€€€", rateLabel: "Especialista senior",
    available: false, verified: true, tags: ["Insuficiencia cardíaca"],
    rep: rep(704, { rating: 4.8, reviews: 67, completed: 142, punctuality: 97, responseRate: 93, responseTime: "14 min", successRate: 98, yearsExperience: 9, badges: ["verified", "recommended", "five_star"] }),
  },

  // ============ PEDIATRÍA ============
  {
    id: "p5", name: "Dr. Andrés Cano", profession: "Médico/a", specialty: "Pediatría",
    city: "Barcelona", experience: 15, shift: "Mañana", rateRange: "€€€", rateLabel: "Especialista senior",
    available: false, verified: true, tags: ["Neumología infantil", "Vacunación"],
    rep: rep(875, { rating: 5.0, reviews: 64, completed: 112, punctuality: 98, responseRate: 90, responseTime: "22 min", successRate: 100, yearsExperience: 15, badges: ["verified", "five_star", "veteran", "in_demand"] }),
  },
  {
    id: "p6", name: "Dra. Inés Vera", profession: "Médico/a", specialty: "Pediatría",
    city: "Madrid", experience: 9, shift: "Ambos", rateRange: "€€", rateLabel: "Profesional consolidado",
    available: true, verified: true, tags: ["Neonatología", "Lactancia"],
    rep: rep(612, { rating: 4.8, reviews: 49, completed: 88, punctuality: 96, responseRate: 92, responseTime: "18 min", successRate: 97, yearsExperience: 9, badges: ["verified", "recommended"] }),
  },
  {
    id: "p7", name: "Dra. Elena Pardo", profession: "Médico/a", specialty: "Pediatría",
    city: "Valencia", experience: 6, shift: "Tarde", rateRange: "€€", rateLabel: "Profesional consolidado",
    available: true, verified: true, tags: ["Atención primaria infantil"],
    rep: rep(488, { rating: 4.7, reviews: 32, completed: 64, punctuality: 95, responseRate: 91, responseTime: "20 min", successRate: 96, yearsExperience: 6, badges: ["verified", "recommended"] }),
  },
  {
    id: "p8", name: "Dr. Tomás Ríos", profession: "Médico/a", specialty: "Pediatría",
    city: "Bilbao", experience: 11, shift: "Mañana", rateRange: "€€€", rateLabel: "Especialista senior",
    available: true, verified: true, tags: ["Endocrinología pediátrica"],
    rep: rep(764, { rating: 4.9, reviews: 78, completed: 144, punctuality: 98, responseRate: 94, responseTime: "12 min", successRate: 99, yearsExperience: 11, badges: ["verified", "five_star", "punctual"] }),
  },

  // ============ ODONTOLOGÍA ============
  {
    id: "p9", name: "Dra. Sofía Morales", profession: "Odontólogo/a", specialty: "Odontología",
    city: "Valencia", experience: 10, shift: "Mañana", rateRange: "€€€", rateLabel: "Especialista senior",
    available: true, verified: true, tags: ["Endodoncia", "Estética"],
    rep: rep(704, { rating: 4.9, reviews: 74, completed: 132, punctuality: 97, responseRate: 94, responseTime: "16 min", successRate: 98, yearsExperience: 10, badges: ["verified", "five_star", "recommended"] }),
  },
  {
    id: "p10", name: "Dr. Mateo Aguilar", profession: "Odontólogo/a", specialty: "Odontología",
    city: "Madrid", experience: 8, shift: "Ambos", rateRange: "€€", rateLabel: "Profesional consolidado",
    available: true, verified: true, tags: ["Implantología", "Ortodoncia"],
    rep: rep(642, { rating: 4.8, reviews: 58, completed: 112, punctuality: 96, responseRate: 93, responseTime: "18 min", successRate: 97, yearsExperience: 8, badges: ["verified", "recommended"] }),
  },
  {
    id: "p11", name: "Dra. Clara Méndez", profession: "Odontólogo/a", specialty: "Odontología",
    city: "Barcelona", experience: 13, shift: "Mañana", rateRange: "€€€€", rateLabel: "Especialista premium",
    available: false, verified: true, tags: ["Cirugía oral", "Periodoncia"],
    rep: rep(842, { rating: 4.9, reviews: 102, completed: 188, punctuality: 99, responseRate: 95, responseTime: "11 min", successRate: 99, yearsExperience: 13, badges: ["verified", "five_star", "veteran", "in_demand"] }),
  },
  {
    id: "p12", name: "Dr. Pau Reyes", profession: "Odontólogo/a", specialty: "Odontología",
    city: "Málaga", experience: 5, shift: "Tarde", rateRange: "€", rateLabel: "Profesional verificado",
    available: true, verified: true, tags: ["Odontopediatría"],
    rep: rep(384, { rating: 4.6, reviews: 26, completed: 48, punctuality: 95, responseRate: 90, responseTime: "24 min", successRate: 95, yearsExperience: 5, badges: ["verified", "rising_star"] }),
  },

  // ============ FISIOTERAPIA ============
  {
    id: "p13", name: "Carlos Sánchez", profession: "Fisioterapeuta", specialty: "Fisioterapia",
    city: "Madrid", experience: 8, shift: "Tarde", rateRange: "€€", rateLabel: "Profesional consolidado",
    available: true, verified: true, tags: ["Deportiva", "Manual", "Punción seca"],
    rep: rep(742, { rating: 4.8, reviews: 81, completed: 164, punctuality: 96, responseRate: 95, responseTime: "14 min", successRate: 98, yearsExperience: 8, badges: ["verified", "punctual", "recommended"] }),
  },
  {
    id: "p14", name: "Diego Alarcón", profession: "Fisioterapeuta", specialty: "Fisioterapia",
    city: "Madrid", experience: 12, shift: "Ambos", rateRange: "€€", rateLabel: "Profesional consolidado",
    available: true, verified: true, tags: ["Lumbalgia", "Postoperatorio"],
    rep: rep(818, { rating: 4.9, reviews: 138, completed: 218, punctuality: 98, responseRate: 96, responseTime: "10 min", successRate: 99, yearsExperience: 12, badges: ["verified", "fast_responder", "five_star", "veteran"] }),
  },
  {
    id: "p15", name: "Sara Linares", profession: "Fisioterapeuta", specialty: "Fisioterapia",
    city: "Barcelona", experience: 6, shift: "Mañana", rateRange: "€€", rateLabel: "Profesional consolidado",
    available: true, verified: true, tags: ["Neurológica", "Suelo pélvico"],
    rep: rep(548, { rating: 4.7, reviews: 41, completed: 78, punctuality: 95, responseRate: 92, responseTime: "16 min", successRate: 96, yearsExperience: 6, badges: ["verified", "recommended"] }),
  },
  {
    id: "p16", name: "Dani Mora", profession: "Fisioterapeuta", specialty: "Fisioterapia",
    city: "Valencia", experience: 4, shift: "Tarde", rateRange: "€", rateLabel: "Profesional en ascenso",
    available: true, verified: false, tags: ["Deportiva", "Vendaje funcional"],
    rep: rep(282, { rating: 4.5, reviews: 18, completed: 32, punctuality: 93, responseRate: 88, responseTime: "26 min", successRate: 94, yearsExperience: 4, badges: ["rising_star"] }),
  },
  {
    id: "p17", name: "Tania Lago", profession: "Fisioterapeuta", specialty: "Fisioterapia",
    city: "Sevilla", experience: 9, shift: "Ambos", rateRange: "€€€", rateLabel: "Especialista senior",
    available: true, verified: true, tags: ["Geriátrica", "Respiratoria"],
    rep: rep(672, { rating: 4.8, reviews: 64, completed: 122, punctuality: 97, responseRate: 94, responseTime: "12 min", successRate: 98, yearsExperience: 9, badges: ["verified", "recommended", "punctual"] }),
  },

  // ============ PSICOLOGÍA ============
  {
    id: "p18", name: "Patricia Ferrer", profession: "Psicólogo/a", specialty: "Psicología",
    city: "Móstoles", experience: 6, shift: "Tarde", rateRange: "€€", rateLabel: "Profesional consolidado",
    available: false, verified: true, tags: ["Adultos", "Terapia cognitivo-conductual"],
    rep: rep(548, { rating: 4.7, reviews: 41, completed: 72, punctuality: 95, responseRate: 90, responseTime: "30 min", successRate: 96, yearsExperience: 6, badges: ["verified", "recommended"] }),
  },
  {
    id: "p19", name: "Dr. Javier Núñez", profession: "Psicólogo/a", specialty: "Psicología",
    city: "Madrid", experience: 14, shift: "Ambos", rateRange: "€€€", rateLabel: "Especialista senior",
    available: true, verified: true, tags: ["Sanitaria", "Trauma", "EMDR"],
    rep: rep(848, { rating: 4.9, reviews: 96, completed: 178, punctuality: 98, responseRate: 95, responseTime: "14 min", successRate: 99, yearsExperience: 14, badges: ["verified", "five_star", "veteran", "in_demand"] }),
  },
  {
    id: "p20", name: "Dra. Núria Llopis", profession: "Psicólogo/a", specialty: "Psicología",
    city: "Barcelona", experience: 11, shift: "Mañana", rateRange: "€€€", rateLabel: "Especialista senior",
    available: true, verified: true, tags: ["Infanto-juvenil", "TDAH"],
    rep: rep(712, { rating: 4.8, reviews: 72, completed: 134, punctuality: 97, responseRate: 93, responseTime: "18 min", successRate: 98, yearsExperience: 11, badges: ["verified", "five_star", "recommended"] }),
  },
  {
    id: "p21", name: "Helena Cortés", profession: "Psicólogo/a", specialty: "Psicología",
    city: "Granada", experience: 4, shift: "Tarde", rateRange: "€", rateLabel: "Profesional en ascenso",
    available: true, verified: true, tags: ["Online", "Pareja"],
    rep: rep(322, { rating: 4.6, reviews: 24, completed: 38, punctuality: 94, responseRate: 89, responseTime: "28 min", successRate: 95, yearsExperience: 4, badges: ["verified", "rising_star"] }),
  },

  // ============ DERMATOLOGÍA ============
  {
    id: "p22", name: "Dr. Pablo Iturbe", profession: "Dermatólogo/a", specialty: "Dermatología",
    city: "Bilbao", experience: 14, shift: "Tarde", rateRange: "€€€", rateLabel: "Especialista senior",
    available: true, verified: true, tags: ["Estética", "Oncológica"],
    rep: rep(832, { rating: 4.8, reviews: 89, completed: 154, punctuality: 96, responseRate: 91, responseTime: "20 min", successRate: 98, yearsExperience: 14, badges: ["verified", "five_star", "veteran", "in_demand"] }),
  },
  {
    id: "p23", name: "Dra. Marina Espí", profession: "Dermatólogo/a", specialty: "Dermatología",
    city: "Valencia", experience: 9, shift: "Mañana", rateRange: "€€€€", rateLabel: "Especialista premium",
    available: true, verified: true, tags: ["Medicina estética", "Láser"],
    rep: rep(704, { rating: 4.9, reviews: 68, completed: 124, punctuality: 97, responseRate: 95, responseTime: "12 min", successRate: 98, yearsExperience: 9, badges: ["verified", "five_star", "fast_responder"] }),
  },
  {
    id: "p24", name: "Dr. Iván Ros", profession: "Dermatólogo/a", specialty: "Dermatología",
    city: "Madrid", experience: 6, shift: "Ambos", rateRange: "€€", rateLabel: "Profesional consolidado",
    available: false, verified: true, tags: ["Pediátrica", "Acné"],
    rep: rep(498, { rating: 4.7, reviews: 38, completed: 72, punctuality: 95, responseRate: 92, responseTime: "18 min", successRate: 96, yearsExperience: 6, badges: ["verified", "recommended"] }),
  },

  // ============ ENFERMERÍA GENERAL ============
  {
    id: "p25", name: "Marta Lozano", profession: "Enfermero/a", specialty: "Enfermería general",
    city: "Madrid", experience: 6, shift: "Mañana", rateRange: "€", rateLabel: "Profesional verificado",
    available: true, verified: true, tags: ["Urgencias", "UCI", "Pediátrica"],
    rep: rep(688, { rating: 4.9, reviews: 98, completed: 142, punctuality: 99, responseRate: 100, responseTime: "5 min", successRate: 99, yearsExperience: 6, badges: ["verified", "fast_responder", "punctual", "five_star"] }),
  },
  {
    id: "p26", name: "Laura Gómez", profession: "Enfermero/a", specialty: "Enfermería general",
    city: "Sevilla", experience: 4, shift: "Ambos", rateRange: "€", rateLabel: "Profesional en ascenso",
    available: true, verified: false, tags: ["Urgencias"],
    rep: rep(312, { rating: 4.6, reviews: 18, completed: 28, punctuality: 94, responseRate: 88, responseTime: "25 min", successRate: 95, yearsExperience: 4, badges: ["rising_star"] }),
  },
  {
    id: "p27", name: "Pedro Calle", profession: "Enfermero/a", specialty: "Enfermería general",
    city: "Barcelona", experience: 10, shift: "Tarde", rateRange: "€€", rateLabel: "Profesional consolidado",
    available: true, verified: true, tags: ["Quirófano", "Anestesia"],
    rep: rep(742, { rating: 4.8, reviews: 84, completed: 168, punctuality: 98, responseRate: 96, responseTime: "10 min", successRate: 98, yearsExperience: 10, badges: ["verified", "punctual", "five_star", "veteran"] }),
  },
  {
    id: "p28", name: "Aurora Bravo", profession: "Enfermero/a", specialty: "Enfermería general",
    city: "Zaragoza", experience: 7, shift: "Mañana", rateRange: "€", rateLabel: "Profesional verificado",
    available: true, verified: true, tags: ["Hospitalaria", "Curas"],
    rep: rep(582, { rating: 4.7, reviews: 52, completed: 96, punctuality: 97, responseRate: 95, responseTime: "12 min", successRate: 97, yearsExperience: 7, badges: ["verified", "recommended", "punctual"] }),
  },
  {
    id: "p29", name: "Beltrán Núñez", profession: "Enfermero/a", specialty: "Enfermería general",
    city: "Bilbao", experience: 12, shift: "Ambos", rateRange: "€€", rateLabel: "Profesional consolidado",
    available: false, verified: true, tags: ["Geriatría", "Domiciliaria"],
    rep: rep(796, { rating: 4.9, reviews: 102, completed: 188, punctuality: 98, responseRate: 95, responseTime: "12 min", successRate: 99, yearsExperience: 12, badges: ["verified", "five_star", "veteran", "punctual"] }),
  },

  // ============ GINECOLOGÍA ============
  {
    id: "p30", name: "Dra. Cristina Vidal", profession: "Ginecólogo/a", specialty: "Ginecología",
    city: "Zaragoza", experience: 11, shift: "Mañana", rateRange: "€€€", rateLabel: "Especialista senior",
    available: true, verified: true, tags: ["Obstetricia", "Ecografía"],
    rep: rep(796, { rating: 4.9, reviews: 102, completed: 178, punctuality: 98, responseRate: 95, responseTime: "12 min", successRate: 99, yearsExperience: 11, badges: ["verified", "five_star", "punctual", "recommended"] }),
  },
  {
    id: "p31", name: "Dra. Almudena Sanz", profession: "Ginecólogo/a", specialty: "Ginecología",
    city: "Madrid", experience: 17, shift: "Ambos", rateRange: "€€€€", rateLabel: "Especialista premium",
    available: true, verified: true, tags: ["Fertilidad", "Endometriosis"],
    rep: rep(912, { rating: 4.9, reviews: 144, completed: 256, punctuality: 99, responseRate: 96, responseTime: "10 min", successRate: 99, yearsExperience: 17, badges: ["verified", "five_star", "veteran", "in_demand"] }),
  },
  {
    id: "p32", name: "Dra. Elsa Tudela", profession: "Ginecólogo/a", specialty: "Ginecología",
    city: "Barcelona", experience: 8, shift: "Tarde", rateRange: "€€€", rateLabel: "Especialista senior",
    available: false, verified: true, tags: ["Climaterio", "Anticoncepción"],
    rep: rep(622, { rating: 4.8, reviews: 56, completed: 102, punctuality: 96, responseRate: 92, responseTime: "16 min", successRate: 97, yearsExperience: 8, badges: ["verified", "recommended", "five_star"] }),
  },

  // ============ TRAUMATOLOGÍA ============
  {
    id: "p33", name: "Dr. Borja Castellanos", profession: "Médico/a", specialty: "Traumatología",
    city: "Madrid", experience: 13, shift: "Mañana", rateRange: "€€€€", rateLabel: "Especialista premium",
    available: true, verified: true, tags: ["Rodilla", "Hombro", "Artroscopia"],
    rep: rep(872, { rating: 4.9, reviews: 112, completed: 198, punctuality: 98, responseRate: 94, responseTime: "12 min", successRate: 99, yearsExperience: 13, badges: ["verified", "five_star", "veteran", "in_demand"] }),
  },
  {
    id: "p34", name: "Dra. Yolanda Pérez", profession: "Médico/a", specialty: "Traumatología",
    city: "Granada", experience: 9, shift: "Tarde", rateRange: "€€€", rateLabel: "Especialista senior",
    available: true, verified: true, tags: ["Columna", "Mano"],
    rep: rep(652, { rating: 4.8, reviews: 64, completed: 118, punctuality: 96, responseRate: 92, responseTime: "18 min", successRate: 98, yearsExperience: 9, badges: ["verified", "recommended", "five_star"] }),
  },
  {
    id: "p35", name: "Dr. Hugo Sanz", profession: "Médico/a", specialty: "Traumatología",
    city: "Sevilla", experience: 6, shift: "Ambos", rateRange: "€€", rateLabel: "Profesional consolidado",
    available: true, verified: true, tags: ["Deportiva", "Tobillo y pie"],
    rep: rep(482, { rating: 4.7, reviews: 34, completed: 64, punctuality: 95, responseRate: 91, responseTime: "20 min", successRate: 96, yearsExperience: 6, badges: ["verified", "recommended"] }),
  },

  // ============ OFTALMOLOGÍA ============
  {
    id: "p36", name: "Dra. Beatriz Soler", profession: "Médico/a", specialty: "Oftalmología",
    city: "Sevilla", experience: 11, shift: "Mañana", rateRange: "€€€", rateLabel: "Especialista senior",
    available: true, verified: true, tags: ["Cirugía refractiva", "Cataratas"],
    rep: rep(728, { rating: 4.8, reviews: 78, completed: 142, punctuality: 97, responseRate: 94, responseTime: "14 min", successRate: 98, yearsExperience: 11, badges: ["verified", "five_star", "punctual", "recommended"] }),
  },
  {
    id: "p37", name: "Dr. Daniel Riera", profession: "Médico/a", specialty: "Oftalmología",
    city: "Barcelona", experience: 18, shift: "Tarde", rateRange: "€€€€", rateLabel: "Especialista premium",
    available: false, verified: true, tags: ["Retina", "Glaucoma"],
    rep: rep(932, { rating: 5.0, reviews: 156, completed: 274, punctuality: 99, responseRate: 96, responseTime: "10 min", successRate: 100, yearsExperience: 18, badges: ["verified", "five_star", "veteran", "in_demand"] }),
  },
  {
    id: "p38", name: "Dr. Óscar Beltrán", profession: "Médico/a", specialty: "Oftalmología",
    city: "Málaga", experience: 7, shift: "Ambos", rateRange: "€€", rateLabel: "Profesional consolidado",
    available: true, verified: true, tags: ["General", "Pediátrica"],
    rep: rep(528, { rating: 4.7, reviews: 42, completed: 78, punctuality: 96, responseRate: 92, responseTime: "16 min", successRate: 97, yearsExperience: 7, badges: ["verified", "recommended"] }),
  },

  // ============ RADIOLOGÍA ============
  {
    id: "p39", name: "Dra. Ana Mercader", profession: "Médico/a", specialty: "Radiología",
    city: "Valencia", experience: 14, shift: "Mañana", rateRange: "€€€", rateLabel: "Especialista senior",
    available: true, verified: true, tags: ["RMN", "TAC", "Ecografía"],
    rep: rep(818, { rating: 4.9, reviews: 92, completed: 168, punctuality: 98, responseRate: 95, responseTime: "12 min", successRate: 99, yearsExperience: 14, badges: ["verified", "five_star", "veteran"] }),
  },
  {
    id: "p40", name: "Dr. Felipe Asís", profession: "Médico/a", specialty: "Radiología",
    city: "Madrid", experience: 9, shift: "Tarde", rateRange: "€€€", rateLabel: "Especialista senior",
    available: true, verified: true, tags: ["Intervencionista", "Mama"],
    rep: rep(672, { rating: 4.8, reviews: 56, completed: 102, punctuality: 96, responseRate: 93, responseTime: "16 min", successRate: 98, yearsExperience: 9, badges: ["verified", "recommended", "five_star"] }),
  },
  {
    id: "p41", name: "Dra. Pilar Linares", profession: "Médico/a", specialty: "Radiología",
    city: "Bilbao", experience: 6, shift: "Ambos", rateRange: "€€", rateLabel: "Profesional consolidado",
    available: false, verified: true, tags: ["Musculoesquelética"],
    rep: rep(478, { rating: 4.7, reviews: 34, completed: 64, punctuality: 95, responseRate: 91, responseTime: "18 min", successRate: 96, yearsExperience: 6, badges: ["verified", "recommended"] }),
  },

  // ============ ANESTESIA ============
  {
    id: "p42", name: "Dr. Jorge Pol", profession: "Médico/a", specialty: "Anestesia",
    city: "Madrid", experience: 18, shift: "Mañana", rateRange: "€€€€", rateLabel: "Especialista premium",
    available: true, verified: true, tags: ["Reanimación", "Quirófano"],
    rep: rep(965, { rating: 4.9, reviews: 167, completed: 312, punctuality: 100, responseRate: 95, responseTime: "12 min", successRate: 100, yearsExperience: 18, badges: ["verified", "punctual", "five_star", "veteran", "in_demand"] }),
  },
  {
    id: "p43", name: "Dra. Adela Fonseca", profession: "Médico/a", specialty: "Anestesia",
    city: "Barcelona", experience: 12, shift: "Ambos", rateRange: "€€€€", rateLabel: "Especialista premium",
    available: true, verified: true, tags: ["Pediátrica", "Locorregional"],
    rep: rep(802, { rating: 4.9, reviews: 88, completed: 162, punctuality: 99, responseRate: 94, responseTime: "14 min", successRate: 99, yearsExperience: 12, badges: ["verified", "five_star", "veteran", "punctual"] }),
  },
  {
    id: "p44", name: "Dr. Bruno Vargas", profession: "Médico/a", specialty: "Anestesia",
    city: "Valencia", experience: 8, shift: "Mañana", rateRange: "€€€", rateLabel: "Especialista senior",
    available: false, verified: true, tags: ["Cirugía mayor ambulatoria"],
    rep: rep(612, { rating: 4.8, reviews: 48, completed: 88, punctuality: 97, responseRate: 92, responseTime: "16 min", successRate: 98, yearsExperience: 8, badges: ["verified", "recommended", "five_star"] }),
  },

  // ============ AUXILIAR DE ENFERMERÍA ============
  {
    id: "p45", name: "Lía Pons", profession: "Auxiliar de enfermería", specialty: "Enfermería general",
    city: "Madrid", experience: 5, shift: "Mañana", rateRange: "€", rateLabel: "Profesional verificado",
    available: true, verified: true, tags: ["Geriátrica", "Pediátrica"],
    rep: rep(388, { rating: 4.6, reviews: 26, completed: 48, punctuality: 96, responseRate: 92, responseTime: "20 min", successRate: 96, yearsExperience: 5, badges: ["verified", "rising_star", "punctual"] }),
  },
  {
    id: "p46", name: "Cristian Mota", profession: "Auxiliar de enfermería", specialty: "Enfermería general",
    city: "Málaga", experience: 3, shift: "Tarde", rateRange: "€", rateLabel: "Profesional en ascenso",
    available: true, verified: false, tags: ["Residencias"],
    rep: rep(232, { rating: 4.5, reviews: 12, completed: 22, punctuality: 92, responseRate: 86, responseTime: "30 min", successRate: 93, yearsExperience: 3, badges: ["rising_star"] }),
  },
  {
    id: "p47", name: "Iván Larrea", profession: "Auxiliar de enfermería", specialty: "Enfermería general",
    city: "Bilbao", experience: 8, shift: "Ambos", rateRange: "€", rateLabel: "Profesional verificado",
    available: true, verified: true, tags: ["Hospitalaria", "Domicilio"],
    rep: rep(528, { rating: 4.7, reviews: 44, completed: 82, punctuality: 97, responseRate: 94, responseTime: "14 min", successRate: 97, yearsExperience: 8, badges: ["verified", "recommended", "punctual"] }),
  },

  // ============ EXTRA — más cobertura en Madrid/Barcelona ============
  {
    id: "p48", name: "Dra. Olivia Pastor", profession: "Médico/a", specialty: "Cardiología",
    city: "Barcelona", experience: 10, shift: "Mañana", rateRange: "€€€", rateLabel: "Especialista senior",
    available: true, verified: true, tags: ["Cardiología clínica", "Hipertensión"],
    rep: rep(744, { rating: 4.8, reviews: 76, completed: 138, punctuality: 97, responseRate: 94, responseTime: "14 min", successRate: 98, yearsExperience: 10, badges: ["verified", "five_star", "recommended"] }),
  },
  {
    id: "p49", name: "Dr. Raúl Estrada", profession: "Médico/a", specialty: "Pediatría",
    city: "Zaragoza", experience: 7, shift: "Mañana", rateRange: "€€", rateLabel: "Profesional consolidado",
    available: true, verified: true, tags: ["Atención primaria infantil"],
    rep: rep(542, { rating: 4.7, reviews: 38, completed: 72, punctuality: 96, responseRate: 92, responseTime: "18 min", successRate: 97, yearsExperience: 7, badges: ["verified", "recommended"] }),
  },
  {
    id: "p50", name: "Selene Cabrera", profession: "Fisioterapeuta", specialty: "Fisioterapia",
    city: "Granada", experience: 5, shift: "Tarde", rateRange: "€", rateLabel: "Profesional verificado",
    available: true, verified: true, tags: ["Deportiva"],
    rep: rep(348, { rating: 4.6, reviews: 24, completed: 42, punctuality: 95, responseRate: 90, responseTime: "22 min", successRate: 96, yearsExperience: 5, badges: ["verified", "rising_star"] }),
  },
  {
    id: "p51", name: "Dr. Gonzalo Mir", profession: "Odontólogo/a", specialty: "Odontología",
    city: "Bilbao", experience: 11, shift: "Mañana", rateRange: "€€€", rateLabel: "Especialista senior",
    available: false, verified: true, tags: ["Estética dental", "Implantología"],
    rep: rep(752, { rating: 4.9, reviews: 84, completed: 152, punctuality: 98, responseRate: 95, responseTime: "12 min", successRate: 99, yearsExperience: 11, badges: ["verified", "five_star", "punctual", "recommended"] }),
  },
  {
    id: "p52", name: "Dra. Vega Aranda", profession: "Psicólogo/a", specialty: "Psicología",
    city: "Valencia", experience: 8, shift: "Ambos", rateRange: "€€", rateLabel: "Profesional consolidado",
    available: true, verified: true, tags: ["Adultos", "Ansiedad"],
    rep: rep(648, { rating: 4.8, reviews: 56, completed: 104, punctuality: 97, responseRate: 93, responseTime: "16 min", successRate: 98, yearsExperience: 8, badges: ["verified", "recommended", "five_star"] }),
  },
];

// ============ Catálogos públicos ============
export const CIUDADES = [
  "Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao", "Zaragoza", "Málaga", "Granada", "Móstoles",
];

export const PROFESIONES = [
  "Médico/a",
  "Enfermero/a",
  "Fisioterapeuta",
  "Odontólogo/a",
  "Psicólogo/a",
  "Dermatólogo/a",
  "Ginecólogo/a",
  "Auxiliar de enfermería",
];

export const ESPECIALIDADES = [
  "Cardiología",
  "Pediatría",
  "Odontología",
  "Fisioterapia",
  "Psicología",
  "Dermatología",
  "Enfermería general",
  "Ginecología",
  "Traumatología",
  "Oftalmología",
  "Radiología",
  "Anestesia",
];

// Convenience counters used by the home grid of specialties
export function countBySpecialty(name: string) {
  return PROFESSIONALS.filter((p) => p.specialty === name).length;
}
