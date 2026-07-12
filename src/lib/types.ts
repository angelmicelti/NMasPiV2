// Tipos de datos para evidencias en Firestore

export type PlanType = "lector" | "rm";

// Evidencia del Plan Lector
export interface EvidenciaLector {
  id?: string;
  plan: "lector";
  grupo: string;
  fecha: string; // ISO date YYYY-MM-DD
  semana: number; // 1-36
  dia: string; // Lunes, Martes, ...
  hora: number; // 1-6
  profesor: string;
  tipologia: string;
  tipoTexto: string;
  observacion?: string;
  createdAt?: number;
  updatedAt?: number;
  createdBy?: string;
}

// Evidencia de Razonamiento Matemático
export interface EvidenciaRM {
  id?: string;
  plan: "rm";
  cursoId: string; // "1eso", "2eso", ...
  grupo: string;
  semana: number; // 1-36
  sesion: 1 | 2 | 3;
  materia: string;
  actividad: string;
  codigo?: string;
  profesor: string;
  actividadRealizada: string;
  observacion?: string;
  createdAt?: number;
  updatedAt?: number;
  createdBy?: string;
}

export type Evidencia = EvidenciaLector | EvidenciaRM;

// Usuario autenticado
export interface Usuario {
  uid: string;
  email: string | null;
  displayName: string | null;
}
