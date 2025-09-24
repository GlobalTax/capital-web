import React, { Suspense, lazy } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

// Lazy load React-PDF components to avoid initialization issues
const Document = lazy(() => 
  import('@react-pdf/renderer').then(module => ({ default: module.Document }))
);

const Page = lazy(() => 
  import('@react-pdf/renderer').then(module => ({ default: module.Page }))
);

const Text = lazy(() => 
  import('@react-pdf/renderer').then(module => ({ default: module.Text }))
);

const View = lazy(() => 
  import('@react-pdf/renderer').then(module => ({ default: module.View }))
);

// PDF generation function with better error handling
const pdfModule = () => import('@react-pdf/renderer');

// PDF loading fallback
const PDFLoadingFallback = () => (
  <Card className="p-4 text-center">
    <div className="flex flex-col items-center gap-2">
      <FileText className="h-8 w-8 text-muted-foreground animate-pulse" />
      <Skeleton className="w-32 h-4" />
      <p className="text-sm text-muted-foreground">Preparando PDF...</p>
    </div>
  </Card>
);

// Error boundary for PDF components
class PDFErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('PDF component error:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Card className="p-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <FileText className="h-8 w-8 text-destructive" />
            <p className="text-sm text-destructive">Error generando PDF</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => this.setState({ hasError: false })}
            >
              Reintentar
            </Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Optimized PDF wrapper
interface LazyPDFProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyPDFDocument: React.FC<LazyPDFProps> = ({ 
  children, 
  fallback 
}) => (
  <PDFErrorBoundary fallback={fallback}>
    <Suspense fallback={<PDFLoadingFallback />}>
      <Document>
        {children}
      </Document>
    </Suspense>
  </PDFErrorBoundary>
);

// Optimized PDF generation hook
export const useLazyPDFGeneration = () => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const generatePDFBlob = React.useCallback(async (pdfElement: React.ReactElement) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const module = await pdfModule();
      const blob = await module.pdf(pdfElement).toBlob();
      return blob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido generando PDF';
      setError(errorMessage);
      console.error('PDF generation error:', err);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generatePDFBlob,
    isGenerating,
    error,
    clearError: () => setError(null)
  };
};

// Re-export components with lazy loading
export const LazyDocument = Document;
export const LazyPage = Page;
export const LazyText = Text;
export const LazyView = View;

export { PDFErrorBoundary, PDFLoadingFallback };