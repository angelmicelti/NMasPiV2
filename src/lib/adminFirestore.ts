"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
export interface TrimestreConfig {
  nombre: string;       // "Primera Evaluación", "Segunda Evaluación", "Tercera Evaluación"
  inicio: string;       // ISO date YYYY-MM-DD
  fin: string;          // ISO date YYYY-MM-DD
}

export interface CursoConfig {
  id?: string;
  nombre: string;         // "2025-2026"
  inicio: string;         // "2025-09-15"
  fin: string;            // "2026-06-30"
  activo: boolean;
  trimestres: TrimestreConfig[];
  createdAt?: number;
  updatedAt?: number;
}

export interface AdminUser {
  uid: string;
  email: string;
  addedAt: number;
}

// ---------------------------------------------------------------------------
// Colecciones
// ---------------------------------------------------------------------------
const ADMIN_COLLECTION = "admin_users";
const CURSOS_COLLECTION = "config_cursos";

// ---------------------------------------------------------------------------
// Admin: comprobar si un UID es administrador
// ---------------------------------------------------------------------------
export async function checkIsAdmin(uid: string): Promise<boolean> {
  try {
    const q = query(collection(db, ADMIN_COLLECTION), where("uid", "==", uid));
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (err) {
    console.error("checkIsAdmin error:", err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Configuración de cursos académicos
// ---------------------------------------------------------------------------
export function subscribeCursos(cb: (items: CursoConfig[]) => void): Unsubscribe {
  const q = query(collection(db, CURSOS_COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const items: CursoConfig[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<CursoConfig, "id">) }));
      cb(items);
    },
    (err) => {
      console.error("subscribeCursos error:", err);
      cb([]);
    }
  );
}

export async function addCursoConfig(data: Omit<CursoConfig, "id">) {
  const payload = { ...data, createdAt: Date.now(), updatedAt: Date.now() };
  return addDoc(collection(db, CURSOS_COLLECTION), payload);
}

export async function updateCursoConfig(id: string, data: Partial<CursoConfig>) {
  return updateDoc(doc(db, CURSOS_COLLECTION, id), { ...data, updatedAt: Date.now() });
}

export async function deleteCursoConfig(id: string) {
  return deleteDoc(doc(db, CURSOS_COLLECTION, id));
}

// Establecer un curso como activo (y desactivar los demás)
export async function setActiveCurso(id: string, allCursos: CursoConfig[]) {
  const updates = allCursos.map((c) =>
    updateDoc(doc(db, CURSOS_COLLECTION, c.id!), {
      activo: c.id === id,
      updatedAt: Date.now(),
    })
  );
  await Promise.all(updates);
}
