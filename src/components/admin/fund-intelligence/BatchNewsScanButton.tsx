import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Radar, Play, Square, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { searchFundNews } from '@/lib/api/fundIntelligenceApi';
import { FundForIntelligence } from '@/hooks/useFundIntelligence';
import { useQueryClient } from '@tanstack/react-query';

interface BatchNewsScanButtonProps {
  funds: FundForIntelligence[];
  fundType: 'sf' | 'cr';
}

interface ScanResult {
  fundId: string;
  fundName: string;
  success: boolean;
  newsCount?: number;
  error?: string;
}

export const BatchNewsScanButton = ({ funds, fundType }: BatchNewsScanButtonProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const queryClient = useQueryClient();

  const pauseRef = { current: false };

  const totalNews = results.reduce((acc, r) => acc + (r.newsCount || 0), 0);
  const successCount = results.filter(r => r.success).length;
  const errorCount = results.filter(r => !r.success).length;
  const progress = funds.length > 0 ? (currentIndex / funds.length) * 100 : 0;

  const startScan = useCallback(async () => {
    setIsScanning(true);
    setIsPaused(false);
    setShowResults(true);
    pauseRef.current = false;

    const startIndex = currentIndex > 0 && currentIndex < funds.length ? currentIndex : 0;
    if (startIndex === 0) {
      setResults([]);
      setCurrentIndex(0);
    }

    for (let i = startIndex; i < funds.length; i++) {
      if (pauseRef.current) {
        setCurrentIndex(i);
        break;
      }

      const fund = funds[i];
      setCurrentIndex(i + 1);

      try {
        const response = await searchFundNews(fund.id, fundType);
        setResults(prev => [...prev, {
          fundId: fund.id,
          fundName: fund.name,
          success: true,
          newsCount: response.data?.saved_count || 0,
        }]);
      } catch (error) {
        setResults(prev => [...prev, {
          fundId: fund.id,
          fundName: fund.name,
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        }]);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsScanning(false);
    queryClient.invalidateQueries({ queryKey: ['fund-news'] });
  }, [funds, fundType, currentIndex, queryClient]);

  const pauseScan = () => {
    pauseRef.current = true;
    setIsPaused(true);
    setIsScanning(false);
  };

  const resetScan = () => {
    setIsScanning(false);
    setIsPaused(false);
    setCurrentIndex(0);
    setResults([]);
    setShowResults(false);
  };

  if (!showResults) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={startScan}
        disabled={funds.length === 0}
        className="gap-2"
      >
        <Radar className="h-4 w-4" />
        Escanear todos ({funds.length})
      </Button>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Radar className="h-5 w-5 text-primary" />
            Scan Masivo de Noticias
          </CardTitle>
          <div className="flex gap-2">
            {isScanning ? (
              <Button variant="destructive" size="sm" onClick={pauseScan}>
                <Square className="h-4 w-4 mr-1" />
                Pausar
              </Button>
            ) : isPaused ? (
              <>
                <Button variant="default" size="sm" onClick={startScan}>
                  <Play className="h-4 w-4 mr-1" />
                  Continuar
                </Button>
                <Button variant="outline" size="sm" onClick={resetScan}>
                  Reiniciar
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={resetScan}>
                Cerrar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {isScanning ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Escaneando {currentIndex}/{funds.length}...
                </span>
              ) : isPaused ? (
                `Pausado en ${currentIndex}/${funds.length}`
              ) : (
                `Completado: ${currentIndex}/${funds.length}`
              )}
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex gap-3 text-sm">
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            {successCount} exitosos
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <XCircle className="h-3 w-3 text-red-500" />
            {errorCount} errores
          </Badge>
          <Badge variant="default" className="gap-1">
            {totalNews} noticias
          </Badge>
        </div>

        {results.length > 0 && (
          <ScrollArea className="h-[200px] border rounded-md p-2">
            <div className="space-y-1">
              {results.slice().reverse().map((result, idx) => (
                <div
                  key={`${result.fundId}-${idx}`}
                  className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-muted/50"
                >
                  <span className="truncate max-w-[200px]">{result.fundName}</span>
                  {result.success ? (
                    <Badge variant="outline" className="text-green-600">
                      {result.newsCount} noticias
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">
                      Error
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
