import React from 'react';
import { useLazyPDFGeneration } from './LazyPDF';
import { logger } from '@/utils/conditionalLogger';

// Hook para generar PDFs de valoración con lazy loading
export const useValuationPDF = (
  companyData: any,
  result: any,
  lang: 'es' | 'ca' | 'val' | 'gl' | 'en' = 'es'
) => {
  const { generatePDFBlob, isGenerating, error, clearError } = useLazyPDFGeneration();

  const generatePDF = React.useCallback(async () => {
    try {
      logger.info('Starting PDF generation...');
      
      // Import the PDF component dynamically
      const PDFModule = await import('@/components/pdf/ValuationPDFDocument');
      const ValuationPDFDocument = PDFModule.default;
      
      // Create PDF element
      const pdfElement = React.createElement(ValuationPDFDocument, {
        companyData,
        result,
        lang
      });

      // Generate PDF blob
      const blob = await generatePDFBlob(pdfElement);
      
      logger.info('PDF generated successfully');
      return blob;
    } catch (err) {
      logger.error('PDF generation failed:', err);
      throw err;
    }
  }, [companyData, result, lang, generatePDFBlob]);

  return {
    generatePDF,
    isGenerating,
    error,
    clearError
  };
};

// Componente wrapper para generar PDFs (alternativa)
interface ValuationPDFGeneratorProps {
  companyData: any;
  result: any;
  lang?: 'es' | 'ca' | 'val' | 'gl' | 'en';
  onGenerated?: (blob: Blob) => void;
  onError?: (error: string) => void;
  children: (props: {
    generatePDF: () => Promise<Blob>;
    isGenerating: boolean;
    error: string | null;
  }) => React.ReactNode;
}

export const ValuationPDFGenerator: React.FC<ValuationPDFGeneratorProps> = ({
  companyData,
  result,
  lang = 'es',
  onGenerated,
  onError,
  children
}) => {
  const { generatePDF, isGenerating, error } = useValuationPDF(companyData, result, lang);

  React.useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  const handleGeneratePDF = React.useCallback(async () => {
    try {
      const blob = await generatePDF();
      if (onGenerated) {
        onGenerated(blob);
      }
      return blob;
    } catch (err) {
      logger.error('Failed to generate PDF:', err);
      throw err;
    }
  }, [generatePDF, onGenerated]);

  return (
    <>
      {children({
        generatePDF: handleGeneratePDF,
        isGenerating,
        error
      })}
    </>
  );
};