# Planes IES — PWA para Gestión de Plan Lector y Razonamiento Matemático

Aplicación web progresiva (PWA) para la gestión de las lecturas y actividades de razonamiento matemático realizadas por el profesorado del **IES Virgen de Villadiego** (Peñaflor, Sevilla), curso 2025-2026.

Inspirada en la aplicación original https://angelmicelti.github.io/PlanesIES/, sustituye el registro en hojas de cálculo de Google por **Firebase Firestore**, permitiendo una gestión dinámica y centralizada de la información en tiempo real.

## 🚀 Características principales

### Autenticación segura (Firebase Auth)
- Acceso restringido al profesorado mediante correo electrónico y contraseña.
- Pantallas de inicio de sesión y registro con validación y mensajes en español.
- Cada evidencia queda asociada al profesor que la registra (`createdBy`).

### Plan Lector (Competencia Lingüística)
- Cronograma interactivo de **36 semanas** distribuidas en 3 evaluaciones (14 + 11 + 11).
- Rotación horaria cada 6 semanas (1ª, 2ª, 3ª, 4ª, 5ª, 6ª hora).
- Sesiones de lunes a viernes con menú contextual de los 11 grupos del centro.
- Formulario de evidencia: nombre del profesor, tipología textual (6 tipos) y tipo de texto asociado, observación opcional.
- Edición y eliminación de evidencias en tiempo real.

### Razonamiento Matemático
- 8 cursos: 1º ESO, 2º ESO, 3º ESO, 3º Diversificación, 4º Ciencias, 4º Sociales, 4º Ciclos y 4º Diversificación.
- Cronograma por curso con 3 sesiones semanales y materias rotativas:
  - Sesión 1: Matemáticas.
  - Sesión 2: rotación 4:3:2 entre Matemáticas, Biología y Geología, Computación y Robótica.
  - Sesión 3: materias de los ámbitos SL/AR (Lengua, Inglés, Francés, Geografía e Historia, Música, EPVA, Ed. Física, Religión).
- Cada sesión muestra materia, actividad sugerida y código de criterio de evaluación (MA.C.E.x.x, BQ.C.E.x.x, etc.).
- Botones de registro por grupo (1ºA, 1ºB, etc.) con indicador visual de evidencia registrada.
- Filtros por asignatura y por ámbito (CT / SL / AR).
- Generación de **informes PDF** con jsPDF + AutoTable: por materia y evaluación, o por trimestre.
- Gráfico de distribución (donut SVG) de evidencias por materia.

### Recursos
- Plan Lector: enlace al Plan de Centro, guía oficial de la Junta de Andalucía, hoja de feedback entre compañer@s.
- Razonamiento Matemático: actividades del IES Ben Gabirol, teoría del IES, plantilla de resolución de problemas, normativa y feedback.

### PWA y diseño responsive
- Instalable como app nativa (manifest, iconos 192/512, theme-color).
- Funcionamiento offline mediante service worker (cache-first para estáticos, network-first para HTML).
- Diseño mobile-first con Tailwind CSS 4 y shadcn/ui.
- Componentes adaptativos (Sheet en móvil, Dialog en escritorio).
- Metadatos iOS (apple-mobile-web-app-capable, safe-area-insets).

## 🛠️ Stack tecnológico

- **Framework**: Next.js 16 (App Router) + TypeScript 5
- **Estilos**: Tailwind CSS 4 + shadcn/ui (New York)
- **Backend**: Firebase Authentication + Cloud Firestore
- **PDF**: jsPDF + jspdf-autotable
- **Iconos**: lucide-react
- **PWA**: manifest.json + service worker propio

## 📦 Estructura del proyecto

```
src/
├── app/
│   ├── layout.tsx           # Layout raíz con metadatos PWA
│   ├── page.tsx             # Página única con navegación por estado
│   └── globals.css
├── contexts/
│   └── AuthContext.tsx      # Provider de Firebase Auth
├── lib/
│   ├── firebase.ts          # Inicialización Firebase
│   ├── firestore.ts         # CRUD de evidencias (lector + RM)
│   ├── constants.ts         # Grupos, evaluaciones, materias, actividades, enlaces
│   └── types.ts             # Tipos EvidenciaLector, EvidenciaRM, Usuario
└── components/
    ├── AppShell.tsx         # Layout con navbar, breadcrumb, footer
    ├── Login.tsx            # Pantalla de login/registro
    ├── Home.tsx             # Selector de planes + normativa
    ├── plan-lector/
    │   ├── PlanLectorHome.tsx
    │   ├── CronogramaLector.tsx    # Cronograma interactivo
    │   └── RecursosCL.tsx
    └── rm/
        ├── RazonamientoMatematicoHome.tsx
        ├── CursoRM.tsx             # Cronograma, filtros, informes PDF, gráfico
        └── RecursosRM.tsx
public/
├── manifest.json
├── sw.js
├── icon-192.png, icon-512.png, apple-touch-icon.png, favicon.ico
```

## 🔧 Instalación local

### Requisitos previos
- Node.js 20+ o Bun
- Un proyecto de Firebase configurado (ver más abajo)

### Pasos

1. **Clona el repositorio:**

   ```bash
   git clone https://github.com/<tu-usuario>/<tu-repo>.git
   cd <tu-repo>
   ```

2. **Instala las dependencias:**

   ```bash
   # Con npm
   npm install

   # O con bun (más rápido)
   bun install
   ```

3. **Configura las variables de entorno:**

   Copia `.env.example` a `.env.local` y rellena con tus credenciales de Firebase:

   ```bash
   cp .env.example .env.local
   ```

   Las claves de Firebase también están directamente en `src/lib/firebase.ts`. Puedes mantenerlas ahí o migrarlas a variables de entorno si lo prefieres.

4. **Ejecuta el servidor de desarrollo:**

   ```bash
   npm run dev
   # o
   bun run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

5. **Genera la build de producción:**

   ```bash
   npm run build
   npm start
   ```

## 🔥 Configuración de Firebase

Antes del primer uso, debes configurar tu proyecto de Firebase (`iesvdv-96a18`):

### 1. Habilitar Authentication
1. Ve a **Firebase Console** → tu proyecto → **Authentication** → **Sign-in method**.
2. Habilita el proveedor **Email/Password**.
3. En **Settings → Authorized domains**, añade el dominio donde desplegarás la app (p. ej. `tu-usuario.github.io` si usas GitHub Pages, o tu dominio personalizado).

### 2. Crear Firestore Database
1. Ve a **Firestore Database** → **Create database**.
2. Selecciona **Production mode** (recomendado) o **Test mode** para empezar.
3. Elige la región más cercana (eur3 para Europa).

### 3. Configurar reglas de seguridad




### 4. Colecciones creadas automáticamente

La aplicación crea y usa dos colecciones en Firestore:

- **`evidencias_lector`**: registros del Plan Lector.
  Campos: `plan`, `grupo`, `fecha`, `semana`, `dia`, `hora`, `profesor`, `tipologia`, `tipoTexto`, `observacion`, `createdAt`, `updatedAt`, `createdBy`.

- **`evidencias_rm`**: registros de Razonamiento Matemático.
  Campos: `plan`, `cursoId`, `grupo`, `semana`, `sesion`, `materia`, `actividad`, `codigo`, `profesor`, `actividadRealizada`, `observacion`, `createdAt`, `updatedAt`, `createdBy`.

## 🌐 Despliegue

### Opción A: Vercel (recomendado, optimizado para Next.js)

1. Sube el repositorio a GitHub.
2. Ve a [vercel.com](https://vercel.com) → **New Project** → importa el repo.
3. Vercel detecta automáticamente Next.js; no necesitas configurar nada más.
4. Añade el dominio de Vercel a **Firebase → Authorized domains**.

### Opción B: Cualquier hosting estático / Node.js

La build de Next.js genera una standalone app en `.next/standalone/`. Para servidores Node.js:

```bash
npm run build
node .next/standalone/server.js
```

### Opción C: GitHub Pages (estático)

Esta app usa Next.js App Router con componentes cliente; para GitHub Pages conviene usar `next export` o configurar `output: 'export'` en `next.config.ts`. Ten en cuenta que el service worker y la PWA funcionan mejor en hosting con HTTPS.

## 📱 Instalación como PWA

1. Abre la app en tu móvil (Chrome/Edge en Android, Safari en iOS).
2. **Android**: menú ⋮ → **Instalar aplicación** / **Añadir a pantalla de inicio**.
3. **iOS**: botón Compartir → **Añadir a pantalla de inicio**.

La app quedará instalada como una aplicación nativa, con su icono ñ+π y funcionamiento offline.

## 👥 Uso para el profesorado

1. **Registro inicial**: el primer día, cada profesor crea su cuenta con su correo y una contraseña.
2. **Inicio de sesión**: a partir de entonces, inicia sesión con esas credenciales.
3. **Plan Lector**: pulsa en la celda del día y grupo correspondiente → rellena nombre, tipología y tipo de texto → guarda.
4. **Razonamiento Matemático**: entra en tu curso → busca la semana y sesión → pulsa el botón de tu grupo → rellena nombre y actividad realizada → guarda.
5. **Edición / borrado**: en cualquier momento, vuelve a pulsar sobre una evidencia registrada para editarla o eliminarla.

## 📞 Soporte

Si algo no funciona correctamente, comunícalo al Equipo Directivo del IES Virgen de Villadiego.

---

**IES Virgen de Villadiego** · Peñaflor (Sevilla) · Curso 2025-2026
