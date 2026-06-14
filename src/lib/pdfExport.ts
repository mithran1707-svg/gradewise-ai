// PDF export helpers for GradeWise AI
// Uses jsPDF + jspdf-autotable for clean tabular output

import type { AppData } from "./types";
import type { FinalCalcOutput } from "./calculations";
import { gradeColor } from "./calculations";

interface GpaEntry {
  credits: number;
  gradePoint: number;
  subject: AppData["subjects"][0];
  result: FinalCalcOutput;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};

export async function exportSemesterPDF(
  data: AppData,
  gpaEntries: GpaEntry[],
  currentGPA: number,
  predictedCGPA: number
) {
  // Dynamic import so jsPDF only loads when needed (keeps initial bundle slim)
  const jsPDFModule = await import("jspdf");
  const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
  const autoTableModule = await import("jspdf-autotable");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autoTable = (autoTableModule as any).default ?? autoTableModule.autoTable;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const profile = data.profile;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;

  // ——— Header ———
  doc.setFillColor(11, 18, 32);
  doc.rect(0, 0, pageWidth, 32, "F");

  doc.setTextColor(250, 247, 240);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("GradeWise AI", margin, 14);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Academic Report", margin, 21);

  doc.setTextColor(212, 162, 78);
  doc.setFontSize(8);
  doc.text(`Generated ${new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}`, pageWidth - margin, 14, { align: "right" });

  // ——— Student info ———
  doc.setTextColor(11, 18, 32);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(profile?.fullName ?? "Guest", margin, 44);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(90, 99, 117);
  doc.text(`Register No: ${profile?.registerNumber ?? "—"}`, margin, 50);
  doc.text(`Email: ${profile?.email || "—"}`, margin, 55.5);

  // KPI pills
  const kpis = [
    { label: "GPA", value: currentGPA.toFixed(2) },
    { label: "CGPA", value: predictedCGPA.toFixed(2) },
    { label: "Subjects", value: String(data.subjects.length) },
    { label: "Credits", value: String(gpaEntries.reduce((a, b) => a + b.credits, 0)) },
  ];

  let kpiX = margin;
  const kpiY = 64;
  kpis.forEach((k) => {
    const w = 36;
    doc.setFillColor(245, 241, 232);
    doc.roundedRect(kpiX, kpiY, w, 14, 3, 3, "F");
    doc.setTextColor(11, 18, 32);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(k.value, kpiX + w / 2, kpiY + 7, { align: "center" });
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(90, 99, 117);
    doc.text(k.label, kpiX + w / 2, kpiY + 11.5, { align: "center" });
    kpiX += w + 4;
  });

  // ——— Subject table ———
  const rows = gpaEntries.map(({ subject: s, result: r }) => [
    s.name,
    s.type,
    `${r.internal.toFixed(1)} / ${r.internalMax}`,
    r.finalMark.toFixed(1),
    r.grade,
    String(r.gradePoint),
    String(s.credits),
    r.passed ? "Pass" : "At risk",
  ]);

  autoTable(doc, {
    startY: kpiY + 22,
    head: [["Subject", "Type", "Internal", "Final", "Grade", "GP", "Credits", "Status"]],
    body: rows,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8.5,
      cellPadding: 3.5,
      font: "helvetica",
      textColor: [11, 18, 32],
    },
    headStyles: {
      fillColor: [11, 18, 32],
      textColor: [250, 247, 240],
      fontSize: 7.5,
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 44 },
      1: { cellWidth: 18, halign: "center" },
      2: { cellWidth: 22, halign: "right" },
      3: { cellWidth: 16, halign: "right", fontStyle: "bold" },
      4: { cellWidth: 14, halign: "center", fontStyle: "bold" },
      5: { cellWidth: 12, halign: "center" },
      6: { cellWidth: 16, halign: "center" },
      7: { cellWidth: 18, halign: "center" },
    },
    didParseCell: (data: { section: string; column: { index: number }; cell: { styles: { textColor: [number, number, number] } }; row: { raw: string[] } }) => {
      if (data.section === "body" && data.column.index === 4) {
        const grade = data.row.raw[4] as string;
        data.cell.styles.textColor = hexToRgb(gradeColor(grade as Parameters<typeof gradeColor>[0]));
      }
      if (data.section === "body" && data.column.index === 7) {
        const status = data.row.raw[7];
        data.cell.styles.textColor = status === "Pass" ? [63, 167, 150] : [193, 85, 77];
      }
    },
    alternateRowStyles: { fillColor: [248, 245, 238] },
  });

  // ——— Semester history ———
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY: number = (doc as any).lastAutoTable.finalY + 10;

  if (data.semesterHistory.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(11, 18, 32);
    doc.text("Semester History", margin, finalY);

    autoTable(doc, {
      startY: finalY + 5,
      head: [["Semester", "Credits", "GPA"]],
      body: data.semesterHistory.map((s) => [s.label, String(s.totalCredits), s.gpa.toFixed(2)]),
      foot: [["CGPA", "", predictedCGPA.toFixed(2)]],
      margin: { left: margin, right: margin },
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [11, 18, 32], textColor: [250, 247, 240], fontStyle: "bold" },
      footStyles: { fillColor: [63, 167, 150], textColor: [255, 255, 255], fontStyle: "bold" },
    });
  }

  // ——— Footer ———
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(160, 160, 160);
    doc.text("GradeWise AI — Academic data is private and for student use only.", margin, doc.internal.pageSize.getHeight() - 10);
    doc.text(`Page ${i} / ${pageCount}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 10, { align: "right" });
  }

  doc.save(`GradeWise_${profile?.registerNumber ?? "report"}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
