"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Filter,
  RotateCcw,
  Pencil,
  Trash2,
  CheckCircle2,
  Plus,
  BarChart3,
  Download,
  Calculator,
} from "lucide-react";
import {
  RM_CURSOS,
  EVALUATIONS,
  TOTAL_WEEKS,
  SUBJECT_COLORS,
  AMBITOS,
  ACTIVIDADES_MATEMATICAS,
  SESION_2_SECUENCIA,
  SESION_2_MATERIAS,
  SESION_3_MATERIAS,
  getWeekDates,
  formatDateES,
} from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import {
  subscribeRMByCursoGrupo,
  addEvidenciaRM,
  updateEvidenciaRM,
  deleteEvidenciaRM,
} from "@/lib/firestore";
import type { EvidenciaRM } from "@/lib/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Sesion {
  sesion: 1 | 2 | 3;
  materia: string;
  actividad: string;
  codigo: string;
}

interface SemanaData {
  num: number;
  start: Date;
  end: Date;
  evalIdx: number;
  sesiones: Sesion[];
}

interface Props {
  cursoId: string;
}

export default function CursoRM({ cursoId }: Props) {
  const { user } = useAuth();
  const curso = RM_CURSOS.find((c) => c.id === cursoId);
  const [openEvals, setOpenEvals] = useState<string[]>(["eval-0"]);
  const [filter, setFilter] = useState<{ type: "all" | "subject" | "ambito"; value: string }>({
    type: "all",
    value: "",
  });
  const [showReports, setShowReports] = useState(false);
  const [evidenciasByGrupo, setEvidenciasByGrupo] = useState<Record<string, EvidenciaRM[]>>({});
  const [evidenciaDialog, setEvidenciaDialog] = useState<{
    mode: "create" | "edit";
    grupo: string;
    semana: number;
    sesion: 1 | 2 | 3;
    materia: string;
    actividad: string;
    codigo: string;
    existing?: EvidenciaRM;
  } | null>(null);

  // Generate full schedule (36 weeks × 3 sessions)
  const schedule = useMemo<SemanaData[]>(() => {
    const semanas: SemanaData[] = [];
    for (let w = 1; w <= TOTAL_WEEKS; w++) {
      const { start, end } = getWeekDates(w);
      let cumul = 0;
      let evalIdx = 0;
      for (let i = 0; i < EVALUATIONS.length; i++) {
        if (w <= cumul + EVALUATIONS[i].weeks) {
          evalIdx = i;
          break;
        }
        cumul += EVALUATIONS[i].weeks;
      }

      // Sesión 1: Matemáticas (rotación de actividades)
      const sesion1Actividad = ACTIVIDADES_MATEMATICAS[(w - 1) % ACTIVIDADES_MATEMATICAS.length];
      const sesion1: Sesion = {
        sesion: 1,
        materia: "Matemáticas",
        actividad: sesion1Actividad,
        codigo: `MA.C.E.${1 + ((w - 1) % 9)}.3`,
      };

      // Sesión 2: rotación 4:3:2 (M, B, C)
      const seqIdx = (w - 1) % SESION_2_SECUENCIA.length;
      const s2key = SESION_2_SECUENCIA[seqIdx];
      const s2 = SESION_2_MATERIAS[s2key];
      const sesion2: Sesion = {
        sesion: 2,
        materia: s2.materia,
        actividad: s2.actividad,
        codigo: s2.codigo,
      };

      // Sesión 3: rotación de materias SL/AR
      const s3 = SESION_3_MATERIAS[(w - 1) % SESION_3_MATERIAS.length];
      const sesion3: Sesion = {
        sesion: 3,
        materia: s3.materia,
        actividad: s3.actividad,
        codigo: s3.codigo,
      };

      semanas.push({ num: w, start, end, evalIdx, sesiones: [sesion1, sesion2, sesion3] });
    }
    return semanas;
  }, []);

  // Subscriptions: one per grupo
  useEffect(() => {
    if (!curso) return;
    const unsubs: Array<() => void> = [];
    for (const g of curso.grupos) {
      const unsub = subscribeRMByCursoGrupo(curso.id, g, (items) => {
        setEvidenciasByGrupo((prev) => ({ ...prev, [g]: items }));
      });
      unsubs.push(unsub);
    }
    return () => unsubs.forEach((u) => u());
  }, [curso]);

  // Group schedule by evaluation
  const scheduleByEval = useMemo(() => {
    const groups: { eval: typeof EVALUATIONS[0]; semanas: SemanaData[] }[] = [];
    for (let i = 0; i < EVALUATIONS.length; i++) {
      groups.push({
        eval: EVALUATIONS[i],
        semanas: schedule.filter((s) => s.evalIdx === i),
      });
    }
    return groups;
  }, [schedule]);

  // All subjects in this curso (for filter buttons)
  const allSubjects = useMemo(() => {
    const set = new Set<string>();
    schedule.forEach((s) => s.sesiones.forEach((ses) => set.add(ses.materia)));
    return Array.from(set).sort();
  }, [schedule]);

  // Apply filter to a session
  function isSessionVisible(sesion: Sesion): boolean {
    if (filter.type === "all") return true;
    if (filter.type === "subject") return sesion.materia === filter.value;
    if (filter.type === "ambito") {
      const ambito = AMBITOS[filter.value as keyof typeof AMBITOS];
      return ambito?.materias.includes(sesion.materia);
    }
    return true;
  }

  // Get evidencia for (grupo, semana, sesion)
  function getEvidencia(grupo: string, semana: number, sesion: number): EvidenciaRM | undefined {
    const list = evidenciasByGrupo[grupo] || [];
    return list.find((e) => e.semana === semana && e.sesion === sesion);
  }

  // Count for chart
  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(evidenciasByGrupo)
      .flat()
      .forEach((e) => {
        counts[e.materia] = (counts[e.materia] || 0) + 1;
      });
    return counts;
  }, [evidenciasByGrupo]);

  const totalEvidencias = Object.values(subjectCounts).reduce((a, b) => a + b, 0);

  if (!curso) {
    return <div>Curso no encontrado.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className={`overflow-hidden border-0 bg-gradient-to-br ${curso.gradiente} text-white shadow-lg`}>
        <div className="p-4 sm:p-6">
          <h1 className="text-lg sm:text-2xl font-bold">
            Plan de Razonamiento Matemático ({curso.nombre})
          </h1>
          <p className="text-sm text-white/85 mt-1">
            Cronograma interactivo · 36 semanas · 3 sesiones/semana
          </p>
        </div>
      </Card>

      {/* Controles: filtros + informe + gráfico */}
      <Card className="p-3 sm:p-4 border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Filter className="w-4 h-4" />
            Filtrar
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={showReports ? "default" : "outline"}
              onClick={() => setShowReports((s) => !s)}
            >
              <FileText className="w-4 h-4 mr-1" />
              Informes
            </Button>
          </div>
        </div>

        {/* Filtro por asignatura */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-600">Por asignatura:</p>
          <div className="flex flex-wrap gap-1.5">
            <Button
              size="sm"
              variant={filter.type === "all" ? "default" : "outline"}
              onClick={() => setFilter({ type: "all", value: "" })}
              className="h-8 text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Mostrar todo
            </Button>
            {allSubjects.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={filter.type === "subject" && filter.value === s ? "default" : "outline"}
                onClick={() => setFilter({ type: "subject", value: s })}
                className="h-8 text-xs"
                style={
                  filter.type === "subject" && filter.value === s
                    ? { backgroundColor: SUBJECT_COLORS[s] }
                    : { borderColor: SUBJECT_COLORS[s], color: SUBJECT_COLORS[s] }
                }
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        {/* Filtro por ámbito */}
        <div className="space-y-2 mt-3">
          <p className="text-xs font-semibold text-slate-600">Por ámbito:</p>
          <div className="flex flex-wrap gap-1.5">
            {(["CT", "SL", "AR"] as const).map((a) => (
              <Button
                key={a}
                size="sm"
                variant={filter.type === "ambito" && filter.value === a ? "default" : "outline"}
                onClick={() => setFilter({ type: "ambito", value: a })}
                className="h-8 text-xs"
              >
                {a} · {AMBITOS[a].nombre}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Informes PDF */}
      {showReports && (
        <ReportsPanel
          curso={curso}
          schedule={schedule}
          evidenciasByGrupo={evidenciasByGrupo}
          allSubjects={allSubjects}
        />
      )}

      {/* Gráfico de distribución */}
      {totalEvidencias > 0 && (
        <Card className="p-4 border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Distribución por materia ({totalEvidencias} evidencias)
            </h3>
          </div>
          <DistributionChart counts={subjectCounts} total={totalEvidencias} />
        </Card>
      )}

      {/* Cronograma por evaluación */}
      <Accordion
        type="multiple"
        value={openEvals}
        onValueChange={setOpenEvals}
        className="space-y-3"
      >
        {scheduleByEval.map((g, idx) => (
          <AccordionItem
            key={`eval-${idx}`}
            value={`eval-${idx}`}
            className="border rounded-xl overflow-hidden border-slate-200 bg-white shadow-sm"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center gap-2 text-left">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-slate-800 text-sm sm:text-base">
                  {g.eval.name}
                </span>
                <span className="text-xs text-slate-500 hidden sm:inline">
                  ({g.eval.weeks} semanas · {formatDateES(new Date(g.eval.start))} →{" "}
                  {formatDateES(new Date(g.eval.end))})
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-2 sm:p-3 space-y-2">
              {g.semanas.map((sem) => (
                <WeekCard
                  key={sem.num}
                  semana={sem}
                  curso={curso}
                  isSessionVisible={isSessionVisible}
                  getEvidencia={getEvidencia}
                  onRegister={(grupo, sesion) =>
                    setEvidenciaDialog({
                      mode: "create",
                      grupo,
                      semana: sem.num,
                      sesion: sesion.sesion,
                      materia: sesion.materia,
                      actividad: sesion.actividad,
                      codigo: sesion.codigo,
                    })
                  }
                  onEdit={(ev, sesion) =>
                    setEvidenciaDialog({
                      mode: "edit",
                      grupo: ev.grupo,
                      semana: ev.semana,
                      sesion: sesion.sesion,
                      materia: sesion.materia,
                      actividad: sesion.actividad,
                      codigo: sesion.codigo,
                      existing: ev,
                    })
                  }
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Dialog evidencia */}
      {evidenciaDialog && (
        <EvidenciaRMDialog
          data={evidenciaDialog}
          curso={curso}
          onClose={() => setEvidenciaDialog(null)}
          user={user}
        />
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Sub: WeekCard (tarjeta de una semana con 3 sesiones)
// -----------------------------------------------------------------------------
function WeekCard({
  semana,
  curso,
  isSessionVisible,
  getEvidencia,
  onRegister,
  onEdit,
}: {
  semana: SemanaData;
  curso: (typeof RM_CURSOS)[0];
  isSessionVisible: (s: Sesion) => boolean;
  getEvidencia: (grupo: string, semana: number, sesion: number) => EvidenciaRM | undefined;
  onRegister: (grupo: string, sesion: Sesion) => void;
  onEdit: (ev: EvidenciaRM, sesion: Sesion) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-200">
        <span className="text-xs font-bold text-slate-700">Semana {semana.num}</span>
        <span className="text-xs text-slate-500">
          {formatDateES(semana.start)} → {formatDateES(semana.end)}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2">
        {semana.sesiones.map((s) => {
          if (!isSessionVisible(s)) {
            return (
              <div
                key={s.sesion}
                className="rounded border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400"
              >
                Sesión {s.sesion} · Oculta por filtro
              </div>
            );
          }
          return (
            <SessionCard
              key={s.sesion}
              sesion={s}
              curso={curso}
              getEvidencia={getEvidencia}
              semana={semana.num}
              onRegister={onRegister}
              onEdit={onEdit}
            />
          );
        })}
      </div>
    </div>
  );
}

function SessionCard({
  sesion,
  curso,
  getEvidencia,
  semana,
  onRegister,
  onEdit,
}: {
  sesion: Sesion;
  curso: (typeof RM_CURSOS)[0];
  getEvidencia: (grupo: string, semana: number, sesion: number) => EvidenciaRM | undefined;
  semana: number;
  onRegister: (grupo: string, sesion: Sesion) => void;
  onEdit: (ev: EvidenciaRM, sesion: Sesion) => void;
}) {
  const color = SUBJECT_COLORS[sesion.materia] || "#64748B";

  return (
    <div
      className="rounded-lg border border-slate-200 p-3 bg-white"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Sesión {sesion.sesion}
          </span>
          <Badge
            variant="secondary"
            className="text-[10px] py-0 h-4"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {sesion.materia}
          </Badge>
        </div>
      </div>
      <p className="text-xs text-slate-700 font-medium leading-snug">{sesion.actividad}</p>
      <p className="text-[10px] text-slate-500 mt-1">
        <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">{sesion.codigo}</span>
      </p>

      {/* Botones por grupo */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {curso.grupos.map((g) => {
          const ev = getEvidencia(g, semana, sesion.sesion);
          if (ev) {
            return (
              <button
                key={g}
                onClick={() => onEdit(ev, sesion)}
                className="text-[10px] sm:text-xs px-2 py-1 rounded-md bg-emerald-50 border border-emerald-400 text-emerald-700 hover:bg-emerald-100 transition inline-flex items-center gap-1"
                title={`${ev.profesor}: ${ev.actividadRealizada}`}
              >
                <CheckCircle2 className="w-3 h-3" />
                {g}
                <Pencil className="w-2.5 h-2.5 opacity-60" />
              </button>
            );
          }
          return (
            <button
              key={g}
              onClick={() => onRegister(g, sesion)}
              className="text-[10px] sm:text-xs px-2 py-1 rounded-md bg-slate-50 border border-slate-300 text-slate-600 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition inline-flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              {g}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Sub: Panel de informes PDF
// -----------------------------------------------------------------------------
function ReportsPanel({
  curso,
  schedule,
  evidenciasByGrupo,
  allSubjects,
}: {
  curso: (typeof RM_CURSOS)[0];
  schedule: SemanaData[];
  evidenciasByGrupo: Record<string, EvidenciaRM[]>;
  allSubjects: string[];
}) {
  const [subjectForReport, setSubjectForReport] = useState("");
  const [eval1, setEval1] = useState(true);
  const [eval2, setEval2] = useState(false);
  const [eval3, setEval3] = useState(false);
  const [tri1, setTri1] = useState(false);
  const [tri2, setTri2] = useState(false);
  const [tri3, setTri3] = useState(false);

  function flattenEvidencias(): EvidenciaRM[] {
    return Object.values(evidenciasByGrupo).flat();
  }

  function generateSubjectPDF() {
    if (!subjectForReport) {
      alert("Selecciona una materia.");
      return;
    }
    const evs = flattenEvidencias().filter(
      (e) => e.materia === subjectForReport
    );
    const sessionsFiltered = schedule
      .filter((s) => {
        const idx = s.evalIdx;
        return (idx === 0 && eval1) || (idx === 1 && eval2) || (idx === 2 && eval3);
      })
      .filter((s) => s.sesiones.some((ses) => ses.materia === subjectForReport));

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Informe RM - ${curso.nombre}`, 14, 18);
    doc.setFontSize(11);
    doc.text(`Materia: ${subjectForReport}`, 14, 26);
    doc.text(
      `Evaluaciones: ${[eval1 && "1ª", eval2 && "2ª", eval3 && "3ª"].filter(Boolean).join(", ")}`,
      14,
      32
    );
    doc.text(`Evidencias registradas: ${evs.length}`, 14, 38);

    const rows: string[][] = [];
    for (const s of sessionsFiltered) {
      const sesion = s.sesiones.find((x) => x.materia === subjectForReport);
      if (!sesion) continue;
      const evsInSession = evs.filter(
        (e) => e.semana === s.num && e.sesion === sesion.sesion
      );
      if (evsInSession.length === 0) {
        rows.push([
          `S${s.num}`,
          sesion.sesion.toString(),
          formatDateES(s.start),
          "—",
          "—",
          "Sin registrar",
        ]);
      } else {
        for (const e of evsInSession) {
          rows.push([
            `S${s.num}`,
            sesion.sesion.toString(),
            formatDateES(s.start),
            e.grupo,
            e.profesor,
            e.actividadRealizada,
          ]);
        }
      }
    }

    autoTable(doc, {
      head: [["Semana", "Sesión", "Inicio", "Grupo", "Profesor", "Actividad"]],
      body: rows,
      startY: 44,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [79, 70, 229] },
    });

    doc.save(`informe_RM_${curso.id}_${subjectForReport.replace(/\s+/g, "_")}.pdf`);
  }

  function generateTrimestrePDF() {
    // Trimestres: S1-S14 (T1), S15-S25 (T2), S26-S36 (T3)
    const evs = flattenEvidencias();
    const wantedWeeks: number[] = [];
    if (tri1) for (let i = 1; i <= 14; i++) wantedWeeks.push(i);
    if (tri2) for (let i = 15; i <= 25; i++) wantedWeeks.push(i);
    if (tri3) for (let i = 26; i <= 36; i++) wantedWeeks.push(i);

    if (wantedWeeks.length === 0) {
      alert("Selecciona al menos un trimestre.");
      return;
    }

    const evsFiltered = evs.filter((e) => wantedWeeks.includes(e.semana));

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Informe RM por Trimestre - ${curso.nombre}`, 14, 18);
    doc.setFontSize(11);
    doc.text(
      `Trimestres: ${[tri1 && "1º (S1-S14)", tri2 && "2º (S15-S25)", tri3 && "3º (S26-S36)"]
        .filter(Boolean)
        .join(", ")}`,
      14,
      26
    );
    doc.text(`Evidencias: ${evsFiltered.length}`, 14, 32);

    const rows = evsFiltered
      .sort((a, b) => a.semana - b.semana || a.sesion - b.sesion)
      .map((e) => [
        `S${e.semana}`,
        e.sesion.toString(),
        e.grupo,
        e.materia,
        e.profesor,
        e.actividadRealizada,
        e.observacion || "",
      ]);

    autoTable(doc, {
      head: [["Semana", "Ses.", "Grupo", "Materia", "Profesor", "Actividad", "Obs."]],
      body: rows,
      startY: 38,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [79, 70, 229] },
    });

    doc.save(`informe_RM_${curso.id}_trimestres.pdf`);
  }

  return (
    <Card className="p-4 border-slate-200">
      <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
        <Download className="w-4 h-4" />
        Generar informes PDF
      </h3>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Informe por materia */}
        <div className="space-y-2 p-3 rounded-lg border border-slate-200 bg-slate-50">
          <p className="text-xs font-bold text-slate-700">Informe por materia</p>
          <Select value={subjectForReport} onValueChange={setSubjectForReport}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Selecciona materia" />
            </SelectTrigger>
            <SelectContent>
              {allSubjects.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-3 text-xs">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={eval1}
                onChange={(e) => setEval1(e.target.checked)}
              />{" "}
              1ª Eval
            </label>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={eval2}
                onChange={(e) => setEval2(e.target.checked)}
              />{" "}
              2ª Eval
            </label>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={eval3}
                onChange={(e) => setEval3(e.target.checked)}
              />{" "}
              3ª Eval
            </label>
          </div>
          <Button size="sm" onClick={generateSubjectPDF} className="w-full">
            <FileText className="w-4 h-4 mr-1" />
            Generar PDF
          </Button>
        </div>

        {/* Informe por trimestre */}
        <div className="space-y-2 p-3 rounded-lg border border-slate-200 bg-slate-50">
          <p className="text-xs font-bold text-slate-700">Informe por trimestre</p>
          <div className="space-y-1 text-xs">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={tri1}
                onChange={(e) => setTri1(e.target.checked)}
              />{" "}
              1º trimestre (S1-S14)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={tri2}
                onChange={(e) => setTri2(e.target.checked)}
              />{" "}
              2º trimestre (S15-S25)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={tri3}
                onChange={(e) => setTri3(e.target.checked)}
              />{" "}
              3º trimestre (S26-S36)
            </label>
          </div>
          <Button size="sm" onClick={generateTrimestrePDF} className="w-full mt-2">
            <FileText className="w-4 h-4 mr-1" />
            Generar PDF
          </Button>
        </div>
      </div>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// Sub: Gráfico de distribución (doughnut con SVG puro)
// -----------------------------------------------------------------------------
function DistributionChart({
  counts,
  total,
}: {
  counts: Record<string, number>;
  total: number;
}) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  // Precalcular offsets acumulativos para cada segmento (sin mutar en render)
  const segments = entries.reduce<
    Array<{ materia: string; count: number; dash: number; offset: number }>
  >((acc, [materia, count]) => {
    const fraction = count / total;
    const dash = fraction * circumference;
    const offset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].dash : 0;
    acc.push({ materia, count, dash, offset });
    return acc;
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <svg width="160" height="160" viewBox="0 0 160 160" className="shrink-0">
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="20"
        />
        {segments.map((s) => (
          <circle
            key={s.materia}
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={SUBJECT_COLORS[s.materia] || "#64748B"}
            strokeWidth="20"
            strokeDasharray={`${s.dash} ${circumference - s.dash}`}
            strokeDashoffset={-s.offset}
            transform="rotate(-90 80 80)"
          />
        ))}
        <text
          x="80"
          y="76"
          textAnchor="middle"
          className="fill-slate-700"
          style={{ fontSize: 22, fontWeight: "bold" }}
        >
          {total}
        </text>
        <text
          x="80"
          y="92"
          textAnchor="middle"
          className="fill-slate-500"
          style={{ fontSize: 10 }}
        >
          total
        </text>
      </svg>
      <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
        {segments.map((s) => (
          <div key={s.materia} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: SUBJECT_COLORS[s.materia] || "#64748B" }}
            />
            <span className="text-slate-700 truncate flex-1">{s.materia}</span>
            <span className="font-bold text-slate-800">
              {s.count} ({Math.round((s.count / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Sub: Dialog crear/editar evidencia RM
// -----------------------------------------------------------------------------
function EvidenciaRMDialog({
  data,
  curso,
  onClose,
  user,
}: {
  data: {
    mode: "create" | "edit";
    grupo: string;
    semana: number;
    sesion: 1 | 2 | 3;
    materia: string;
    actividad: string;
    codigo: string;
    existing?: EvidenciaRM;
  };
  curso: (typeof RM_CURSOS)[0];
  onClose: () => void;
  user: ReturnType<typeof useAuth>["user"];
}) {
  const [profesor, setProfesor] = useState(
    data.existing?.profesor || user?.displayName || ""
  );
  const [actividadRealizada, setActividadRealizada] = useState(
    data.existing?.actividadRealizada || data.actividad
  );
  const [observacion, setObservacion] = useState(data.existing?.observacion || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    if (!profesor.trim()) {
      setError("Indica tu nombre.");
      return;
    }
    if (!actividadRealizada.trim()) {
      setError("Indica la actividad realizada.");
      return;
    }
    setSaving(true);
    try {
      if (data.mode === "edit" && data.existing?.id) {
        await updateEvidenciaRM(data.existing.id, {
          profesor: profesor.trim(),
          actividadRealizada: actividadRealizada.trim(),
          observacion: observacion.trim(),
          updatedAt: Date.now(),
        });
      } else {
        await addEvidenciaRM({
          plan: "rm",
          cursoId: curso.id,
          grupo: data.grupo,
          semana: data.semana,
          sesion: data.sesion,
          materia: data.materia,
          actividad: data.actividad,
          codigo: data.codigo,
          profesor: profesor.trim(),
          actividadRealizada: actividadRealizada.trim(),
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
    if (!confirm("¿Seguro que deseas eliminar esta evidencia?")) return;
    setSaving(true);
    try {
      await deleteEvidenciaRM(data.existing.id);
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
            <Calculator className="w-5 h-5 text-purple-600" />
            {data.mode === "edit" ? "Editar evidencia" : "Registrar actividad RM"}
          </DialogTitle>
          <DialogDescription>
            Semana {data.semana} · Sesión {data.sesion} · {data.materia} · Grupo{" "}
            <strong>{data.grupo}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5 text-xs">
            <p className="font-semibold text-slate-700">Actividad sugerida:</p>
            <p className="text-slate-600 mt-0.5">{data.actividad}</p>
            <p className="mt-1.5">
              <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded text-[10px]">
                {data.codigo}
              </span>
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rm-profesor">Nombre del profesor/a *</Label>
            <Input
              id="rm-profesor"
              value={profesor}
              onChange={(e) => setProfesor(e.target.value)}
              placeholder="Tu nombre"
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rm-actividad">Actividad realizada *</Label>
            <Textarea
              id="rm-actividad"
              value={actividadRealizada}
              onChange={(e) => setActividadRealizada(e.target.value)}
              placeholder="Describe la actividad que has realizado"
              rows={3}
            />
            <p className="text-xs text-slate-500">
              Puedes ajustar la sugerencia según tu desarrollo de la sesión.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rm-obs">Observaciones (opcional)</Label>
            <Textarea
              id="rm-obs"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Dificultades, logros, materiales empleados…"
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
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {saving ? "Guardando…" : data.mode === "edit" ? "Guardar cambios" : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Silence unused imports
export const _icons = { ChevronDown, ChevronUp };
