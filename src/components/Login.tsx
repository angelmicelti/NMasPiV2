"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Calculator, GraduationCap, Loader2 } from "lucide-react";
import { INSTITUTO } from "@/lib/constants";

export default function Login() {
  const { login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      const map: Record<string, string> = {
        "auth/invalid-email": "El correo electrónico no es válido.",
        "auth/user-not-found": "No existe ningún usuario con ese correo.",
        "auth/wrong-password": "Contraseña incorrecta.",
        "auth/invalid-credential": "Correo o contraseña incorrectos.",
        "auth/too-many-requests": "Demasiados intentos. Inténtalo más tarde.",
        "auth/network-request-failed": "Sin conexión. Revisa tu red.",
        "auth/configuration-not-found":
          "Firebase Authentication no está configurado todavía. Habilita el proveedor Email/Password en la consola de Firebase.",
        "auth/api-key-not-valid":
          "La API key de Firebase no es válida. Revisa la configuración.",
      };
      setError(map[code] ?? `Error al iniciar sesión (${code}). Inténtalo de nuevo.`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (nombre.trim().length < 3) {
      setError("Indica tu nombre completo.");
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password, nombre.trim());
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      const map: Record<string, string> = {
        "auth/email-already-in-use": "Ya existe una cuenta con ese correo.",
        "auth/invalid-email": "El correo electrónico no es válido.",
        "auth/weak-password": "La contraseña es demasiado débil.",
        "auth/network-request-failed": "Sin conexión. Revisa tu red.",
        "auth/configuration-not-found":
          "Firebase Authentication no está configurado todavía. Habilita el proveedor Email/Password en la consola de Firebase.",
        "auth/api-key-not-valid":
          "La API key de Firebase no es válida. Revisa la configuración.",
      };
      setError(map[code] ?? `Error al registrar (${code}). Inténtalo de nuevo.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Cabecera institucional */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-600 shadow-lg mb-4">
            <div className="flex items-center gap-0.5 text-white font-bold text-2xl">
              <span>ñ</span>
              <span className="text-emerald-200">+</span>
              <span>π</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">
            Planes Lector y de Razonamiento Matemático
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {INSTITUTO.nombre} — {INSTITUTO.localidad}
          </p>
          <p className="text-xs text-slate-500">Curso {INSTITUTO.curso}</p>
        </div>

        <Card className="shadow-xl border-slate-200">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              Acceso al profesorado
            </CardTitle>
            <CardDescription>
              Inicia sesión con tu cuenta de docente o crea una nueva.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-3 mt-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email">Correo electrónico</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="profesor@iesvdv.es"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="login-pass">Contraseña</Label>
                    <Input
                      id="login-pass"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="h-11"
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                      {error}
                    </p>
                  )}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <BookOpen className="w-4 h-4 mr-2" />
                    )}
                    Entrar
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-3 mt-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-nombre">Nombre y apellidos</Label>
                    <Input
                      id="reg-nombre"
                      type="text"
                      placeholder="María García Pérez"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-email">Correo electrónico</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="profesor@iesvdv.es"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-pass">Contraseña (mín. 6 caracteres)</Label>
                    <Input
                      id="reg-pass"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="h-11"
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                      {error}
                    </p>
                  )}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Calculator className="w-4 h-4 mr-2" />
                    )}
                    Crear cuenta
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <p className="text-xs text-slate-500 text-center mt-4 px-2">
              Solo el profesorado del centro puede registrarse. Las evidencias se asocian a tu cuenta.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
