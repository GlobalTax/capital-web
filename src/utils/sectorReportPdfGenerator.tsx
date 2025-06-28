
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import SectorReportPDFDocument from '@/components/pdf/SectorReportPDFDocument';
import { SectorReportResult } from '@/types/sectorReports';

export const generateSectorReportPDF = async (
  report: SectorReportResult
): Promise<Blob> => {
  try {
    // Crear el documento PDF usando JSX
    const pdfDocument = <SectorReportPDFDocument report={report} />;
    
    // Generar el PDF
    const blob = await pdf(pdfDocument).toBlob();
    
    return blob;
  } catch (error) {
    console.error('Error generating sector report PDF:', error);
    throw new Error('Failed to generate sector report PDF');
  }
};

export const downloadSectorReportPDF = async (report: SectorReportResult) => {
  try {
    const blob = await generateSectorReportPDF(report);
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading sector report PDF:', error);
    throw error;
  }
};
