
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import ValuationPDFDocument from '@/components/pdf/ValuationPDFDocument';

interface CompanyData {
  contactName: string;
  companyName: string;
  cif: string;
  email: string;
  phone: string;
  industry: string;
  yearsOfOperation: number;
  employeeRange: string;
  revenue: number;
  ebitda: number;
  netProfitMargin: number;
  growthRate: number;
  location: string;
  ownershipParticipation: string;
  competitiveAdvantage: string;
}

interface ValuationResult {
  ebitdaMultiple: number;
  finalValuation: number;
  valuationRange: {
    min: number;
    max: number;
  };
  multiples: {
    ebitdaMultipleUsed: number;
  };
}

export const generateValuationPDFWithReactPDF = async (
  companyData: CompanyData,
  result: ValuationResult,
  lang: 'es' | 'ca' | 'val' | 'gl' | 'en' = 'es'
): Promise<Blob> => {
  try {
    // Usar JSX para crear el ReactElement correcto
    const pdfDocument = <ValuationPDFDocument companyData={companyData} result={result} lang={lang} />;
    
    // Generar el PDF
    const blob = await pdf(pdfDocument).toBlob();
    
    return blob;
  } catch (error) {
    console.error('Error generating PDF with React-PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
