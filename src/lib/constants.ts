// ===========================================================================
// Constantes del IES Virgen de Villadiego - Plan Lector y Razonamiento Matemático
// ===========================================================================

export const INSTITUTO = {
  nombre: "IES Virgen de Villadiego",
  localidad: "Peñaflor (Sevilla)",
  curso: "2025-2026",
  blogUrl: "https://blogsaverroes.juntadeandalucia.es/iesvilladiego/",
};

// ---------------------------------------------------------------------------
// Cronograma general
// ---------------------------------------------------------------------------
export const PLAN_START = "2025-09-15"; // Lunes
export const PLAN_END = "2026-06-19"; // Viernes

export interface Evaluation {
  name: string;
  start: string;
  end: string;
  weeks: number;
}

export const EVALUATIONS: Evaluation[] = [
  { name: "Primera Evaluación", start: "2025-09-15", end: "2025-12-19", weeks: 14 },
  { name: "Segunda Evaluación", start: "2026-01-12", end: "2026-03-27", weeks: 11 },
  { name: "Tercera Evaluación", start: "2026-04-06", end: "2026-06-19", weeks: 11 },
];

export const TOTAL_WEEKS = 36;
export const SESSIONS_PER_WEEK_CL = 5; // Lunes a viernes
export const SESSIONS_PER_WEEK_RM = 3; // 3 sesiones por semana
export const READING_HOURS = [1, 2, 3, 4, 5, 6]; // Rotación cada 6 semanas

// ---------------------------------------------------------------------------
// Grupos de clase (11 grupos)
// ---------------------------------------------------------------------------
export const CLASS_GROUPS = [
  "1ºA",
  "1ºB",
  "2ºA",
  "2ºB",
  "3ºA",
  "3ºB",
  "3ºDiver",
  "4º Ciencias",
  "4º Sociales",
  "4º Ciclos",
  "4º Diver",
] as const;

export type ClassGroup = (typeof CLASS_GROUPS)[number];

// ---------------------------------------------------------------------------
// Plan Lector: tipologías textuales y tipos de texto
// ---------------------------------------------------------------------------
export const TIPOLOGIAS_TEXTUALES = [
  "Expositiva",
  "Argumentativa",
  "Narrativa",
  "Descriptiva",
  "Dialogada",
  "Instructiva",
] as const;

export const TIPOS_TEXTO: Record<string, string[]> = {
  Expositiva: ["Artículo de divulgación", "Enciclopedia", "Manual escolar", "Informe"],
  Argumentativa: ["Carta al director", "Columna de opinión", "Editorial", "Ensayo"],
  Narrativa: ["Cuento", "Novela", "Relato histórico", "Mito", "Leyenda", "Fábula"],
  Descriptiva: ["Guía turística", "Retrato", "Catálogo", "Topografía"],
  Dialogada: ["Entrevista", "Diálogo teatral", "Conversación", "Debate"],
  Instructiva: ["Receta", "Manual de instrucciones", "Normativa", "Tutorial"],
};

// ---------------------------------------------------------------------------
// Razonamiento Matemático: cursos
// ---------------------------------------------------------------------------
export interface RMCurso {
  id: string;
  nombre: string;
  gradiente: string; // tailwind gradient classes
  grupos: string[];
}

export const RM_CURSOS: RMCurso[] = [
  { id: "1eso", nombre: "1º ESO", gradiente: "from-purple-600 to-indigo-600", grupos: ["1ºA", "1ºB"] },
  { id: "2eso", nombre: "2º ESO", gradiente: "from-purple-600 to-indigo-600", grupos: ["2ºA", "2ºB"] },
  { id: "3eso", nombre: "3º ESO", gradiente: "from-purple-600 to-indigo-600", grupos: ["3ºA", "3ºB"] },
  { id: "3diver", nombre: "3º Diversificación", gradiente: "from-rose-600 to-pink-600", grupos: ["3ºDiver"] },
  { id: "4cien", nombre: "4º Ciencias", gradiente: "from-teal-600 to-cyan-600", grupos: ["4º Ciencias"] },
  { id: "4soci", nombre: "4º Sociales y Humanidades", gradiente: "from-orange-500 to-amber-500", grupos: ["4º Sociales"] },
  { id: "4cicl", nombre: "4º Ciclos", gradiente: "from-emerald-600 to-green-600", grupos: ["4º Ciclos"] },
  { id: "4diver", nombre: "4º Diversificación", gradiente: "from-rose-600 to-pink-600", grupos: ["4º Diver"] },
];

// ---------------------------------------------------------------------------
// Materias de Razonamiento Matemático
// ---------------------------------------------------------------------------
export const SUBJECT_COLORS: Record<string, string> = {
  Matemáticas: "#4F46E5", // indigo
  "Biología y Geología": "#10B981", // emerald
  "Computación y Robótica": "#0EA5E9", // sky
  Lengua: "#F97316", // orange
  "Geografía e Historia": "#8B5CF6", // violet
  Inglés: "#EC4899", // pink
  Francés: "#D946EF", // fuchsia
  Religión: "#6B7280", // gray
  Música: "#F59E0B", // amber
  EPVA: "#EF4444", // red
  "Ed. Física": "#3B82F6", // blue
  Tecnología: "#14B8A6", // teal
  "Cultura Científica": "#22C55E", // green
  "Dibujo Técnico": "#A855F7", // purple
  "Expresión Artística": "#F43F5E", // rose
  Valores: "#0284C7", // sky dark
};

export const AMBITOS = {
  AR: { nombre: "Artístico", materias: ["Música", "EPVA", "Ed. Física", "Expresión Artística"] },
  CT: {
    nombre: "Científico-Tecnológico",
    materias: ["Matemáticas", "Biología y Geología", "Computación y Robótica", "Tecnología", "Cultura Científica", "Dibujo Técnico"],
  },
  SL: {
    nombre: "Socio-Lingüístico",
    materias: ["Lengua", "Inglés", "Francés", "Geografía e Historia", "Religión", "Valores"],
  },
} as const;

// Actividades de ejemplo para sesión 1 (Matemáticas) - se rotan por semana
export const ACTIVIDADES_MATEMATICAS = [
  "Resolución de problemas con fracciones",
  "Cálculo de porcentajes en contextos reales",
  "Geometría: cálculo de áreas y perímetros",
  "Estadística básica: media, mediana y moda",
  "Probabilidad: sucesos simples",
  "Ecuaciones de primer grado",
  "Sistemas de ecuaciones",
  "Proporcionalidad directa e inversa",
  "Potencias y raíces cuadradas",
  "Divisibilidad y números primos",
  "Teorema de Pitágoras",
  "Semejanza de triángulos",
  "Funciones lineales",
  "Funciones cuadráticas",
  "Trigonometría básica",
  "Cálculo mental y estrategias",
  "Resolución de problemas inversos",
  "Análisis de gráficas",
  "Estimación y aproximación",
  "Magnitudes y unidades",
];

// Rotación de sesión 2 (4:3:2 - Matemáticas, Biología, Computación)
// Secuencia base de 9 semanas: M, B, C, M, B, M, B, C, M
export const SESION_2_SECUENCIA = ["M", "B", "C", "M", "B", "M", "B", "C", "M"];

export const SESION_2_MATERIAS: Record<string, { materia: string; actividad: string; codigo: string }> = {
  M: {
    materia: "Matemáticas",
    actividad: "Resolución de problemas matemáticos contextualizados",
    codigo: "MA.C.E.1.3",
  },
  B: {
    materia: "Biología y Geología",
    actividad: "Análisis de datos científicos y cálculo de magnitudes",
    codigo: "BQ.C.E.1.4",
  },
  C: {
    materia: "Computación y Robótica",
    actividad: "Programación de algoritmos con operaciones matemáticas",
    codigo: "CR.C.E.1.1",
  },
};

// Sesión 3: materias de los ámbitos SL/AR rotando
export const SESION_3_MATERIAS = [
  { materia: "Lengua", actividad: "Comprensión de enunciados matemáticos", codigo: "LCL.C.E.1.4" },
  { materia: "Inglés", actividad: "Vocabulario matemático en inglés", codigo: "ING.C.E.1.2" },
  { materia: "Francés", actividad: "Vocabulario matemático en francés", codigo: "FRA.C.E.1.2" },
  { materia: "Geografía e Historia", actividad: "Matemáticas en la historia y geografía", codigo: "GEO.C.E.1.3" },
  { materia: "Música", actividad: "Ritmo, compás y fracciones musicales", codigo: "MUS.C.E.1.1" },
  { materia: "Ed. Física", actividad: "Cálculo de tiempos, distancias y marcas", codigo: "EF.C.E.1.3" },
  { materia: "EPVA", actividad: "Geometría y proporción en el arte", codigo: "EPVA.C.E.1.2" },
  { materia: "Religión", actividad: "Simbología numérica en tradiciones religiosas", codigo: "REL.C.E.1.1" },
];

// ---------------------------------------------------------------------------
// Utilidades de fechas
// ---------------------------------------------------------------------------
export function normalizeDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateES(date: Date): string {
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function getWeekDates(weekNumber: number): { start: Date; end: Date } {
  // weekNumber es 1-indexed, contando desde PLAN_START (lunes)
  const start = normalizeDate(PLAN_START);
  start.setDate(start.getDate() + (weekNumber - 1) * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 4); // viernes
  return { start, end };
}

export function getEvaluationForWeek(weekNumber: number): number {
  // Devuelve 0, 1, o 2 según la evaluación a la que pertenece la semana
  let cumul = 0;
  for (let i = 0; i < EVALUATIONS.length; i++) {
    if (weekNumber <= cumul + EVALUATIONS[i].weeks) return i;
    cumul += EVALUATIONS[i].weeks;
  }
  return EVALUATIONS.length - 1;
}

export function getReadingHour(weekNumber: number): number {
  // Rotación cada 6 semanas: 1ª, 2ª, 3ª, 4ª, 5ª, 6ª hora
  return ((weekNumber - 1) % 6) + 1;
}

export function getDaysOfWeek(weekStart: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

export const DIA_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

// ---------------------------------------------------------------------------
// Enlaces externos (recursos)
// ---------------------------------------------------------------------------
export const ENLACES_NORMATIVA = {
  instruccionesCL:
    "https://www.juntadeandalucia.es/educacion/portals/web/transformacion-digital-educativa/planes-y-programas/-/planes-y-programas/plan-para-el-refuerzo-de-la-competencia-linguistica",
  instruccionesRM:
    "https://www.juntadeandalucia.es/educacion/portals/web/transformacion-digital-educativa/planes-y-programas/-/planes-y-programas/plan-de-impulso-del-razonamiento-matematico",
  guiaCL:
    "https://www.juntadeandalucia.es/educacion/portals/web/transformacion-digital-educativa/planes-y-programas/-/planes-y-programas/plan-para-el-refuerzo-de-la-competencia-linguistica",
  guiaRM:
    "https://www.juntadeandalucia.es/educacion/portals/web/transformacion-digital-educativa/planes-y-programas/-/planes-y-programas/plan-de-impulso-del-razonamiento-matematico",
};

export const ENLACES_RECURSOS_CL = [
  {
    titulo: "Plan Lector en el Plan de Centro del IES",
    descripcion:
      "Documento público con el desarrollo completo del Plan para el Refuerzo de la Competencia Lingüística en el Plan de Centro.",
    url: "https://docs.google.com/document/d/e/2PACX-1vQWh5cK5NK8MVjPitjdjtDecVzzvamQmOiHGUXvTAPE7NIyx9a9rrutghCCiwW1waQJ5crWjIsKPq-N/pub",
    icono: "book",
  },
  {
    titulo: "Guía para el Refuerzo de la Competencia Lectora",
    descripcion:
      "Guía oficial de la Junta de Andalucía con orientaciones para el desarrollo del plan de lectura en los centros educativos.",
    url: ENLACES_NORMATIVA.guiaCL,
    icono: "guide",
  },
  {
    titulo: "Feedback entre compañer@s",
    descripcion:
      "Hoja compartida para que el profesorado comparta experiencias, recursos y propuestas de mejora organizadas por ámbitos (Artístico, Científico-Tecnológico y Socio-Lingüístico).",
    url: "https://docs.google.com/spreadsheets/d/1Ugge_isBJyWPpj7gJ1dUe_kaPnP3s0UH4VKZkqfIW_E/edit",
    icono: "feedback",
  },
];

export const ENLACES_RECURSOS_RM = [
  {
    titulo: "Actividades para trabajar el Razonamiento Matemático",
    descripcion:
      "Banco de actividades y propuestas didácticas elaborado por el IES Ben Gabirol, organizado por niveles y bloques de contenido.",
    url: "https://gemini.google.com/share/13b0850202aa",
    icono: "activities",
  },
  {
    titulo: "Partimos de algo: un poquito de teoría...",
    descripcion:
      "Documento del IES Virgen de Villadiego con fundamentación teórica del plan de razonamiento matemático y orientaciones didácticas.",
    url: "https://docs.google.com/document/d/e/2PACX-1vTdNf_xZ3Q7bmSudYTgWh8zGgGsaFywRORMirYnXBpLPcuG2Pioh1f7Lmr-kNuLJGyoqU0dsndBC_3g/pub",
    icono: "theory",
  },
  {
    titulo: "Plantilla para la resolución de problemas científicos y tecnológicos",
    descripcion:
      "Plantilla editable para el alumnado con el método de resolución de problemas paso a paso.",
    url: "https://docs.google.com/document/d/1SOx9vlEndNgWEFP3a-uTSPkUpO9mldWzbATgt2EJCrs/edit?usp=sharing",
    icono: "template",
  },
  {
    titulo: "Plan de Impulso al Razonamiento Matemático",
    descripcion:
      "Instrucciones de la Junta de Andalucía para la implementación del Plan de Impulso del Razonamiento Matemático en los centros.",
    url: ENLACES_NORMATIVA.instruccionesRM,
    icono: "guide",
  },
  {
    titulo: "Guía de Refuerzo de la Competencia Matemática",
    descripcion:
      "Guía oficial con orientaciones prácticas y ejemplos de actividades para el desarrollo de la competencia matemática.",
    url: ENLACES_NORMATIVA.guiaRM,
    icono: "guide",
  },
  {
    titulo: "Feedback entre compañer@s",
    descripcion:
      "Hoja compartida para el intercambio de experiencias y recursos del Plan de Razonamiento Matemático, organizada por ámbitos.",
    url: "https://docs.google.com/spreadsheets/d/1e8lkjHpMVBWR3EzVzZt6DBFbx3rzGAQGPp_Kr0h-do0/edit",
    icono: "feedback",
  },
];
