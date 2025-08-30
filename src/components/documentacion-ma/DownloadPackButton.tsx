import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DownloadPackButtonProps {
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const DownloadPackButton: React.FC<DownloadPackButtonProps> = ({
  variant = 'default',
  size = 'default',
  className = ''
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      // Track download event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'ma_pack_download', {
          event_category: 'Downloads',
          event_label: 'MA_Resources_Pack',
          value: 1
        });
      }

      // Simulate download process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would typically trigger the actual file download
      // For now, we'll show a success message
      toast({
        title: "¡Descarga iniciada!",
        description: "El pack de recursos M&A se está descargando.",
        variant: "default"
      });

      // You can add actual file download logic here:
      // const link = document.createElement('a');
      // link.href = '/path/to/ma-resources-pack.pdf';
      // link.download = 'Capittal-MA-Resources-Pack.pdf';
      // link.click();

    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error en la descarga",
        description: "Hubo un problema al descargar el pack. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      variant={variant}
      size={size}
      className={`relative overflow-hidden ${className}`}
    >
      {isDownloading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Descargando...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Descargar Pack M&A
        </>
      )}
      
      {/* Optional: Add a subtle animation when not downloading */}
      {!isDownloading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      )}
    </Button>
  );
};