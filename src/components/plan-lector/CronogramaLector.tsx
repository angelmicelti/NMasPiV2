"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  CheckCircle2,
  Pencil,
  Trash2,
  Plus,
  Users,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  CLASS_GROUPS,
  EVALUATIONS,
  TOTAL_WEEKS,
  TIPOLOGIAS_TEXTUALES,
  TIPOS_TEXTO,
  getReadingHour,
  getWeekDates,
  getDaysOfWeek,
  getEvaluationForWeek,
  formatDateES,
  DIA_SEMANA,
} from "@/lib/constants";
import {
  subscribeAllLector,
  addEvidenciaLector,
  updateEvidenciaLector,
  deleteEvidenciaLector,
} from "@/lib/firestore";
import type { EvidenciaLector } from "@/lib/types";

interface CellKey {
  fecha: string;
  grupo: string;
}

export default function CronogramaLector() {
  const { user } = useAuth();
  const [evidencias, setEvidencias] = useState<EvidenciaLector[]>([]);
  const [openEvals, setOpenEvals] = useState<string[]>(["eval-0"]);
  const [helpOpen, setHelpOpen] = useState(false);
  const [grupoMenu, setGrupoMenu] = useState<{
    fecha: string;
    hora: number;
    semana: number;
    dia: string;
  } | null>(null);
  const [evidenciaDialog, setEvidenciaDialog] = useState<{
    mode: "create" | "edit";
    fecha: string;
    grupo: string;
    semana: number;
    dia: string;
    hora: number;
    existing?: EvidenciaLector;
  } | null>(null);

  // Subscribe to all lector evidences
  useEffect(() => {
    const unsub = subscribeAllLector(setEvidencias);
    return () => unsub();
  }, []);

  // Build map: fecha|grupo -> evidencia
  const evidenciaMap = useMemo(() => {
    const map = new Map<string, EvidenciaLector>();
    for (const e of evidencias) {
      map.set(`${e.fecha}|${e.grupo}`, e);
    }
    return map;
  }, [evidencias]);

  // Get weeks per evaluation
  const weeksByEval = useMemo(() => {
    const result: { weeks: { num: number; start: Date; hour: number }[]; eval: typeof EVALUATIONS[0] }[] = [];
    let cumul = 0;
    for (const ev of EVALUATIONS) {
      const weeks: { num: number; start: Date; hour: number }[] = [];
      for (let i = 1; i <= ev.weeks; i++) {
        const wnum = cumul + i;
        const { start } = getWeekDates(wnum);
        weeks.push({ num: wnum, start, hour: getReadingHour(wnum) });
      }
      result.push({ weeks, eval: ev });
      cumul += ev.weeks;
    }
    return result;
  }, []);

  // Build full schedule structure per evaluation
  // For each week: { num, start, hour, days: [{ date, name }] }
  const schedule = useMemo(() => {
    return weeksByEval.map((wb, idx) => ({
      evalIdx: idx,
      eval: wb.eval,
      weeks: wb.weeks.map((w) => ({
        ...w,
        days: getDaysOfWeek(w.start).map((date, di) => ({
          date,
          name: DIA_SEMANA[di],
          isoDate: dateToISO(date),
        })),
      })),
    }));
  }, [weeksByEval]);

  function handleCellClick(
    isoDate: string,
    hora: number,
    semana: number,
    dia: string
  ) {
    setGrupoMenu({ fecha: isoDate, hora, semana, dia });
  }

  function handleAssignGroup(grupo: string) {
    if (!grupoMenu) return;
    setEvidenciaDialog({
      mode: "create",
      fecha: grupoMenu.fecha,
      grupo,
      semana: grupoMenu.semana,
      dia: grupoMenu.dia,
      hora: grupoMenu.hora,
    });
    setGrupoMenu(null);
  }

  function handleEditEvidencia(ev: EvidenciaLector) {
    setEvidenciaDialog({
      mode: "edit",
      fecha: ev.fecha,
      grupo: ev.grupo,
      semana: ev.semana,
      dia: ev.dia,
      hora: ev.hora,
      existing: ev,
    });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg">
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-lg sm:text-2xl font-bold">
                Cronograma Plan Lector (2025-2026)
              </h1>
              <p className="text-sm text-white/85 mt-1">
                Sesiones de lectura de 30 minutos, rotando entre 1ª y 6ª hora.
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
              <p className="font-bold">Cómo usar el cronograma</p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                <li>Tres evaluaciones (14, 11 y 11 semanas). Total: 36 semanas.</li>
                <li>La 1ª columna indica la <strong>hora de lectura</strong> de esa semana (rotación cada 6 semanas).</li>
                <li>Pulsa sobre una celda del día y elige tu <strong>grupo</strong> en el menú.</li>
                <li>La celda se pondrá <span className="text-emerald-600 font-semibold">verde</span> y aparecerá el botón "Registrar evidencia".</li>
                <li>Rellena: nombre, tipología textual y tipo de texto (opcional: observación).</li>
                <li>Las evidencias se guardan en Firebase y pueden editarse o eliminarse en cualquier momento.</li>
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
        <span className="font-semibold">Leyenda:</span>
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-400" />
          Con evidencia registrada
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-white border border-slate-300" />
          Sin registrar
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-100 border border-blue-300" />
          Hora de lectura
        </span>
      </div>

      {/* Accordion by evaluation */}
      <Accordion
        type="multiple"
        value={openEvals}
        onValueChange={setOpenEvals}
        className="space-y-3"
      >
        {schedule.map((ev, idx) => (
          <AccordionItem
            key={`eval-${idx}`}
            value={`eval-${idx}`}
            className="border rounded-xl overflow-hidden border-slate-200 bg-white shadow-sm"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex items-center gap-2 text-left">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-800 text-sm sm:text-base">
                  {ev.eval.name}
                </span>
                <span className="text-xs text-slate-500 hidden sm:inline">
                  ({ev.eval.weeks} semanas · {formatDateES(new Date(ev.eval.start))} → {formatDateES(new Date(ev.eval.end))})
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-2 sm:p-3">
              <WeeksTable
                weeks={ev.weeks}
                evidenciaMap={evidenciaMap}
                onCellClick={handleCellClick}
                onEdit={handleEditEvidencia}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Group selection menu (Sheet on mobile, Dialog on desktop) */}
      <Sheet
        open={!!grupoMenu}
        onOpenChange={(o) => !o && setGrupoMenu(null)}
      >
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Selecciona tu grupo
            </SheetTitle>
            <SheetDescription>
              {grupoMenu && (
                <>
                  {grupoMenu.dia}, semana {grupoMenu.semana} · {formatDateES(new Date(grupoMenu.fecha))} ·{" "}
                  {grupoMenu.hora}ª hora
                </>
              )}
            </SheetDescription>
          </SheetHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
            {CLASS_GROUPS.map((g) => {
              const existing = grupoMenu
                ? evidenciaMap.get(`${grupoMenu.fecha}|${g}`)
                : undefined;
              return (
                <button
                  key={g}
                  onClick={() => handleAssignGroup(g)}
                  className={`p-3 rounded-lg border text-sm font-semibold transition ${
                    existing
                      ? "bg-emerald-50 border-emerald-400 text-emerald-700 hover:bg-emerald-100"
                      : "bg-white border-slate-300 text-slate-700 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  <span className="block">{g}</span>
                  {existing && (
                    <span className="text-[10px] font-normal text-emerald-600 mt-0.5 block">
                      {existing.profesor}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* Evidence dialog */}
      {evidenciaDialog && (
        <EvidenciaLectorDialog
          data={evidenciaDialog}
          onClose={() => setEvidenciaDialog(null)}
          user={user}
        />
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Sub: tabla semanal (responsive)
// -----------------------------------------------------------------------------
function WeeksTable({
  weeks,
  evidenciaMap,
  onCellClick,
  onEdit,
}: {
  weeks: {
    num: number;
    start: Date;
    hour: number;
    days: { date: Date; name: string; isoDate: string }[];
  }[];
  evidenciaMap: Map<string, EvidenciaLector>;
  onCellClick: (isoDate: string, hora: number, semana: number, dia: string) => void;
  onEdit: (ev: EvidenciaLector) => void;
}) {
  return (
    <div className="space-y-2">
      {weeks.map((w) => (
        <div
          key={w.num}
          className="rounded-lg border border-slate-200 overflow-hidden bg-white"
        >
          {/* Header semana */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-700">
              Semana {w.num}
            </span>
            <span className="text-xs text-slate-500">
              {formatDateES(w.start)} → {formatDateES(w.days[4].date)}
            </span>
          </div>
          {/* Body: hora + días */}
          <div className="grid grid-cols-[44px_repeat(5,1fr)] sm:grid-cols-[80px_repeat(5,1fr)] gap-0.5 p-1">
            {/* Celda hora */}
            <div className="flex flex-col items-center justify-center bg-blue-100 border border-blue-300 rounded p-1 text-center">
              <Clock className="w-3 h-3 text-blue-700 mb-0.5" />
              <span className="text-[10px] sm:text-xs font-bold text-blue-700">
                {w.hour}ª
              </span>
            </div>
            {/* Celdas días */}
            {w.days.map((d) => {
              // ¿Hay alguna evidencia para este día?
              const dayEvidencias = Array.from(evidenciaMap.values()).filter(
                (e) => e.fecha === d.isoDate
              );
              const hasEvidencias = dayEvidencias.length > 0;

              return (
                <DayCell
                  key={d.isoDate}
                  day={d}
                  semana={w.num}
                  hora={w.hour}
                  dayEvidencias={dayEvidencias}
                  hasEvidencias={hasEvidencias}
                  onCellClick={() => onCellClick(d.isoDate, w.hour, w.num, d.name)}
                  onEdit={onEdit}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function DayCell({
  day,
  semana,
  hora,
  dayEvidencias,
  hasEvidencias,
  onCellClick,
  onEdit,
}: {
  day: { date: Date; name: string; isoDate: string };
  semana: number;
  hora: number;
  dayEvidencias: EvidenciaLector[];
  hasEvidencias: boolean;
  onCellClick: () => void;
  onEdit: (ev: EvidenciaLector) => void;
}) {
  return (
    <button
      onClick={onCellClick}
      className={`relative p-1.5 rounded border text-left transition min-h-[60px] sm:min-h-[80px] ${
        hasEvidencias
          ? "bg-emerald-50 border-emerald-400 hover:bg-emerald-100"
          : "bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50"
      }`}
    >
      <div className="flex flex-col h-full">
        <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">
          {day.name.slice(0, 3)}
        </span>
        <span className="text-[10px] sm:text-xs text-slate-500">
          {day.date.getDate()}/{day.date.getMonth() + 1}
        </span>
        {hasEvidencias && (
          <div className="mt-auto space-y-0.5">
            {dayEvidencias.map((ev) => (
              <span
                key={ev.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(ev);
                }}
                className="block text-[9px] sm:text-[10px] text-emerald-700 bg-emerald-100 rounded px-1 py-0.5 truncate hover:bg-emerald-200 cursor-pointer"
                title={`${ev.grupo} - ${ev.profesor}`}
              >
                <CheckCircle2 className="w-2.5 h-2.5 inline mr-0.5" />
                {ev.grupo}
              </span>
            ))}
          </div>
        )}
        {!hasEvidencias && (
          <span className="mt-auto text-[9px] sm:text-[10px] text-slate-400 inline-flex items-center gap-0.5">
            <Plus className="w-2.5 h-2.5" />
            Añadir
          </span>
        )}
      </div>
    </button>
  );
}

// -----------------------------------------------------------------------------
// Dialog: crear/editar evidencia
// -----------------------------------------------------------------------------
function EvidenciaLectorDialog({
  data,
  onClose,
  user,
}: {
  data: {
    mode: "create" | "edit";
    fecha: string;
    grupo: string;
    semana: number;
    dia: string;
    hora: number;
    existing?: EvidenciaLector;
  };
  onClose: () => void;
  user: ReturnType<typeof useAuth>["user"];
}) {
  const [profesor, setProfesor] = useState(
    data.existing?.profesor || user?.displayName || ""
  );
  const [tipologia, setTipologia] = useState(data.existing?.tipologia || "");
  const [tipoTexto, setTipoTexto] = useState(data.existing?.tipoTexto || "");
  const [observacion, setObservacion] = useState(data.existing?.observacion || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Reset tipoTexto when tipologia changes (si no es el modo edit inicial)
  useEffect(() => {
    if (!data.existing) setTipoTexto("");
  }, [tipologia, data.existing]);

  const handleSave = async () => {
    setError("");
    if (!profesor.trim()) {
      setError("Indica tu nombre.");
      return;
    }
    if (!tipologia) {
      setError("Selecciona la tipología textual.");
      return;
    }
    if (!tipoTexto) {
      setError("Selecciona el tipo de texto.");
      return;
    }
    setSaving(true);
    try {
      if (data.mode === "edit" && data.existing?.id) {
        await updateEvidenciaLector(data.existing.id, {
          profesor: profesor.trim(),
          tipologia,
          tipoTexto,
          observacion: observacion.trim(),
          updatedAt: Date.now(),
        });
      } else {
        await addEvidenciaLector({
          plan: "lector",
          grupo: data.grupo,
          fecha: data.fecha,
          semana: data.semana,
          dia: data.dia,
          hora: data.hora,
          profesor: profesor.trim(),
          tipologia,
          tipoTexto,
          observacion: observacion.trim(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          createdBy: user?.uid,
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError("Error al guardar. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!data.existing?.id) return;
    if (!confirm("¿Seguro que deseas eliminar esta evidencia? Esta acción no se puede deshacer.")) return;
    setSaving(true);
    try {
      await deleteEvidenciaLector(data.existing.id);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Error al eliminar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            {data.mode === "edit" ? "Editar evidencia" : "Registrar evidencia de lectura"}
          </DialogTitle>
          <DialogDescription>
            {data.dia}, semana {data.semana} · {formatDateES(new Date(data.fecha))} ·{" "}
            {data.hora}ª hora · Grupo <strong>{data.grupo}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="ev-profesor">Nombre del profesor/a *</Label>
            <Input
              id="ev-profesor"
              value={profesor}
              onChange={(e) => setProfesor(e.target.value)}
              placeholder="Tu nombre"
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ev-tipologia">Tipología textual *</Label>
            <Select value={tipologia} onValueChange={setTipologia}>
              <SelectTrigger id="ev-tipologia" className="h-11">
                <SelectValue placeholder="Selecciona tipología" />
              </SelectTrigger>
              <SelectContent>
                {TIPOLOGIAS_TEXTUALES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ev-tipo-texto">Tipo de texto *</Label>
            <Select value={tipoTexto} onValueChange={setTipoTexto} disabled={!tipologia}>
              <SelectTrigger id="ev-tipo-texto" className="h-11">
                <SelectValue
                  placeholder={tipologia ? "Selecciona tipo" : "Primero elige tipología"}
                />
              </SelectTrigger>
              <SelectContent>
                {tipologia &&
                  TIPOS_TEXTO[tipologia]?.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {tipologia && (
              <p className="text-xs text-slate-500">
                Tipos disponibles para <strong>{tipologia}</strong>.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ev-obs">Observaciones (opcional)</Label>
            <Textarea
              id="ev-obs"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Comentarios sobre la sesión, dificultades, logros…"
              rows={2}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 flex-col sm:flex-row">
          {data.mode === "edit" && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
              className="sm:mr-auto"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Eliminar
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            {saving ? "Guardando…" : data.mode === "edit" ? "Guardar cambios" : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function dateToISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Silence unused import warning (re-export icons used elsewhere)
export const _icons = { ChevronDown, ChevronUp, Pencil };
