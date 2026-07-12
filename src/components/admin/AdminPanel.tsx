"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, FileText, Calendar, ExternalLink } from "lucide-react";
import type { View } from "@/components/AppShell";
import { INSTITUTO } from "@/lib/constants";

interface AdminPanelProps {
  setView: (v: View) => void;
}

export default function AdminPanel({ setView }: AdminPanelProps) {
  return (
    <div className="space-y-6">
      {/* Hero Admin */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-600 via-orange-600 to-rose-600 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-300 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
        </div>
        <div className="relative p-6 sm:p-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 shadow-lg mb-4">
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold leading-tight">
            Panel de Administración
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/90">
            {INSTITUTO.nombre} · Acceso restringido
          </p>
        </div>
      </Card>

      {/* Selector de opciones admin */}
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          onClick={() => setView({ name: "admin-informes" })}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-700 text-white p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02] text-left"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/15 backdrop-blur-sm mb-4">
              <FileText className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Generación de Informes</h2>
            <p className="text-sm text-white/85 mt-1">
              Descarga de informes PDF por planes, grupos, profesorado y materias. 
              Compatible con dispositivos móviles.
            </p>
            <p className="text-xs text-white/70 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition">
              Acceder <ExternalLink className="w-3 h-3" />
            </p>
          </div>
        </button>

        <button
          onClick={() => setView({ name: "admin-cursos" })}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-700 text-white p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02] text-left"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/15 backdrop-blur-sm mb-4">
              <Calendar className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Configuración de Cursos</h2>
            <p className="text-sm text-white/85 mt-1">
              Gestión de cursos académicos, fechas de inicio y fin, y configuración de los trimestres.
            </p>
            <p className="text-xs text-white/70 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition">
              Acceder <ExternalLink className="w-3 h-3" />
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
