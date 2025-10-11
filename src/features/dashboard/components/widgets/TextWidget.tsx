import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Trash2 } from 'lucide-react';
import { BaseWidget } from './WidgetFactory';

interface TextWidgetProps {
  widget: BaseWidget;
  isEditing?: boolean;
  onEdit?: (widget: BaseWidget) => void;
  onDelete?: (widgetId: string) => void;
  isDragging?: boolean;
}

export function TextWidget({ widget, isEditing, onEdit, onDelete, isDragging }: TextWidgetProps) {
  const getSizeClasses = () => {
    switch (widget.size) {
      case 'small': return 'col-span-1';
      case 'medium': return 'col-span-2';
      case 'large': return 'col-span-3';
      default: return 'col-span-1';
    }
  };

  const defaultContent = widget.config?.content || `
    **Bienvenido a tu Dashboard**
    
    Este es un widget de texto personalizable donde puedes añadir:
    - Notas importantes
    - Enlaces útiles
    - Recordatorios
    - Cualquier información relevante
    
    Usa Markdown para formatear el contenido.
  `;

  const renderMarkdown = (content: string) => {
    // Implementación básica de markdown
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .split('\n')
      .map(line => line.trim() ? `<p>${line}</p>` : '<br>')
      .join('');
  };

  return (
    <Card className={`${isDragging ? 'opacity-50' : ''} ${getSizeClasses()} hover:shadow-md transition-shadow`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
        {isEditing && (
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onEdit?.(widget)}
            >
              <Settings className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onDelete?.(widget.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div 
          className="prose prose-sm max-w-none text-sm"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(defaultContent) }}
        />
      </CardContent>
    </Card>
  );
}