import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, Eye, MoreVertical, Pencil, Trash2, Tag } from 'lucide-react';
import { OperationDocument, getFileIcon, formatFileSize, getCategoryLabel, getStatusLabel, getStatusBadgeColor } from '../../types/documents';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DocumentCardProps {
  document: OperationDocument;
  onDownload: (documentId: string) => void;
  onPreview: (documentId: string) => void;
  onEdit: (documentId: string) => void;
  onDelete: (documentId: string) => void;
  isDownloading?: boolean;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onDownload,
  onPreview,
  onEdit,
  onDelete,
  isDownloading,
}) => {
  const [imageError, setImageError] = useState(false);
  const FileIcon = getFileIcon(document.file_type);
  const isImage = document.file_type.startsWith('image/');

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Preview/Icon */}
        <div className="aspect-[4/3] mb-3 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
          {isImage && !imageError ? (
            <img
              src={`/placeholder.svg?text=${encodeURIComponent(document.title)}`}
              alt={document.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <FileIcon className="h-16 w-16 text-muted-foreground" />
          )}
        </div>

        {/* Title & Category */}
        <div className="space-y-2 mb-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium line-clamp-2 flex-1">
              {document.title}
            </h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onPreview(document.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Vista Previa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload(document.id)} disabled={isDownloading}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(document.id)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(document.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {getCategoryLabel(document.category)}
            </Badge>
            <Badge className={`text-xs ${getStatusBadgeColor(document.status)}`}>
              {getStatusLabel(document.status)}
            </Badge>
          </div>
        </div>

        {/* Description */}
        {document.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {document.description}
          </p>
        )}

        {/* Tags */}
        {document.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap mb-3">
            <Tag className="h-3 w-3 text-muted-foreground" />
            {document.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="text-xs text-muted-foreground">
                {tag}
                {index < Math.min(document.tags.length, 3) - 1 && ','}
              </span>
            ))}
            {document.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{document.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Meta info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatFileSize(document.file_size)}</span>
          <span>v{document.version}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t">
          <span>{document.download_count} descargas</span>
          <span title={format(new Date(document.created_at), 'PPp', { locale: es })}>
            {format(new Date(document.created_at), 'dd/MM/yyyy', { locale: es })}
          </span>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2 mt-3 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onPreview(document.id)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onDownload(document.id)}
            disabled={isDownloading}
          >
            <Download className="h-4 w-4 mr-1" />
            Descargar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
