"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Plus, Pencil, Trash2, CheckCircle2, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  CursoConfig, 
  TrimestreConfig, 
  subscribeCursos, 
  addCursoConfig, 
  updateCursoConfig, 
  deleteCursoConfig, 
  setActiveCurso 
} from "@/lib/adminFirestore";
import { formatDateES } from "@/lib/constants";

export default function AdminCursos() {
  const [cursos, setCursos] = useState<CursoConfig[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCurso, setEditingCurso] = useState<CursoConfig | null>(null);
  
  // Form state
  const [nombre, setNombre] = useState("");
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [trimestres, setTrimestres] = useState<TrimestreConfig[]>([
    { nombre: "Primera Evaluación", inicio: "", fin: "" },
    { nombre: "Segunda Evaluación", inicio: "", fin: "" },
    { nombre: "Tercera Evaluación", inicio: "", fin: "" }
  ]);

  useEffect(() => {
    const unsub = subscribeCursos((data) => {
      setCursos(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const resetForm = () => {
    setNombre("");
    setInicio("");
    setFin("");
    setTrimestres([
      { nombre: "Primera Evaluación", inicio: "", fin: "" },
      { nombre: "Segunda Evaluación", inicio: "", fin: "" },
      { nombre: "Tercera Evaluación", inicio: "", fin: "" }
    ]);
    setEditingCurso(null);
  };

  const openNewDialog = () => {
    resetForm();
    // Default dates for next year
    const currentYear = new Date().getFullYear();
    setNombre(`${currentYear}-${currentYear + 1}`);
    setInicio(`${currentYear}-09-15`);
    setFin(`${currentYear + 1}-06-30`);
    setDialogOpen(true);
  };

  const openEditDialog = (curso: CursoConfig) => {
    setNombre(curso.nombre);
    setInicio(curso.inicio);
    setFin(curso.fin);
    // Ensure we have exactly 3 trimestres to edit
    const existing = curso.trimestres || [];
    const t = [
      existing[0] || { nombre: "Primera Evaluación", inicio: "", fin: "" },
      existing[1] || { nombre: "Segunda Evaluación", inicio: "", fin: "" },
      existing[2] || { nombre: "Tercera Evaluación", inicio: "", fin: "" }
    ];
    setTrimestres(t);
    setEditingCurso(curso);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!nombre || !inicio || !fin) {
      alert("Por favor, completa los datos básicos del curso.");
      return;
    }

    try {
      if (editingCurso?.id) {
        await updateCursoConfig(editingCurso.id, {
          nombre,
          inicio,
          fin,
          trimestres
        });
      } else {
        const isFirst = cursos.length === 0;
        await addCursoConfig({
          nombre,
          inicio,
          fin,
          activo: isFirst,
          trimestres
        });
      }
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error al guardar la configuración.");
    }
  };

  const handleDelete = async (id: string, activo: boolean) => {
    if (activo) {
      alert("No puedes eliminar el curso activo. Marca otro como activo primero.");
      return;
    }
    if (confirm("¿Seguro que deseas eliminar este curso? Esta acción no se puede deshacer.")) {
      try {
        await deleteCursoConfig(id);
      } catch (err) {
        console.error(err);
        alert("Error al eliminar.");
      }
    }
  };

  const handleSetActivo = async (id: string) => {
    if (confirm("¿Establecer como curso activo? Esto afectará a toda la aplicación.")) {
      try {
        await setActiveCurso(id, cursos);
      } catch (err) {
        console.error(err);
        alert("Error al actualizar.");
      }
    }
  };

  const updateTrimestre = (index: number, field: "inicio" | "fin", value: string) => {
    const newT = [...trimestres];
    newT[index] = { ...newT[index], [field]: value };
    setTrimestres(newT);
  };

  if (loading) {
    return <div className="text-center py-10">Cargando configuración...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-teal-600" />
            Configuración de Cursos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestiona los cursos académicos y los periodos de evaluación.
          </p>
        </div>
        <Button onClick={openNewDialog} className="bg-teal-600 hover:bg-teal-700 text-white">
          <Plus className="w-4 h-4 mr-1.5" />
          Nuevo Curso
        </Button>
      </div>

      <div className="grid gap-4">
        {cursos.length === 0 ? (
          <Card className="p-8 text-center bg-slate-50 border-dashed">
            <p className="text-slate-500 mb-4">No hay cursos configurados.</p>
            <Button onClick={openNewDialog} variant="outline">Crear el primer curso</Button>
          </Card>
        ) : (
          cursos.map((c) => (
            <Card key={c.id} className={`p-4 sm:p-6 overflow-hidden relative ${c.activo ? 'border-teal-500 shadow-md ring-1 ring-teal-500' : 'border-slate-200'}`}>
              {c.activo && (
                <div className="absolute top-0 right-0 bg-teal-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                  Curso Activo
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{c.nombre}</h3>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {c.inicio && c.fin ? `${formatDateES(new Date(c.inicio))} - ${formatDateES(new Date(c.fin))}` : 'Fechas sin definir'}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {!c.activo && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => c.id && handleSetActivo(c.id)}
                      className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 border-teal-200"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Hacer activo
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(c)}>
                    <Pencil className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  {!c.activo && (
                    <Button variant="destructive" size="sm" onClick={() => c.id && handleDelete(c.id, c.activo)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              {c.trimestres && c.trimestres.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {c.trimestres.map((t, idx) => (
                    <div key={idx} className="bg-slate-50 rounded p-3 text-xs">
                      <p className="font-bold text-slate-700">{t.nombre}</p>
                      <p className="text-slate-500 mt-1">
                        {t.inicio ? formatDateES(new Date(t.inicio)) : 'Sin inicio'} → {t.fin ? formatDateES(new Date(t.fin)) : 'Sin fin'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCurso ? `Editar Curso ${editingCurso.nombre}` : 'Nuevo Curso Académico'}
            </DialogTitle>
            <DialogDescription>
              Define las fechas globales del curso y los periodos de las evaluaciones.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="space-y-1.5">
                <Label htmlFor="nombre">Nombre (ej. 2025-2026) *</Label>
                <Input id="nombre" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="2025-2026" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inicio">Fecha de Inicio *</Label>
                <Input id="inicio" type="date" value={inicio} onChange={e => setInicio(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fin">Fecha de Fin *</Label>
                <Input id="fin" type="date" value={fin} onChange={e => setFin(e.target.value)} />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-slate-700 border-b pb-2">Trimestres / Evaluaciones</h4>
              {trimestres.map((t, idx) => (
                <div key={idx} className="grid sm:grid-cols-[1fr_1fr_1fr] gap-4 items-center bg-white p-3 rounded-md border border-slate-200 shadow-sm">
                  <p className="font-medium text-sm text-slate-800">{t.nombre}</p>
                  <div className="space-y-1">
                    <Label className="text-xs">Inicio</Label>
                    <Input type="date" className="h-8 text-xs" value={t.inicio} onChange={e => updateTrimestre(idx, 'inicio', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Fin</Label>
                    <Input type="date" className="h-8 text-xs" value={t.fin} onChange={e => updateTrimestre(idx, 'fin', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700 text-white">Guardar Curso</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
