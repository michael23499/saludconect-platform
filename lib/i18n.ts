export type Lang = "es" | "en";

const RAW = {
  es: {
    nav: {
      how: "Cómo funciona",
      clinics: "Para clínicas",
      pros: "Para profesionales",
      search: "Buscar",
      contact: "Contacto",
      login: "Iniciar sesión",
      register: "Crear cuenta",
    },
    common: {
      iAmClinic: "Soy una clínica",
      iAmPro: "Soy un profesional",
      seeProfile: "Ver perfil",
      book: "Reservar",
      available: "Disponible",
      busy: "Ocupado",
      verified: "Verificado",
      explore: "Explorar talento",
      ctaTrial: "Empezar prueba 14 días",
      moreInfo: "Más información",
      lang: "Idioma",
      theme: "Tema",
      light: "Claro",
      dark: "Oscuro",
    },
    hero: {
      pill: "Plataforma activa · 1.247 profesionales conectados ahora",
      title1: "La nueva red ",
      title2: "profesional sanitaria",
      title3: ".",
      desc: "Conectamos clínicas privadas con profesionales sanitarios verificados. Reserva talento en tiempo real, gestiona disponibilidad y cubre tus jornadas en minutos, no en semanas.",
      pros: "+5.000 profesionales verificados",
      prosSub: "Médicos, enfermería, fisio, odontología, psicología…",
      cardTitle: "Solicitud entrante",
      stat1: "Esta semana",
      stat1v: "12 jornadas",
      stat1d: "+34% vs. semana anterior",
      stat2: "Cobertura media",
      stat2v: "4 h 12 min",
      stat2d: "desde solicitud a confirmación",
      reject: "Rechazar",
      accept: "Aceptar reserva",
      trust: "Clínicas y centros que confían en SaludCoNet",
    },
    value: {
      eyebrow: "¿Por qué SaludCoNet?",
      title1: "Todo el ",
      title2: "ecosistema sanitario",
      title3: " en una sola plataforma",
      desc: "Desde la búsqueda hasta el pago, gestionamos cada paso del ciclo de colaboración entre clínicas y profesionales.",
    },
    final: {
      pill: "Más rápido. Más profesional. Más eficiente.",
      title1: "Impulsa la ",
      title2: "nueva generación sanitaria.",
      desc: "Únete a las clínicas y profesionales que están redefiniendo cómo se contrata talento sanitario en España. Empieza hoy mismo, sin tarjeta de crédito.",
    },
    footer: {
      tagline: "La nueva red profesional sanitaria. Conectamos clínicas privadas con profesionales sanitarios verificados en toda España.",
      product: "Producto",
      platform: "Plataforma",
      resources: "Recursos",
      rights: "Plataforma sanitaria profesional · Hecho en España",
      demo: "Demo construida para presentación de proyecto",
    },
  },
  en: {
    nav: {
      how: "How it works",
      clinics: "For clinics",
      pros: "For professionals",
      search: "Search",
      contact: "Contact",
      login: "Sign in",
      register: "Create account",
    },
    common: {
      iAmClinic: "I'm a clinic",
      iAmPro: "I'm a professional",
      seeProfile: "View profile",
      book: "Book",
      available: "Available",
      busy: "Busy",
      verified: "Verified",
      explore: "Browse talent",
      ctaTrial: "Start 14-day trial",
      moreInfo: "Learn more",
      lang: "Language",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
    },
    hero: {
      pill: "Platform live · 1,247 professionals connected now",
      title1: "The new ",
      title2: "healthcare professional network",
      title3: ".",
      desc: "We connect private clinics with verified healthcare professionals. Book talent in real time, manage availability and fill shifts in minutes — not weeks.",
      pros: "+5,000 verified professionals",
      prosSub: "Doctors, nurses, physio, dental, psychology…",
      cardTitle: "Incoming request",
      stat1: "This week",
      stat1v: "12 shifts",
      stat1d: "+34% vs. last week",
      stat2: "Average coverage",
      stat2v: "4 h 12 min",
      stat2d: "from request to confirmation",
      reject: "Decline",
      accept: "Accept booking",
      trust: "Clinics and centers that trust SaludCoNet",
    },
    value: {
      eyebrow: "Why SaludCoNet?",
      title1: "The complete ",
      title2: "healthcare ecosystem",
      title3: " in a single platform",
      desc: "From search to payment, we handle every step of the collaboration cycle between clinics and professionals.",
    },
    final: {
      pill: "Faster. More professional. More efficient.",
      title1: "Power the ",
      title2: "next generation of healthcare.",
      desc: "Join the clinics and professionals reinventing healthcare staffing in Spain. Start today, no credit card required.",
    },
    footer: {
      tagline: "The new healthcare professional network. We connect private clinics with verified healthcare professionals across Spain.",
      product: "Product",
      platform: "Platform",
      resources: "Resources",
      rights: "Healthcare professional platform · Made in Spain",
      demo: "Demo built for project showcase",
    },
  },
} as const;

type DeepWiden<T> =
  T extends string ? string :
  T extends number ? number :
  T extends boolean ? boolean :
  T extends readonly (infer U)[] ? DeepWiden<U>[] :
  T extends object ? { [K in keyof T]: DeepWiden<T[K]> } :
  T;

export type Dict = DeepWiden<typeof RAW.es>;
export const DICT: Record<Lang, Dict> = RAW as unknown as Record<Lang, Dict>;
