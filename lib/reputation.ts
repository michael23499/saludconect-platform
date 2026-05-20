export type ReputationLevel = "rookie" | "rising" | "trusted" | "top" | "expert" | "elite";

export type Reputation = {
  score: number;            // 0-1000
  level: ReputationLevel;
  rating: number;           // average 0-5
  reviews: number;          // count
  completed: number;        // completed bookings
  punctuality: number;      // 0-100
  responseRate: number;     // 0-100
  responseTime: string;     // e.g. "12 min"
  successRate: number;      // 0-100
  yearsExperience: number;
  badges: ReputationBadge[];
};

export type ReputationBadge =
  | "verified"
  | "fast_responder"
  | "punctual"
  | "five_star"
  | "in_demand"
  | "recommended"
  | "veteran"
  | "rising_star";

export const LEVELS: Record<ReputationLevel, {
  label: { es: string; en: string };
  range: [number, number];
  color: string;        // tailwind classes for badge text/bg
  ring: string;         // ring on avatar
  description: { es: string; en: string };
}> = {
  rookie:  { label: { es: "Nuevo en la red",    en: "New to the network" }, range: [0, 199],   color: "bg-mist-100 text-mist-500 border-mist-200",        ring: "ring-mist-300",  description: { es: "Acaba de incorporarse",       en: "Just joined the network" } },
  rising:  { label: { es: "Promesa",            en: "Rising Star" },        range: [200, 399], color: "bg-amber-50 text-amber-700 border-amber-100",       ring: "ring-amber-300", description: { es: "Crecimiento rápido en valoraciones", en: "Fast-growing ratings" } },
  trusted: { label: { es: "Confianza",          en: "Trusted" },            range: [400, 599], color: "bg-brand-50 text-brand-700 border-brand-100",       ring: "ring-brand-300", description: { es: "Múltiples colaboraciones positivas", en: "Multiple positive collaborations" } },
  top:     { label: { es: "Top Rated",          en: "Top Rated" },          range: [600, 799], color: "bg-cyan-50 text-cyan-700 border-cyan-100",          ring: "ring-cyan-400",  description: { es: "Excelentes valoraciones constantes", en: "Consistent top ratings" } },
  expert:  { label: { es: "Experto",            en: "Expert" },             range: [800, 919], color: "bg-indigo-50 text-indigo-700 border-indigo-100",    ring: "ring-indigo-400",description: { es: "Reconocido por clínicas líderes",   en: "Recognized by leading clinics" } },
  elite:   { label: { es: "Elite",              en: "Elite" },              range: [920, 1000],color: "bg-gradient-to-r from-indigo-100 to-cyan-100 text-indigo-900 border-indigo-200", ring: "ring-cyan-500", description: { es: "Top 1% de la red",                  en: "Top 1% of the network" } },
};

export function levelFromScore(score: number): ReputationLevel {
  if (score >= 920) return "elite";
  if (score >= 800) return "expert";
  if (score >= 600) return "top";
  if (score >= 400) return "trusted";
  if (score >= 200) return "rising";
  return "rookie";
}

export const BADGES: Record<ReputationBadge, { es: string; en: string; icon: string; tone: string }> = {
  verified:       { es: "Verificado",        en: "Verified",        icon: "✓", tone: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  fast_responder: { es: "Responde rápido",   en: "Fast responder",  icon: "⚡", tone: "bg-amber-50 text-amber-700 border-amber-100" },
  punctual:       { es: "Puntual",           en: "Punctual",        icon: "◷", tone: "bg-brand-50 text-brand-700 border-brand-100" },
  five_star:      { es: "5★ recientes",      en: "Recent 5★",       icon: "★", tone: "bg-amber-50 text-amber-700 border-amber-100" },
  in_demand:      { es: "Muy solicitado",    en: "In demand",       icon: "◆", tone: "bg-cyan-50 text-cyan-700 border-cyan-100" },
  recommended:    { es: "Recomendado",       en: "Recommended",     icon: "♡", tone: "bg-rose-50 text-rose-700 border-rose-100" },
  veteran:        { es: "Veterano",          en: "Veteran",         icon: "◈", tone: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  rising_star:    { es: "En ascenso",        en: "Rising",          icon: "↑", tone: "bg-amber-50 text-amber-700 border-amber-100" },
};

export function nextLevel(level: ReputationLevel): ReputationLevel | null {
  const order: ReputationLevel[] = ["rookie", "rising", "trusted", "top", "expert", "elite"];
  const i = order.indexOf(level);
  return i < order.length - 1 ? order[i + 1] : null;
}
