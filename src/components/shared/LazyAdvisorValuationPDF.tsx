import React from 'react';
import { useLazyPDFGeneration } from './LazyPDF';
import { logger } from '@/utils/conditionalLogger';
import { AdvisorFormData, AdvisorValuationSimpleResult } from '@/types/advisor';

// Hook para generar PDFs de valoración de asesores con lazy loading
export const useAdvisorValuationPDF = (
  formData: AdvisorFormData,
  result: AdvisorValuationSimpleResult,
  lang: 'es' | 'ca' | 'val' | 'gl' | 'en' = 'es'
) => {
  const { generatePDFBlob, isGenerating, error, clearError } = useLazyPDFGeneration();

  const generatePDF = React.useCallback(async () => {
    try {
      logger.info('Starting Advisor PDF generation...');
      
      // Import the PDF component dynamically
      const PDFModule = await import('@/components/pdf/AdvisorValuationPDFDocument');
      const AdvisorValuationPDFDocument = PDFModule.default;
      
      // Create PDF element
      const pdfElement = React.createElement(AdvisorValuationPDFDocument, {
        formData,
        result,
        lang
      });

      // Generate PDF blob
      const blob = await generatePDFBlob(pdfElement);
      
      logger.info('Advisor PDF generated successfully');
      return blob;
    } catch (err) {
      logger.error('Advisor PDF generation failed:', err);
      throw err;
    }
  }, [formData, result, lang, generatePDFBlob]);

  return {
    generatePDF,
    isGenerating,
    error,
    clearError
  };
};

// Componente wrapper para generar PDFs de asesores (alternativa)
interface AdvisorValuationPDFGeneratorProps {
  formData: AdvisorFormData;
  result: AdvisorValuationSimpleResult;
  lang?: 'es' | 'ca' | 'val' | 'gl' | 'en';
  onGenerated?: (blob: Blob) => void;
  onError?: (error: string) => void;
  children: (props: {
    generatePDF: () => Promise<Blob>;
    isGenerating: boolean;
    error: string | null;
  }) => React.ReactNode;
}

export const AdvisorValuationPDFGenerator: React.FC<AdvisorValuationPDFGeneratorProps> = ({
  formData,
  result,
  lang = 'es',
  onGenerated,
  onError,
  children
}) => {
  const { generatePDF, isGenerating, error } = useAdvisorValuationPDF(formData, result, lang);

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
      logger.error('Failed to generate Advisor PDF:', err);
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
