"use client";

import { useState, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  BookOpen,
  Calculator,
  LogOut,
  Menu,
  User as UserIcon,
  ChevronLeft,
} from "lucide-react";
import { INSTITUTO } from "@/lib/constants";

export type View =
  | { name: "home" }
  | { name: "plan-lector" }
  | { name: "cronograma-lector" }
  | { name: "recursos-cl" }
  | { name: "razonamiento-matematico" }
  | { name: "curso-rm"; cursoId: string }
  | { name: "recursos-rm" };

interface AppShellProps {
  view: View;
  setView: (v: View) => void;
  children: ReactNode;
}

export default function AppShell({ view, setView, children }: AppShellProps) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (v: View) => {
    setView(v);
    setMenuOpen(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const navItems: { label: string; icon: ReactNode; view: View }[] = [
    { label: "Inicio", icon: <Home className="w-4 h-4" />, view: { name: "home" } },
    { label: "Plan Lector", icon: <BookOpen className="w-4 h-4" />, view: { name: "plan-lector" } },
    {
      label: "Razonamiento Matemático",
      icon: <Calculator className="w-4 h-4" />,
      view: { name: "razonamiento-matematico" },
    },
  ];

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Profesor/a";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/40 to-emerald-50/40">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
          {/* Left: logo + title (desktop) / burger (mobile) */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => go({ name: "home" })}
              className="flex items-center gap-2 min-w-0 hover:opacity-80 transition"
              aria-label="Ir al inicio"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-emerald-600 shadow shrink-0">
                <span className="text-white font-bold text-sm flex items-center gap-0.5">
                  ñ<span className="text-emerald-200">+</span>π
                </span>
              </div>
              <div className="hidden sm:block min-w-0">
                <p className="text-sm font-bold text-slate-800 leading-tight truncate">
                  Planes IES
                </p>
                <p className="text-[10px] text-slate-500 leading-tight truncate">
                  {INSTITUTO.nombre}
                </p>
              </div>
            </button>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active =
                (item.view.name === "home" && view.name === "home") ||
                (item.view.name === "plan-lector" &&
                  (view.name === "plan-lector" ||
                    view.name === "cronograma-lector" ||
                    view.name === "recursos-cl")) ||
                (item.view.name === "razonamiento-matematico" &&
                  (view.name === "razonamiento-matematico" ||
                    view.name === "curso-rm" ||
                    view.name === "recursos-rm"));
              return (
                <Button
                  key={item.label}
                  variant={active ? "default" : "ghost"}
                  size="sm"
                  onClick={() => go(item.view)}
                  className={
                    active
                      ? "bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
                      : ""
                  }
                >
                  {item.icon}
                  <span className="ml-1.5">{item.label}</span>
                </Button>
              );
            })}
          </nav>

          {/* Right: user + burger */}
          <div className="flex items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 px-2 sm:px-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 text-white flex items-center justify-center text-xs font-semibold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-slate-700 max-w-[120px] truncate">
                    {displayName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    <p className="text-xs leading-none text-slate-500">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="text-red-600 focus:text-red-700 focus:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile burger */}
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menú">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <SheetHeader className="px-4 pt-4 pb-3 border-b border-slate-200">
                  <SheetTitle className="text-left flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-emerald-600 shadow shrink-0">
                      <span className="text-white font-bold text-xs flex items-center gap-0.5">
                        ñ<span className="text-emerald-200">+</span>π
                      </span>
                    </div>
                    Planes IES
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 p-3">
                  {navItems.map((item) => {
                    const active =
                      (item.view.name === "home" && view.name === "home") ||
                      (item.view.name === "plan-lector" &&
                        (view.name === "plan-lector" ||
                          view.name === "cronograma-lector" ||
                          view.name === "recursos-cl")) ||
                      (item.view.name === "razonamiento-matematico" &&
                        (view.name === "razonamiento-matematico" ||
                          view.name === "curso-rm" ||
                          view.name === "recursos-rm"));
                    return (
                      <button
                        key={item.label}
                        onClick={() => go(item.view)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition ${
                          active
                            ? "bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    );
                  })}

                  <div className="my-2 border-t border-slate-200" />

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </nav>
                <div className="mt-auto p-4 border-t border-slate-200 text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">{INSTITUTO.nombre}</p>
                  <p>{INSTITUTO.localidad}</p>
                  <p className="mt-1">Curso {INSTITUTO.curso}</p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Breadcrumb (back button) */}
      {view.name !== "home" && (
        <div className="border-b border-slate-100 bg-white/50">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 flex items-center gap-1 text-xs text-slate-500">
            <button
              onClick={() => go({ name: "home" })}
              className="hover:text-slate-800 transition flex items-center gap-1"
            >
              <Home className="w-3 h-3" />
              Inicio
            </button>
            <span className="text-slate-400">/</span>
            {(view.name === "cronograma-lector" || view.name === "recursos-cl") && (
              <>
                <button
                  onClick={() => go({ name: "plan-lector" })}
                  className="hover:text-slate-800 transition"
                >
                  Plan Lector
                </button>
                <span className="text-slate-400">/</span>
                <span className="text-slate-700 font-medium">
                  {view.name === "cronograma-lector" ? "Cronograma" : "Recursos"}
                </span>
              </>
            )}
            {(view.name === "curso-rm" || view.name === "recursos-rm") && (
              <>
                <button
                  onClick={() => go({ name: "razonamiento-matematico" })}
                  className="hover:text-slate-800 transition"
                >
                  Razonamiento Matemático
                </button>
                <span className="text-slate-400">/</span>
                <span className="text-slate-700 font-medium">
                  {view.name === "curso-rm"
                    ? RM_CURSO_NOMBRE(view.cursoId)
                    : "Recursos"}
                </span>
              </>
            )}
            {view.name === "plan-lector" && (
              <span className="text-slate-700 font-medium">Plan Lector</span>
            )}
            {view.name === "razonamiento-matematico" && (
              <span className="text-slate-700 font-medium">Razonamiento Matemático</span>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">{children}</main>

      {/* Footer */}
      <footer className="mt-auto bg-white/70 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 text-center text-xs text-slate-500">
          <p className="font-semibold text-slate-700">{INSTITUTO.nombre}</p>
          <p className="mt-0.5">
            {INSTITUTO.localidad} · Curso {INSTITUTO.curso} · Planes Lector y de Razonamiento
            Matemático
          </p>
        </div>
      </footer>
    </div>
  );
}

function RM_CURSO_NOMBRE(id: string): string {
  // se redefine abajo en el módulo de constantes; aquí un fallback local
  const map: Record<string, string> = {
    "1eso": "1º ESO",
    "2eso": "2º ESO",
    "3eso": "3º ESO",
    "3diver": "3º Diversificación",
    "4cien": "4º Ciencias",
    "4soci": "4º Sociales",
    "4cicl": "4º Ciclos",
    "4diver": "4º Diversificación",
  };
  return map[id] ?? id;
}
