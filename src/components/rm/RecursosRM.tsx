"use client";

import { Card } from "@/components/ui/card";
import {
  Calculator,
  BookOpen,
  FileText,
  MessageSquare,
  ExternalLink,
  Lightbulb,
  ClipboardList,
  PencilLine,
} from "lucide-react";
import { ENLACES_RECURSOS_RM, INSTITUTO } from "@/lib/constants";

const ICONS: Record<string, React.ReactNode> = {
  activities: <Lightbulb className="w-5 h-5" />,
  theory: <BookOpen className="w-5 h-5" />,
  template: <PencilLine className="w-5 h-5" />,
  guide: <FileText className="w-5 h-5" />,
  feedback: <MessageSquare className="w-5 h-5" />,
};

export default function RecursosRM() {
  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-emerald-600 to-indigo-600 text-white shadow-lg">
        <div className="p-5 sm:p-7 flex items-center gap-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/15 backdrop-blur-sm shrink-0">
            <Calculator className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              Recursos para el Razonamiento Matemático
            </h1>
            <p className="text-sm text-white/85 mt-1">
              Banco de actividades, teoría, plantillas y normativa · {INSTITUTO.nombre}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {ENLACES_RECURSOS_RM.map((recurso, idx) => (
          <a
            key={idx}
            href={recurso.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition"
          >
            <div className="flex items-start gap-3">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                {ICONS[recurso.icono] || <FileText className="w-5 h-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-800 group-hover:text-emerald-700 flex items-center gap-1">
                  {recurso.titulo}
                  <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                </h3>
                <p className="text-sm text-slate-600 mt-1">{recurso.descripcion}</p>
              </div>
            </div>
          </a>
        ))}
      </div>

      <Card className="p-5 border-slate-200 bg-yellow-50/50">
        <div className="flex items-start gap-3">
          <ClipboardList className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Añadir contenido</h3>
            <p className="text-xs text-slate-600 mt-1">
              Si tienes recursos, materiales o propuestas didácticas para el plan de razonamiento
              matemático, comunícalo al Equipo Directivo para incluirlos en esta sección.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
