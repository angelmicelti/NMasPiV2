"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  HelpCircle,
  X,
  BookOpen,
  FlaskConical,
  Cpu,
  Languages,
  Globe,
  Music,
  Activity,
  Palette,
  Church,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { RM_CURSOS, AMBITOS, INSTITUTO } from "@/lib/constants";
import type { View } from "../AppShell";

interface Props {
  setView: (v: View) => void;
}

export default function RazonamientoMatematicoHome({ setView }: Props) {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="space-y-5">
      {/* Cabecera */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg">
        <div className="p-5 sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold">Plan de Razonamiento Matemático</h1>
              <p className="text-sm sm:text-base text-white/90 mt-1">
                {INSTITUTO.nombre} — Curso {INSTITUTO.curso}
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setHelpOpen((s) => !s)}
              className="bg-white/15 hover:bg-white/25 text-white border border-white/20 shrink-0"
            >
              <HelpCircle className="w-4 h-4 mr-1" />
              Ayuda
            </Button>
          </div>
          {helpOpen && (
            <div className="mt-4 text-left bg-yellow-50 text-slate-800 rounded-lg p-4 text-sm space-y-2 relative">
              <button
                onClick={() => setHelpOpen(false)}
                className="absolute top-2 right-2 text-slate-500 hover:text-slate-800"
                aria-label="Cerrar ayuda"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="font-bold">Cómo usar esta sección</p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                <li>
                  Elige el <strong>curso</strong> con el que vas a trabajar haciendo clic sobre el
                  correspondiente botón.
                </li>
                <li>
                  La aplicación está organizada en <strong>tres evaluaciones</strong> (14, 11 y 11
                  semanas).
                </li>
                <li>
                  La <strong>primera evaluación</strong> aparece desplegada por defecto. Puedes{" "}
                  <strong>ocultar</strong> una evaluación con "−" y <strong>mostrar</strong> con "+".
                </li>
                <li>
                  Cada semana contiene <strong>tres sesiones</strong> de trabajo, asignadas a tres
                  materias.
                </li>
                <li>
                  Bajo cada materia, verás una <strong>sugerencia de actividad</strong> (no es
                  prescriptiva) y el <strong>código de criterio de evaluación</strong>.
                </li>
                <li>
                  Con los botones de la parte superior, puedes <strong>filtrar por una única
                  materia</strong> o por <strong>todas las materias de un ámbito</strong> (CT, SL,
                  AR).
                </li>
                <li>
                  Para <strong>registrar la evidencia</strong>: pulsa el botón del <strong>grupo</strong>{" "}
                  que hay bajo la actividad. Se abrirá un formulario para rellenar:
                  <ul className="list-[circle] pl-5 mt-1 space-y-0.5">
                    <li>Tu <strong>nombre</strong>.</li>
                    <li>La <strong>actividad realizada</strong> (puedes ajustar la sugerencia).</li>
                    <li>Opcionalmente, una <strong>observación</strong>.</li>
                  </ul>
                </li>
                <li>
                  Las evidencias se guardan en <strong>Firebase</strong> y pueden editarse o
                  eliminarse en cualquier momento.
                </li>
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* Botones de recursos */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => setView({ name: "recursos-rm" })}
          className="bg-white"
        >
          <BookOpen className="w-4 h-4 mr-1.5" />
          Recursos
        </Button>
      </div>

      {/* Grid de cursos */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-3 px-1">
          Selecciona tu curso
        </h2>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {RM_CURSOS.map((curso) => (
            <button
              key={curso.id}
              onClick={() => setView({ name: "curso-rm", cursoId: curso.id })}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${curso.gradiente} text-white p-5 shadow-md hover:shadow-xl transition-all hover:scale-[1.02] text-left`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <Calculator className="w-6 h-6 mb-2 opacity-90" />
                  <ChevronRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition" />
                </div>
                <h3 className="font-bold text-base sm:text-lg leading-tight">{curso.nombre}</h3>
                <p className="text-xs text-white/80 mt-1">
                  {curso.grupos.length} grupo{curso.grupos.length > 1 ? "s" : ""} · 36 semanas
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Ámbitos info */}
      <Card className="p-5 border-slate-200">
        <h3 className="text-base font-bold text-slate-800 mb-3">Ámbitos del plan</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <AmbitoCard
            codigo="CT"
            nombre={AMBITOS.CT.nombre}
            materias={AMBITOS.CT.materias}
            color="from-emerald-500 to-green-600"
            icon={<FlaskConical className="w-5 h-5" />}
          />
          <AmbitoCard
            codigo="SL"
            nombre={AMBITOS.SL.nombre}
            materias={AMBITOS.SL.materias}
            color="from-orange-500 to-amber-600"
            icon={<Languages className="w-5 h-5" />}
          />
          <AmbitoCard
            codigo="AR"
            nombre={AMBITOS.AR.nombre}
            materias={AMBITOS.AR.materias}
            color="from-purple-500 to-pink-600"
            icon={<Palette className="w-5 h-5" />}
          />
        </div>
      </Card>
    </div>
  );
}

function AmbitoCard({
  codigo,
  nombre,
  materias,
  color,
  icon,
}: {
  codigo: string;
  nombre: string;
  materias: readonly string[];
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl bg-gradient-to-br ${color} text-white p-4 shadow`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide">{codigo}</p>
          <p className="text-sm font-semibold">{nombre}</p>
        </div>
      </div>
      <ul className="text-xs text-white/85 space-y-0.5 mt-2">
        {materias.map((m) => (
          <li key={m} className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-white/70" />
            {m}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Silenciar imports no usados directamente (referenciados en otros módulos)
export const _unusedIcons = { Cpu, Globe, Music, Activity, Church };
