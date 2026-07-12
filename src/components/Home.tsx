"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BookOpen,
  Calculator,
  HelpCircle,
  X,
  FileText,
  GraduationCap,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { INSTITUTO, ENLACES_NORMATIVA } from "@/lib/constants";
import type { View } from "./AppShell";

interface HomeProps {
  setView: (v: View) => void;
}

export default function Home({ setView }: HomeProps) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-600 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-300 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
        </div>
        <div className="relative p-6 sm:p-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 shadow-lg mb-4">
            <div className="flex items-center gap-0.5 text-3xl sm:text-4xl font-bold">
              <span>ñ</span>
              <span className="text-emerald-200 text-2xl">+</span>
              <span>π</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold leading-tight">
            Planes Lector y de Razonamiento Matemático
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/90">
            {INSTITUTO.nombre} · {INSTITUTO.localidad}
          </p>
          <p className="mt-1 text-xs sm:text-sm text-white/80">Curso {INSTITUTO.curso}</p>

          <div className="mt-6 flex justify-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowHelp((s) => !s)}
              className="bg-white/15 hover:bg-white/25 text-white border border-white/20"
            >
              <HelpCircle className="w-4 h-4 mr-1.5" />
              ¿Cómo usar esta aplicación?
            </Button>
          </div>

          {showHelp && (
            <div className="mt-4 text-left bg-yellow-50 text-slate-800 rounded-lg p-4 shadow-lg max-w-2xl mx-auto text-sm space-y-2 relative">
              <button
                onClick={() => setShowHelp(false)}
                className="absolute top-2 right-2 text-slate-500 hover:text-slate-800"
                aria-label="Cerrar ayuda"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="font-bold flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" /> Cómo usar esta aplicación
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                <li>
                  Elige <strong>"Plan Lector"</strong> o <strong>"Razonamiento Matemático"</strong>{" "}
                  según el plan en el que vayas a registrar tu evidencia.
                </li>
                <li>
                  En el <strong>Plan Lector</strong> encontrarás el cronograma semanal con la
                  rotación de horas de lectura. Pulsa sobre una sesión para asignar tu grupo y
                  registrar la evidencia.
                </li>
                <li>
                  En <strong>Razonamiento Matemático</strong>, selecciona tu curso y encontrarás las
                  sesiones semanales con sus materias y actividades sugeridas. Pulsa el botón de tu
                  grupo para registrar la actividad realizada.
                </li>
                <li>
                  Las evidencias se guardan en <strong>Firebase</strong>, por lo que son
                  editables y eliminables en tiempo real por cada profesor/a.
                </li>
                <li>
                  Solo el profesorado con cuenta puede acceder. Si algo no funciona, comunícalo al
                  Equipo Directivo.
                </li>
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* Selector de planes */}
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          onClick={() => setView({ name: "plan-lector" })}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 text-white p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02] text-left"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/15 backdrop-blur-sm mb-4">
              <BookOpen className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Plan Lector</h2>
            <p className="text-sm text-white/85 mt-1">
              Refuerzo de la Competencia Lingüística. Cronograma de sesiones de lectura de 30
              minutos con rotación horaria.
            </p>
            <p className="text-xs text-white/70 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition">
              Acceder <ExternalLink className="w-3 h-3" />
            </p>
          </div>
        </button>

        <button
          onClick={() => setView({ name: "razonamiento-matematico" })}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 text-white p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02] text-left"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/15 backdrop-blur-sm mb-4">
              <Calculator className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Razonamiento Matemático</h2>
            <p className="text-sm text-white/85 mt-1">
              Plan de impulso del razonamiento matemático. Cronograma por cursos con sesiones
              semanales y materias rotativas.
            </p>
            <p className="text-xs text-white/70 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition">
              Acceder <ExternalLink className="w-3 h-3" />
            </p>
          </div>
        </button>
      </div>

      {/* Normativa */}
      <Card className="p-5 sm:p-6 border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-slate-600" />
          <h3 className="text-base sm:text-lg font-bold text-slate-800">Normativa</h3>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Instrucciones oficiales de la Junta de Andalucía para el desarrollo de ambos planes en los
          centros de educación secundaria.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href={ENLACES_NORMATIVA.instruccionesCL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition group"
          >
            <BookOpen className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">
                Instrucciones Competencia Lingüística
              </p>
              <p className="text-xs text-slate-500">Junta de Andalucía · PDF oficial</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 mt-1" />
          </a>
          <a
            href={ENLACES_NORMATIVA.instruccionesRM}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition group"
          >
            <Calculator className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700">
                Instrucciones Razonamiento Matemático
              </p>
              <p className="text-xs text-slate-500">Junta de Andalucía · PDF oficial</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0 mt-1" />
          </a>
        </div>
      </Card>

      {/* Atajos */}
      <div className="grid gap-3 sm:grid-cols-3">
        <button
          onClick={() => setView({ name: "cronograma-lector" })}
          className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition text-left"
        >
          <Calendar className="w-5 h-5 text-blue-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">Cronograma Lector</p>
            <p className="text-xs text-slate-500">Acceso directo</p>
          </div>
        </button>
        <button
          onClick={() => setView({ name: "recursos-cl" })}
          className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition text-left"
        >
          <BookOpen className="w-5 h-5 text-purple-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">Recursos CL</p>
            <p className="text-xs text-slate-500">Documentación y enlaces</p>
          </div>
        </button>
        <button
          onClick={() => setView({ name: "recursos-rm" })}
          className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition text-left"
        >
          <GraduationCap className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">Recursos RM</p>
            <p className="text-xs text-slate-500">Teoría y plantillas</p>
          </div>
        </button>
      </div>
    </div>
  );
}
