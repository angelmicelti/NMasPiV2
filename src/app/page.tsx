"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import Login from "@/components/Login";
import AppShell, { type View } from "@/components/AppShell";
import Home from "@/components/Home";
import PlanLectorHome from "@/components/plan-lector/PlanLectorHome";
import CronogramaLector from "@/components/plan-lector/CronogramaLector";
import RecursosCL from "@/components/plan-lector/RecursosCL";
import RazonamientoMatematicoHome from "@/components/rm/RazonamientoMatematicoHome";
import CursoRM from "@/components/rm/CursoRM";
import RecursosRM from "@/components/rm/RecursosRM";
import AdminPanel from "@/components/admin/AdminPanel";
import AdminCursos from "@/components/admin/AdminCursos";
import AdminInformes from "@/components/admin/AdminInformes";

export default function Page() {
  const { user, loading, isAdmin } = useAuth();
  const [view, setView] = useState<View>({ name: "home" });

  // Register service worker on mount (PWA)
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.warn("SW registration failed:", err));
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-600 shadow-lg mb-4">
          <div className="flex items-center gap-0.5 text-white font-bold text-xl">
            <span>ñ</span>
            <span className="text-emerald-200">+</span>
            <span>π</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Cargando…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <AppShell view={view} setView={setView}>
      {view.name === "home" && <Home setView={setView} />}
      {view.name === "plan-lector" && <PlanLectorHome setView={setView} />}
      {view.name === "cronograma-lector" && <CronogramaLector />}
      {view.name === "recursos-cl" && <RecursosCL />}
      {view.name === "razonamiento-matematico" && (
        <RazonamientoMatematicoHome setView={setView} />
      )}
      {view.name === "curso-rm" && <CursoRM key={view.cursoId} cursoId={view.cursoId} />}
      {view.name === "recursos-rm" && <RecursosRM />}
      
      {/* Admin Views */}
      {isAdmin && view.name === "admin" && <AdminPanel setView={setView} />}
      {isAdmin && view.name === "admin-cursos" && <AdminCursos />}
      {isAdmin && view.name === "admin-informes" && <AdminInformes />}
    </AppShell>
  );
}
