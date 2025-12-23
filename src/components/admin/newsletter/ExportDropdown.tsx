import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, FileCode, FileText, FileJson, Archive, ChevronDown } from 'lucide-react';
import { exportNewsletter, ExportFormat, exportFormatOptions } from '@/utils/newsletterExport';

interface ExportDropdownProps {
  html: string;
  subject?: string;
  disabled?: boolean;
}

const iconMap = {
  FileCode,
  FileText,
  FileJson,
  Archive,
};

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  html,
  subject,
  disabled = false,
}) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      await exportNewsletter(html, { format, subject });
      toast({
        title: '⬇️ Exportado',
        description: `Newsletter exportado en formato ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: 'Error al exportar',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || isExporting} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Formato de exportación</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {exportFormatOptions.map((option) => {
          const Icon = iconMap[option.icon as keyof typeof iconMap] || FileCode;
          return (
            <DropdownMenuItem
              key={option.id}
              onClick={() => handleExport(option.id)}
              className="flex items-start gap-2 py-2"
            >
              <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium">{option.name}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
