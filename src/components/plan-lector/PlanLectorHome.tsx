"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, FileText, ExternalLink, HelpCircle, X } from "lucide-react";
import { useState } from "react";
import { INSTITUTO, ENLACES_NORMATIVA } from "@/lib/constants";
import type { View } from "../AppShell";

interface Props {
  setView: (v: View) => void;
}

export default function PlanLectorHome({ setView }: Props) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="space-y-5">
      {/* Cabecera */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-blue-600 via-cyan-600 to-emerald-600 text-white shadow-lg">
        <div className="p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold">
                Plan para el Refuerzo de la Competencia Lingüística
              </h1>
              <p className="text-sm sm:text-base text-white/90 mt-1">
                {INSTITUTO.nombre} — Curso {INSTITUTO.curso}
              </p>
            </div>
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 backdrop-blur-sm shrink-0">
              <BookOpen className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
          </div>
        </div>
      </Card>

      {/* Botones principales */}
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          onClick={() => setView({ name: "cronograma-lector" })}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-white p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02] text-left"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold">Cronograma del Plan</h2>
            <p className="text-sm text-white/85 mt-1">
              Sesiones semanales con rotación de horas. Registra tus evidencias de lectura.
            </p>
            <p className="text-xs text-white/70 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition">
              Abrir cronograma <ExternalLink className="w-3 h-3" />
            </p>
          </div>
        </button>

        <button
          onClick={() => setView({ name: "recursos-cl" })}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-700 text-white p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02] text-left"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold">Recursos</h2>
            <p className="text-sm text-white/85 mt-1">
              Plan de centro, guías oficiales, feedback entre compañer@s.
            </p>
            <p className="text-xs text-white/70 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition">
              Ver recursos <ExternalLink className="w-3 h-3" />
            </p>
          </div>
        </button>
      </div>

      {/* Ayuda */}
      <Card className="p-5 border-slate-200">
        <button
          onClick={() => setShowHelp((s) => !s)}
          className="w-full flex items-center justify-between gap-2 text-left"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-800">
              Cómo usar el cronograma del Plan Lector
            </h3>
          </div>
          <span className="text-xs text-slate-500">{showHelp ? "Ocultar" : "Mostrar"}</span>
        </button>
        {showHelp && (
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                El cronograma está organizado en <strong>tres evaluaciones</strong>, de 14, 11 y 11
                semanas de duración, para un total de 36 semanas.
              </li>
              <li>
                Puedes <strong>ocultar o mostrar</strong> una evaluación con los botones "+" y "−"
                de la parte superior derecha de cada una.
              </li>
              <li>
                La primera columna indica la <strong>hora de lectura</strong> de esa semana. Hay
                rotación cada seis semanas (1ª, 2ª, 3ª, 4ª, 5ª, 6ª hora).
              </li>
              <li>
                El resto de celdas indican la sesión de trabajo (lunes a viernes). Pulsa sobre la
                celda y elige tu <strong>grupo</strong> en el menú contextual.
              </li>
              <li>
                La celda se pondrá verde y aparecerá el botón <strong>"Registrar evidencia"</strong>.
                Al pulsarlo, abre el formulario para rellenar:
                <ul className="list-[circle] pl-5 mt-1 space-y-0.5">
                  <li>Tu <strong>nombre</strong>.</li>
                  <li>
                    <strong>Tipología textual</strong> (expositiva, narrativa, argumentativa…).
                  </li>
                  <li>
                    <strong>Tipo de texto</strong> (artículo, cuento, receta…), asociado a la
                    tipología.
                  </li>
                  <li>Opcionalmente, una <strong>observación</strong>.</li>
                </ul>
              </li>
              <li>
                Las evidencias se guardan en <strong>Firebase</strong> y pueden ser{" "}
                <strong>editadas o eliminadas</strong> por cada profesor/a en cualquier momento.
              </li>
              <li>
                Si hay algo registrado, ten cuidado. Respeta lo que tus compañer@s han hecho. Si
                algo no funciona, comunícalo al Equipo Directivo.
              </li>
            </ul>
            <a
              href={ENLACES_NORMATIVA.instruccionesCL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 underline mt-2"
            >
              <FileText className="w-4 h-4" />
              Ver instrucciones oficiales (Junta de Andalucía)
            </a>
          </div>
        )}
      </Card>
    </div>
  );
}
