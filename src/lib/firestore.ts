"use client";

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  Timestamp,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { EvidenciaLector, EvidenciaRM } from "@/lib/types";

// ---------------------------------------------------------------------------
// Plan Lector
// ---------------------------------------------------------------------------
const LECTOR_COLLECTION = "evidencias_lector";

export function subscribeLectorByGroup(
  grupo: string,
  cb: (items: EvidenciaLector[]) => void
): Unsubscribe {
  const q = query(
    collection(db, LECTOR_COLLECTION),
    where("grupo", "==", grupo),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (snap) => {
      const items: EvidenciaLector[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<EvidenciaLector, "id">) }));
      cb(items);
    },
    (err) => {
      console.error("subscribeLectorByGroup error:", err);
      cb([]);
    }
  );
}

export function subscribeAllLector(cb: (items: EvidenciaLector[]) => void): Unsubscribe {
  const q = query(collection(db, LECTOR_COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const items: EvidenciaLector[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<EvidenciaLector, "id">) }));
      cb(items);
    },
    (err) => {
      console.error("subscribeAllLector error:", err);
      cb([]);
    }
  );
}

export async function addEvidenciaLector(data: Omit<EvidenciaLector, "id">) {
  const payload = { ...data, createdAt: Date.now(), updatedAt: Date.now() };
  return addDoc(collection(db, LECTOR_COLLECTION), payload);
}

export async function updateEvidenciaLector(id: string, data: Partial<EvidenciaLector>) {
  return updateDoc(doc(db, LECTOR_COLLECTION, id), { ...data, updatedAt: Date.now() });
}

export async function deleteEvidenciaLector(id: string) {
  return deleteDoc(doc(db, LECTOR_COLLECTION, id));
}

// ---------------------------------------------------------------------------
// Razonamiento Matemático
// ---------------------------------------------------------------------------
const RM_COLLECTION = "evidencias_rm";

export function subscribeRMByCursoGrupo(
  cursoId: string,
  grupo: string,
  cb: (items: EvidenciaRM[]) => void
): Unsubscribe {
  const q = query(
    collection(db, RM_COLLECTION),
    where("cursoId", "==", cursoId),
    where("grupo", "==", grupo),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (snap) => {
      const items: EvidenciaRM[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<EvidenciaRM, "id">) }));
      cb(items);
    },
    (err) => {
      console.error("subscribeRMByCursoGrupo error:", err);
      cb([]);
    }
  );
}

export function subscribeAllRM(cb: (items: EvidenciaRM[]) => void): Unsubscribe {
  const q = query(collection(db, RM_COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const items: EvidenciaRM[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<EvidenciaRM, "id">) }));
      cb(items);
    },
    (err) => {
      console.error("subscribeAllRM error:", err);
      cb([]);
    }
  );
}

export async function addEvidenciaRM(data: Omit<EvidenciaRM, "id">) {
  const payload = { ...data, createdAt: Date.now(), updatedAt: Date.now() };
  return addDoc(collection(db, RM_COLLECTION), payload);
}

export async function updateEvidenciaRM(id: string, data: Partial<EvidenciaRM>) {
  return updateDoc(doc(db, RM_COLLECTION, id), { ...data, updatedAt: Date.now() });
}

export async function deleteEvidenciaRM(id: string) {
  return deleteDoc(doc(db, RM_COLLECTION, id));
}
