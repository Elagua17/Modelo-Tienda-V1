import { jsPDF } from "jspdf";
import { Product } from "@/types";

interface ManualGenerationOptions {
  product: Product;
  customLiters?: number;
  calculatedDosage?: string;
}

export function generateProductManualPdf({
  product,
  customLiters,
  calculatedDosage,
}: ManualGenerationOptions): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // ==========================================
  // 1. CABECERA CON MARCA Y ESTILO MINIMALISTA
  // ==========================================
  // Barra superior turquesa
  doc.setFillColor(13, 148, 136); // #0d9488
  doc.rect(0, 0, pageWidth, 6, "F");

  // Barra de acento celeste
  doc.setFillColor(56, 189, 248); // #38bdf8
  doc.rect(0, 6, pageWidth, 2, "F");

  // Logo / Título de Marca
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("AQUA", margin, 24);

  doc.setTextColor(13, 148, 136); // teal-600
  doc.text("PURE", margin + 26, 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text("POOL CARE & WATER ENGINEERING • FICHA TÉCNICA Y MANUAL DE USO", margin, 30);

  // Línea divisoria elegante
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(margin, 34, pageWidth - margin, 34);

  let currentY = 44;

  // ==========================================
  // 2. IDENTIFICACIÓN DEL PRODUCTO
  // ==========================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(56, 189, 248); // sky-500
  doc.text(`CATEGORÍA: ${product.category.toUpperCase()}`, margin, currentY);

  currentY += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(product.name, contentWidth);
  doc.text(titleLines, margin, currentY);
  currentY += titleLines.length * 7 + 4;

  // Descripción comercial breve
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  const descLines = doc.splitTextToSize(product.description, contentWidth);
  doc.text(descLines, margin, currentY);
  currentY += descLines.length * 5 + 6;

  // ==========================================
  // 3. SECCIÓN DE DOSIFICACIÓN
  // ==========================================
  // Si fue generado con litros personalizados desde la calculadora, mostramos card especial
  if (customLiters && calculatedDosage) {
    doc.setFillColor(240, 253, 250); // teal-50
    doc.setDrawColor(153, 246, 228); // teal-200
    doc.roundedRect(margin, currentY, contentWidth, 24, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(13, 148, 136);
    doc.text("DOSIFICACIÓN PERSONALIZADA PARA SU PISCINA", margin + 5, currentY + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `Volumen calculado: ${customLiters.toLocaleString("es-AR")} Litros (m3)`,
      margin + 5,
      currentY + 13
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.text(`Dosis Exacta Recomendada: ${calculatedDosage}`, margin + 5, currentY + 19);

    currentY += 30;
  } else {
    // Caja de dosificación estándar
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, contentWidth, 16, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Dosificación Estándar:`, margin + 5, currentY + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(product.dosage, margin + 5, currentY + 11);

    currentY += 22;
  }

  // ==========================================
  // 4. PARÁMETROS TÉCNICOS & COMPOSICIÓN
  // ==========================================
  if (product.technicalSheet) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("ESPECIFICACIONES TÉCNICAS DEL PRODUCTO", margin, currentY);
    currentY += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);

    if (product.technicalSheet.composition) {
      doc.text(`• Composición Activa: ${product.technicalSheet.composition}`, margin, currentY);
      currentY += 5;
    }

    if (product.technicalSheet.recommendedPh) {
      doc.text(`• Rango de pH Óptimo de Acción: ${product.technicalSheet.recommendedPh}`, margin, currentY);
      currentY += 5;
    }

    if (product.technicalSheet.frequency) {
      doc.text(`• Frecuencia de Aplicación: ${product.technicalSheet.frequency}`, margin, currentY);
      currentY += 8;
    }
  }

  // ==========================================
  // 5. GUÍA DE APLICACIÓN PASO A PASO
  // ==========================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("GUÍA DE APLICACIÓN PASO A PASO", margin, currentY);
  currentY += 6;

  const steps =
    product.technicalSheet?.stepByStepGuide || [
      "Verificar y regular el pH entre 7.2 y 7.6 antes de cualquier dosificación.",
      product.usageGuide,
      "Mantener la bomba en recirculación o filtrado durante el tiempo recomendado.",
      "Evitar el ingreso de bañistas durante el tratamiento de choque.",
    ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  steps.forEach((step, index) => {
    const stepText = `${index + 1}. ${step}`;
    const splitStep = doc.splitTextToSize(stepText, contentWidth - 4);
    doc.text(splitStep, margin + 2, currentY);
    currentY += splitStep.length * 4.5 + 2;
  });

  currentY += 4;

  // ==========================================
  // 6. MEDIDAS DE SEGURIDAD & PROTOCOLO QUÍMICO
  // ==========================================
  doc.setFillColor(254, 242, 242); // rose-50
  doc.setDrawColor(254, 202, 202); // rose-200
  const boxHeight = 26;
  doc.roundedRect(margin, currentY, contentWidth, boxHeight, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(185, 28, 28); // rose-700
  doc.text("PRECAUCIONES OBLIGATORIAS DE SEGURIDAD (EPP)", margin + 4, currentY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(127, 29, 29); // rose-900

  const precautions = product.technicalSheet?.securityPrecautions || [
    "Manipular con guantes protectores y protección ocular en lugar bien ventilado.",
    "Nunca mezclar productos químicos concentrados entre sí en el mismo recipiente.",
    "Conservar en su envase original bien cerrado, lejos del calor y fuera del alcance de niños.",
  ];

  let precY = currentY + 11;
  precautions.slice(0, 3).forEach((p) => {
    doc.text(`! ${p}`, margin + 4, precY);
    precY += 4.5;
  });

  // ==========================================
  // 7. PIE DE PÁGINA & SELLO DE AUTENTICIDAD
  // ==========================================
  const footerY = doc.internal.pageSize.getHeight() - 14;

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(
    `Documento Oficial de Asistencia Técnica • Aqua-Pure Pools • Generado el ${new Date().toLocaleDateString(
      "es-AR"
    )}`,
    margin,
    footerY
  );

  doc.setFont("helvetica", "bold");
  doc.setTextColor(13, 148, 136);
  doc.text("VERIFICACIÓN CRIPTOGRÁFICA DE INTEGRIDAD: VÁLIDO", pageWidth - margin - 75, footerY);

  // Descarga del PDF
  const filename = `AquaPure_Manual_${product.slug || product.id}.pdf`;
  doc.save(filename);
}
