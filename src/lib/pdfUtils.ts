import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDateES } from "./constants";

/**
 * Descarga segura de un PDF tanto para PC como para móviles.
 * En PC descarga directamente, en móvil genera un blobURL y abre en pestaña nueva.
 */
export function safePdfDownload(doc: jsPDF, filename: string, isMobile: boolean) {
  if (isMobile) {
    try {
      const blob = doc.output("blob");
      const blobUrl = URL.createObjectURL(blob);
      const newWindow = window.open(blobUrl, "_blank");
      if (!newWindow) {
        // Fallback si el popup es bloqueado
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        a.click();
      }
    } catch (e) {
      console.error("Error al abrir PDF en móvil:", e);
      // Fallback a descarga estándar
      doc.save(filename);
    }
  } else {
    doc.save(filename);
  }
}

/**
 * Añade una cabecera premium a la página actual del PDF
 */
export function addPdfHeader(doc: jsPDF, title: string, subtitle?: string) {
  // Decoración lateral: línea gradiente (simulada con rectángulos azul/esmeralda)
  doc.setFillColor(79, 70, 229); // Indigo
  doc.rect(14, 15, 4, 15, "F");
  doc.setFillColor(16, 185, 129); // Esmeralda
  doc.rect(18, 15, 2, 15, "F");

  // Título
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.setFont("helvetica", "bold");
  doc.text(title, 24, 21);

  // Subtítulo
  if (subtitle) {
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.setFont("helvetica", "normal");
    doc.text(subtitle, 24, 27);
  }

  // Línea divisoria
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.5);
  doc.line(14, 34, 196, 34);
}

/**
 * Añade pie de página con número de página y marca de tiempo
 */
export function addPdfFooter(doc: jsPDF) {
  const pageCount = (doc as any).internal.getNumberOfPages();
  const dateStr = formatDateES(new Date());

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.setFont("helvetica", "normal");
    
    // Texto pie
    const footerText = `Generado el ${dateStr} · IES Virgen de Villadiego`;
    doc.text(footerText, 14, 287);
    
    // Paginación a la derecha
    const pageText = `Página ${i} de ${pageCount}`;
    doc.text(pageText, 196 - doc.getTextWidth(pageText), 287);
  }
}

/**
 * Añade una caja resumen estilizada
 */
export function addPdfSummaryBox(
  doc: jsPDF, 
  title: string, 
  stats: { label: string; value: string | number }[], 
  startY: number
): number {
  const boxWidth = 182;
  const boxHeight = 22;
  
  // Dibujar fondo
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(241, 245, 249); // Slate-100
  doc.roundedRect(14, startY, boxWidth, boxHeight, 2, 2, "FD");
  
  // Título caja
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.text(title.toUpperCase(), 18, startY + 5);
  
  // Renders stats
  doc.setFont("helvetica", "normal");
  const statWidth = boxWidth / stats.length;
  stats.forEach((stat, index) => {
    const startX = 14 + (index * statWidth);
    
    // Etiqueta
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(stat.label, startX + 6, startY + 12);
    
    // Valor
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text(stat.value.toString(), startX + 6, startY + 18);
  });
  
  return startY + boxHeight + 8;
}

/**
 * Determina el rango de fechas para los filtros temporales
 */
export function getTemporalFilterDates(rangeType: "week" | "month" | "all"): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date();
  const start = new Date();

  if (rangeType === "week") {
    // 7 días atrás
    start.setDate(now.getDate() - 7);
  } else if (rangeType === "month") {
    // 30 días atrás
    start.setDate(now.getDate() - 30);
  } else {
    // Rango muy amplio por defecto (el curso completo)
    start.setFullYear(now.getFullYear() - 1);
  }
  
  return { start, end };
}
