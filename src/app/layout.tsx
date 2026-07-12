import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Planes IES — Lector y Razonamiento Matemático",
  description:
    "Aplicación PWA para la gestión de lecturas y actividades de razonamiento matemático del profesorado del IES Virgen de Villadiego (Peñaflor, Sevilla).",
  keywords: [
    "IES",
    "Plan Lector",
    "Razonamiento Matemático",
    "Andalucía",
    "Educación Secundaria",
    "Firebase",
  ],
  authors: [{ name: "IES Virgen de Villadiego" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Planes IES",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "Planes IES — Lector y Razonamiento Matemático",
    description:
      "Gestión de lecturas y actividades de razonamiento matemático del IES Virgen de Villadiego.",
    type: "website",
    locale: "es_ES",
  },
};

export const viewport: Viewport = {
  themeColor: "#3f51b5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Planes IES" />
      </head>
      <body
        className={`${inter.variable} antialiased bg-background text-foreground overscroll-y-none`}
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
