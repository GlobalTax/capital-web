import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { exportRODHistory } from '@/utils/rod/exportRODData';

interface RODDocument {
  id: string;
  title: string;
  version: string;
  file_type: string;
  file_size_bytes: number | null;
  description: string | null;
  is_active: boolean;
  is_latest: boolean;
  total_downloads: number;
  created_at: string;
  activated_at: string | null;
  deactivated_at: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
}

interface RODExportButtonProps {
  documents: RODDocument[];
}

export const RODExportButton = ({ documents }: RODExportButtonProps) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (documents.length === 0) {
      toast({
        title: '⚠️ No hay datos para exportar',
        description: 'No hay documentos ROD disponibles',
        variant: 'destructive'
      });
      return;
    }

    setIsExporting(true);

    try {
      await exportRODHistory(documents, { format, includeStats: true });
      
      toast({
        title: '✅ Histórico exportado',
        description: `Se ha descargado el archivo ${format.toUpperCase()} correctamente`
      });
    } catch (error: any) {
      toast({
        title: '❌ Error al exportar',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting || documents.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exportando...' : 'Exportar Histórico'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Formato de exportación</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileText className="h-4 w-4 mr-2" />
          CSV (Básico)
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleExport('excel')} disabled>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Excel (Próximamente)
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleExport('pdf')} disabled>
          <FileImage className="h-4 w-4 mr-2" />
          PDF (Próximamente)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
