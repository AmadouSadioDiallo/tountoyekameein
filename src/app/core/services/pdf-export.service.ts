import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PdfColumn {
  key: string;
  label: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

export interface PdfStat {
  label: string;
  value: string;
}

export interface PdfExportConfig<T> {
  title: string;
  subtitle?: string;
  columns: PdfColumn[];
  selectedColumnKeys: string[];
  stats?: PdfStat[];
  rows: T[];
  cellValue: (row: T, columnKey: string) => string;
  filename: string;
}

@Injectable({ providedIn: 'root' })
export class PdfExportService {
  exportTable<T>(config: PdfExportConfig<T>): void {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 14;
    let cursorY = 15;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(63, 81, 181);
    doc.text('Tountoye ka méïn', marginX, cursorY);

    cursorY += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text(config.title, marginX, cursorY);

    if (config.subtitle) {
      cursorY += 6;
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(config.subtitle, marginX, cursorY);
    }

    cursorY += 5;
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    const exportDate = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    doc.text(`Exporté le ${exportDate}`, marginX, cursorY);

    cursorY += 4;
    doc.setDrawColor(200, 200, 200);
    doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
    cursorY += 6;

    if (config.stats && config.stats.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);

      const statsBoxHeight = 18;
      const statWidth = (pageWidth - 2 * marginX) / config.stats.length;

      config.stats.forEach((stat, idx) => {
        const x = marginX + idx * statWidth;

        doc.setFillColor(245, 245, 247);
        doc.rect(x, cursorY, statWidth - 4, statsBoxHeight, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(stat.label.toUpperCase(), x + 3, cursorY + 5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(63, 81, 181);
        doc.text(stat.value, x + 3, cursorY + 13);
      });

      cursorY += statsBoxHeight + 6;
    }

    const selectedCols = config.columns.filter((c) =>
      config.selectedColumnKeys.includes(c.key),
    );

    if (selectedCols.length === 0) {
      doc.setFontSize(11);
      doc.setTextColor(150, 150, 150);
      doc.text('Aucune colonne sélectionnée pour l\'export.', marginX, cursorY + 10);
      doc.save(`${config.filename}.pdf`);
      return;
    }

    const head = [selectedCols.map((c) => c.label)];
    const body = config.rows.map((row) =>
      selectedCols.map((c) => config.cellValue(row, c.key) || '—'),
    );

    autoTable(doc, {
      startY: cursorY,
      head,
      body,
      theme: 'striped',
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 3,
        textColor: [50, 50, 50],
      },
      headStyles: {
        fillColor: [63, 81, 181],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
      },
      alternateRowStyles: {
        fillColor: [248, 248, 250],
      },
      columnStyles: selectedCols.reduce((acc, c, idx) => {
        const style: Record<string, unknown> = {};
        if (c.width) style['cellWidth'] = c.width;
        if (c.align) style['halign'] = c.align;
        acc[idx] = style;
        return acc;
      }, {} as Record<number, Record<string, unknown>>),
      didDrawPage: (data) => {
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageCount = doc.getNumberOfPages();
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${data.pageNumber} / ${pageCount}`,
          pageWidth - marginX,
          pageHeight - 8,
          { align: 'right' },
        );
        doc.text('Tountoye ka méïn — Gestion adhérents', marginX, pageHeight - 8);
      },
    });

    doc.save(`${config.filename}.pdf`);
  }
}
