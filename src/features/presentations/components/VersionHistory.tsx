import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  GitBranch, 
  Clock, 
  FileText,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface VersionInfo {
  version: number;
  created_at: string;
  notes?: string;
}

interface VersionHistoryProps {
  versions: VersionInfo[];
  currentVersion: number;
  isLoading?: boolean;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  versions,
  currentVersion,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <GitBranch className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">
          Primera versión
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          El historial de versiones aparecerá aquí
        </p>
      </div>
    );
  }

  // Sort versions descending (most recent first)
  const sortedVersions = [...versions].sort((a, b) => b.version - a.version);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Historial de Versiones
        </h4>
        <Badge variant="outline">
          v{currentVersion} actual
        </Badge>
      </div>

      <ScrollArea className="h-[200px] rounded-md border">
        <div className="p-3 space-y-1">
          {/* Current version indicator */}
          <div className="flex items-center gap-3 py-2 px-2 rounded-md bg-primary/5 border border-primary/20">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">v{currentVersion}</span>
                <Badge variant="secondary" className="text-xs">Actual</Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                Versión en uso
              </span>
            </div>
          </div>

          {sortedVersions.length > 0 && (
            <Separator className="my-2" />
          )}

          {/* Version history */}
          {sortedVersions.map((version, index) => (
            <div 
              key={version.version}
              className="flex items-start gap-3 py-2 px-2 rounded-md hover:bg-muted/50 transition-colors"
            >
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">v{version.version}</span>
                  {index === 0 && version.version === currentVersion - 1 && (
                    <Badge variant="outline" className="text-xs">
                      Anterior
                    </Badge>
                  )}
                </div>
                {version.notes && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {version.notes}
                  </p>
                )}
                <span className="text-xs text-muted-foreground/70">
                  {formatDistanceToNow(new Date(version.created_at), {
                    addSuffix: true,
                    locale: es
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default VersionHistory;
