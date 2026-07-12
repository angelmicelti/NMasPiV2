"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Filter, FileBarChart, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { subscribeAllLector, subscribeAllRM } from "@/lib/firestore";
import type { EvidenciaLector, EvidenciaRM } from "@/lib/types";
import { 
  safePdfDownload, 
  addPdfHeader, 
  addPdfFooter, 
  addPdfSummaryBox, 
  getTemporalFilterDates 
} from "@/lib/pdfUtils";
import { CLASS_GROUPS, SUBJECT_COLORS, formatDateES } from "@/lib/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

export default function AdminInformes() {
  const [lectorEvs, setLectorEvs] = useState<EvidenciaLector[]>([]);
  const [rmEvs, setRmEvs] = useState<EvidenciaRM[]>([]);
  const [loadingLector, setLoadingLector] = useState(true);
  const [loadingRM, setLoadingRM] = useState(true);
  
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    const unsubL = subscribeAllLector((data) => {
      setLectorEvs(data);
      setLoadingLector(false);
    });
    const unsubR = subscribeAllRM((data) => {
      setRmEvs(data);
      setLoadingRM(false);
    });
    return () => {
      unsubL();
      unsubR();
    };
  }, []);

  if (loadingLector || loadingRM) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
        <p>Cargando datos de evidencias...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <FileBarChart className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-slate-800">Generador de Informes</h1>
      </div>

      <Tabs defaultValue="lector" className="w-full">
        <TabsList className="w-full sm:w-auto flex flex-col sm:flex-row h-auto gap-2 bg-transparent p-0 mb-6">
          <TabsTrigger value="lector" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-lg px-4 py-2 border border-slate-200">
            Plan Lector
          </TabsTrigger>
          <TabsTrigger value="rm" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 rounded-lg px-4 py-2 border border-slate-200">
            Razonamiento Matemático
          </TabsTrigger>
          <TabsTrigger value="profesores" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 rounded-lg px-4 py-2 border border-slate-200">
            Por Profesorado
          </TabsTrigger>
          <TabsTrigger value="materias" className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-700 rounded-lg px-4 py-2 border border-slate-200">
            Por Materias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lector">
          <InformeLector evidencias={lectorEvs} isMobile={isMobile} toast={toast} />
        </TabsContent>
        <TabsContent value="rm">
          <InformeRM evidencias={rmEvs} isMobile={isMobile} toast={toast} />
        </TabsContent>
        <TabsContent value="profesores">
          <InformeProfesores lector={lectorEvs} rm={rmEvs} isMobile={isMobile} toast={toast} />
        </TabsContent>
        <TabsContent value="materias">
          <InformeMaterias rm={rmEvs} isMobile={isMobile} toast={toast} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. Informe Plan Lector
// ---------------------------------------------------------------------------
function InformeLector({ evidencias, isMobile, toast }: { evidencias: EvidenciaLector[], isMobile: boolean, toast: any }) {
  const [range, setRange] = useState<"week"|"month"|"all">("month");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  
  const handleToggleGroup = (g: string) => {
    setSelectedGroups(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };
  
  const selectAll = () => setSelectedGroups([...CLASS_GROUPS]);
  const selectNone = () => setSelectedGroups([]);

  const generateReport = () => {
    const { start, end } = getTemporalFilterDates(range);
    const startTs = start.getTime();
    
    // Filter
    let filtered = evidencias.filter(e => (e.createdAt || 0) >= startTs);
    if (selectedGroups.length > 0) {
      filtered = filtered.filter(e => selectedGroups.includes(e.grupo));
    }
    
    // Create PDF
    const doc = new jsPDF();
    addPdfHeader(doc, "Informe Plan Lector", `Periodo: ${formatDateES(start)} - ${formatDateES(end)}`);
    
    // Summary
    const uniqueProfs = new Set(filtered.map(e => e.profesor)).size;
    let nextY = addPdfSummaryBox(doc, "Resumen General", [
      { label: "Total Evidencias", value: filtered.length },
      { label: "Grupos Implicados", value: new Set(filtered.map(e => e.grupo)).size },
      { label: "Profesorado", value: uniqueProfs }
    ], 44);
    
    // Table
    const rows = filtered
      .sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0))
      .map(e => [
        `S${e.semana}`,
        e.dia,
        e.grupo,
        `${e.hora}ª`,
        e.profesor,
        e.tipologia,
        e.observacion || ""
      ]);
      
    autoTable(doc, {
      head: [["Semana", "Día", "Grupo", "Hora", "Profesor", "Tipología", "Observación"]],
      body: rows,
      startY: nextY + 5,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246] }, // blue-500
      didDrawPage: () => addPdfFooter(doc)
    });
    
    safePdfDownload(doc, `informe_lector_${Date.now()}.pdf`, isMobile);
    toast({ title: "Informe generado", description: "La descarga comenzará en breve." });
  };

  return (
    <Card className="p-4 sm:p-6 border-slate-200">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4" /> Rango Temporal
            </h3>
            <Select value={range} onValueChange={(v: any) => setRange(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona rango" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mes</SelectItem>
                <SelectItem value="all">Todo el curso</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-700">Filtrar Grupos</h3>
              <div className="text-xs space-x-2">
                <button onClick={selectAll} className="text-blue-600 hover:underline">Todos</button>
                <button onClick={selectNone} className="text-slate-500 hover:underline">Ninguno</button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CLASS_GROUPS.map(g => (
                <div key={g} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`l-${g}`} 
                    checked={selectedGroups.includes(g)}
                    onCheckedChange={() => handleToggleGroup(g)}
                  />
                  <label htmlFor={`l-${g}`} className="text-sm cursor-pointer">{g}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col justify-end">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
            <h4 className="font-bold text-blue-800 text-sm mb-1">Total registrados</h4>
            <p className="text-2xl font-bold text-blue-600">{evidencias.length}</p>
          </div>
          <Button onClick={generateReport} className="w-full bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Generar Informe Plan Lector
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// 2. Informe Razonamiento Matemático
// ---------------------------------------------------------------------------
function InformeRM({ evidencias, isMobile, toast }: { evidencias: EvidenciaRM[], isMobile: boolean, toast: any }) {
  const [range, setRange] = useState<"week"|"month"|"all">("month");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  
  const handleToggleGroup = (g: string) => {
    setSelectedGroups(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };
  
  const selectAll = () => setSelectedGroups([...CLASS_GROUPS]);
  const selectNone = () => setSelectedGroups([]);

  const generateReport = () => {
    const { start, end } = getTemporalFilterDates(range);
    const startTs = start.getTime();
    
    // Filter
    let filtered = evidencias.filter(e => (e.createdAt || 0) >= startTs);
    if (selectedGroups.length > 0) {
      filtered = filtered.filter(e => selectedGroups.includes(e.grupo));
    }
    
    // Create PDF
    const doc = new jsPDF();
    addPdfHeader(doc, "Informe Razonamiento Matemático", `Periodo: ${formatDateES(start)} - ${formatDateES(end)}`);
    
    // Summary
    const uniqueProfs = new Set(filtered.map(e => e.profesor)).size;
    let nextY = addPdfSummaryBox(doc, "Resumen General", [
      { label: "Total Evidencias", value: filtered.length },
      { label: "Materias Implicadas", value: new Set(filtered.map(e => e.materia)).size },
      { label: "Profesorado", value: uniqueProfs }
    ], 44);
    
    // Table
    const rows = filtered
      .sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0))
      .map(e => [
        `S${e.semana}`,
        `Ses. ${e.sesion}`,
        e.grupo,
        e.materia,
        e.profesor,
        e.actividadRealizada,
      ]);
      
    autoTable(doc, {
      head: [["Sem.", "Ses.", "Grupo", "Materia", "Profesor", "Actividad Realizada"]],
      body: rows,
      startY: nextY + 5,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [16, 185, 129] }, // emerald-500
      didDrawPage: () => addPdfFooter(doc)
    });
    
    safePdfDownload(doc, `informe_rm_${Date.now()}.pdf`, isMobile);
    toast({ title: "Informe generado", description: "La descarga comenzará en breve." });
  };

  return (
    <Card className="p-4 sm:p-6 border-slate-200">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4" /> Rango Temporal
            </h3>
            <Select value={range} onValueChange={(v: any) => setRange(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona rango" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mes</SelectItem>
                <SelectItem value="all">Todo el curso</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-700">Filtrar Grupos</h3>
              <div className="text-xs space-x-2">
                <button onClick={selectAll} className="text-emerald-600 hover:underline">Todos</button>
                <button onClick={selectNone} className="text-slate-500 hover:underline">Ninguno</button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CLASS_GROUPS.map(g => (
                <div key={g} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`r-${g}`} 
                    checked={selectedGroups.includes(g)}
                    onCheckedChange={() => handleToggleGroup(g)}
                  />
                  <label htmlFor={`r-${g}`} className="text-sm cursor-pointer">{g}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col justify-end">
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 mb-4">
            <h4 className="font-bold text-emerald-800 text-sm mb-1">Total registrados</h4>
            <p className="text-2xl font-bold text-emerald-600">{evidencias.length}</p>
          </div>
          <Button onClick={generateReport} className="w-full bg-emerald-600 hover:bg-emerald-700">
            <Download className="w-4 h-4 mr-2" />
            Generar Informe RM
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// 3. Informe Por Profesorado
// ---------------------------------------------------------------------------
function InformeProfesores({ lector, rm, isMobile, toast }: { lector: EvidenciaLector[], rm: EvidenciaRM[], isMobile: boolean, toast: any }) {
  const [range, setRange] = useState<"week"|"month"|"all">("all");
  const [planTarget, setPlanTarget] = useState<"both"|"lector"|"rm">("both");
  
  // Extract all unique professors
  const allProfs = Array.from(new Set([
    ...lector.map(e => e.profesor),
    ...rm.map(e => e.profesor)
  ])).filter(Boolean).sort();
  
  const [selectedProfs, setSelectedProfs] = useState<string[]>([]);
  
  const handleToggleProf = (p: string) => {
    setSelectedProfs(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const generateReport = () => {
    if (selectedProfs.length === 0) {
      toast({ title: "Atención", description: "Selecciona al menos un profesor.", variant: "destructive" });
      return;
    }
    
    const { start, end } = getTemporalFilterDates(range);
    const startTs = start.getTime();
    
    const doc = new jsPDF();
    addPdfHeader(doc, "Informe de Evidencias por Profesorado", `Periodo: ${formatDateES(start)} - ${formatDateES(end)}`);
    let nextY = 44;
    
    selectedProfs.forEach((prof, pIndex) => {
      if (pIndex > 0 && nextY > 230) {
        doc.addPage();
        nextY = 20;
      } else if (pIndex > 0) {
        nextY += 15;
      }
      
      const profLector = planTarget !== "rm" ? lector.filter(e => e.profesor === prof && (e.createdAt || 0) >= startTs) : [];
      const profRM = planTarget !== "lector" ? rm.filter(e => e.profesor === prof && (e.createdAt || 0) >= startTs) : [];
      
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.text(`Docente: ${prof}`, 14, nextY);
      nextY += 8;
      
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Lector: ${profLector.length} | Total RM: ${profRM.length} | Total Global: ${profLector.length + profRM.length}`, 14, nextY);
      nextY += 10;
      
      const rows = [
        ...profLector.map(e => ["Plan Lector", `Semana ${e.semana}`, e.grupo, e.tipologia, ""]),
        ...profRM.map(e => ["RM", `Semana ${e.semana}`, e.grupo, e.materia, e.actividadRealizada])
      ].sort((a, b) => a[1].localeCompare(b[1])); // Simple sort by week
      
      if (rows.length > 0) {
        autoTable(doc, {
          head: [["Plan", "Semana", "Grupo", "Categoría/Materia", "Actividad"]],
          body: rows,
          startY: nextY,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [139, 92, 246] }, // purple-500
          didDrawPage: () => addPdfFooter(doc)
        });
        nextY = (doc as any).lastAutoTable.finalY;
      } else {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text("Sin evidencias en este periodo.", 14, nextY);
        nextY += 10;
      }
    });
    
    // Check if footer needed on first page (autoTable handles its own pages)
    if ((doc as any).internal.getNumberOfPages() === 1) addPdfFooter(doc);
    
    safePdfDownload(doc, `informe_profesores_${Date.now()}.pdf`, isMobile);
    toast({ title: "Informe generado", description: "La descarga comenzará en breve." });
  };

  return (
    <Card className="p-4 sm:p-6 border-slate-200">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3">Plan</h3>
              <Select value={planTarget} onValueChange={(v: any) => setPlanTarget(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Ambos Planes</SelectItem>
                  <SelectItem value="lector">Solo Plan Lector</SelectItem>
                  <SelectItem value="rm">Solo RM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3">Rango</h3>
              <Select value={range} onValueChange={(v: any) => setRange(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mes</SelectItem>
                  <SelectItem value="all">Todo el curso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-700">Seleccionar Profesorado ({allProfs.length})</h3>
              <div className="text-xs space-x-2">
                <button onClick={() => setSelectedProfs([...allProfs])} className="text-purple-600 hover:underline">Todos</button>
                <button onClick={() => setSelectedProfs([])} className="text-slate-500 hover:underline">Ninguno</button>
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-md p-3 bg-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allProfs.length === 0 ? (
                <p className="text-sm text-slate-500 col-span-2">No hay profesores registrados aún.</p>
              ) : (
                allProfs.map(p => (
                  <div key={p} className="flex items-center space-x-2 bg-white p-1.5 rounded border border-slate-100 shadow-sm">
                    <Checkbox 
                      id={`p-${p}`} 
                      checked={selectedProfs.includes(p)}
                      onCheckedChange={() => handleToggleProf(p)}
                    />
                    <label htmlFor={`p-${p}`} className="text-xs cursor-pointer truncate w-full" title={p}>{p}</label>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col justify-end">
          <Button onClick={generateReport} className="w-full bg-purple-600 hover:bg-purple-700" disabled={allProfs.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Generar Informe por Profesorado
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// 4. Informe Por Materias
// ---------------------------------------------------------------------------
function InformeMaterias({ rm, isMobile, toast }: { rm: EvidenciaRM[], isMobile: boolean, toast: any }) {
  const [range, setRange] = useState<"week"|"month"|"all">("all");
  const allSubjects = Object.keys(SUBJECT_COLORS).sort();
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  
  const handleToggleSub = (s: string) => {
    setSelectedSubs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const generateReport = () => {
    if (selectedSubs.length === 0) {
      toast({ title: "Atención", description: "Selecciona al menos una materia.", variant: "destructive" });
      return;
    }
    
    const { start, end } = getTemporalFilterDates(range);
    const startTs = start.getTime();
    
    const doc = new jsPDF();
    addPdfHeader(doc, "Informe de RM por Materias", `Periodo: ${formatDateES(start)} - ${formatDateES(end)}`);
    let nextY = 44;
    
    selectedSubs.forEach((sub, sIndex) => {
      if (sIndex > 0 && nextY > 230) {
        doc.addPage();
        nextY = 20;
      } else if (sIndex > 0) {
        nextY += 15;
      }
      
      const subRM = rm.filter(e => e.materia === sub && (e.createdAt || 0) >= startTs);
      
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.text(`Materia: ${sub}`, 14, nextY);
      nextY += 8;
      
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Evidencias registradas: ${subRM.length}`, 14, nextY);
      nextY += 10;
      
      const rows = subRM
        .sort((a,b) => a.semana - b.semana)
        .map(e => [
          `S${e.semana}`,
          e.grupo,
          e.profesor,
          e.actividadRealizada,
          e.observacion || ""
        ]);
      
      if (rows.length > 0) {
        autoTable(doc, {
          head: [["Semana", "Grupo", "Profesor", "Actividad", "Observación"]],
          body: rows,
          startY: nextY,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [225, 29, 72] }, // rose-600
          didDrawPage: () => addPdfFooter(doc)
        });
        nextY = (doc as any).lastAutoTable.finalY;
      } else {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text("Sin evidencias en este periodo.", 14, nextY);
        nextY += 10;
      }
    });
    
    if ((doc as any).internal.getNumberOfPages() === 1) addPdfFooter(doc);
    
    safePdfDownload(doc, `informe_materias_${Date.now()}.pdf`, isMobile);
    toast({ title: "Informe generado", description: "La descarga comenzará en breve." });
  };

  return (
    <Card className="p-4 sm:p-6 border-slate-200">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3">Rango Temporal</h3>
            <Select value={range} onValueChange={(v: any) => setRange(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mes</SelectItem>
                <SelectItem value="all">Todo el curso</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-700">Seleccionar Materias</h3>
              <div className="text-xs space-x-2">
                <button onClick={() => setSelectedSubs([...allSubjects])} className="text-rose-600 hover:underline">Todas</button>
                <button onClick={() => setSelectedSubs([])} className="text-slate-500 hover:underline">Ninguna</button>
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-md p-3 bg-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allSubjects.map(s => (
                <div key={s} className="flex items-center space-x-2 bg-white p-1.5 rounded border border-slate-100 shadow-sm">
                  <Checkbox 
                    id={`s-${s}`} 
                    checked={selectedSubs.includes(s)}
                    onCheckedChange={() => handleToggleSub(s)}
                  />
                  <label htmlFor={`s-${s}`} className="text-xs cursor-pointer truncate w-full" title={s}>{s}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col justify-end">
          <Button onClick={generateReport} className="w-full bg-rose-600 hover:bg-rose-700">
            <Download className="w-4 h-4 mr-2" />
            Generar Informe por Materias
          </Button>
        </div>
      </div>
    </Card>
  );
}
