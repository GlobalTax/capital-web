import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, Info, ClipboardCheck } from 'lucide-react';
import { validateEmailHtml, ValidationResult } from '@/utils/emailHtmlValidator';

interface CheckItem {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'warning' | 'info';
  message?: string;
}

interface PreSendChecklistProps {
  htmlCode: string;
  subject: string;
  hasContent: boolean;
}

export const PreSendChecklist: React.FC<PreSendChecklistProps> = ({
  htmlCode,
  subject,
  hasContent,
}) => {
  const validation = useMemo(() => validateEmailHtml(htmlCode), [htmlCode]);
  
  const checks = useMemo((): CheckItem[] => {
    const items: CheckItem[] = [];

    // Subject check
    items.push({
      id: 'subject',
      label: 'Asunto configurado',
      status: subject && subject.length >= 5 ? 'pass' : 'fail',
      message: !subject ? 'Falta el asunto' : subject.length < 5 ? 'El asunto es muy corto' : undefined
    });

    // Subject length
    if (subject && subject.length > 60) {
      items.push({
        id: 'subject-length',
        label: 'Longitud del asunto',
        status: 'warning',
        message: `El asunto tiene ${subject.length} caracteres (recomendado: <60)`
      });
    }

    // Content check
    items.push({
      id: 'content',
      label: 'Contenido añadido',
      status: hasContent ? 'pass' : 'fail',
      message: hasContent ? undefined : 'No hay contenido en el newsletter'
    });

    // Preheader check (hidden preview text)
    const hasPreheader = htmlCode.includes('display:none') || htmlCode.includes('mso-hide:all');
    items.push({
      id: 'preheader',
      label: 'Texto de previsualización',
      status: hasPreheader ? 'pass' : 'warning',
      message: hasPreheader ? undefined : 'Considera añadir texto de preheader'
    });

    // Images alt check
    const imagesWithoutAlt = htmlCode.match(/<img(?![^>]*alt=)[^>]*>/gi);
    items.push({
      id: 'images-alt',
      label: 'Imágenes con alt text',
      status: !imagesWithoutAlt || imagesWithoutAlt.length === 0 ? 'pass' : 'fail',
      message: imagesWithoutAlt ? `${imagesWithoutAlt.length} imagen(es) sin alt` : undefined
    });

    // Links check
    const brokenLinks = htmlCode.match(/<a[^>]*href=["']["'][^>]*>/gi);
    const emptyHrefs = htmlCode.match(/<a[^>]*href=["']#["'][^>]*>/gi);
    items.push({
      id: 'links',
      label: 'Enlaces válidos',
      status: !brokenLinks && !emptyHrefs ? 'pass' : 'warning',
      message: brokenLinks ? 'Hay enlaces vacíos' : emptyHrefs ? 'Hay enlaces con # como href' : undefined
    });

    // Brevo variables check
    const hasBrevoVariables = /\{\{.*?\}\}/.test(htmlCode);
    const hasFirstName = /\{\{contact\.FIRSTNAME\}\}/.test(htmlCode);
    const hasUnsubscribe = /\{\{unsubscribe\}\}/.test(htmlCode);
    
    items.push({
      id: 'brevo-firstname',
      label: 'Variable de nombre (Brevo)',
      status: hasFirstName ? 'pass' : 'info',
      message: hasFirstName ? undefined : 'Puedes personalizar con {{contact.FIRSTNAME}}'
    });

    items.push({
      id: 'brevo-unsubscribe',
      label: 'Enlace de baja (Brevo)',
      status: hasUnsubscribe ? 'pass' : 'fail',
      message: hasUnsubscribe ? undefined : 'Añade {{unsubscribe}} para cumplir con la ley'
    });

    // Size check
    items.push({
      id: 'size',
      label: 'Tamaño del HTML',
      status: validation.stats.sizeInBytes <= 80000 ? 'pass' : 
              validation.stats.sizeInBytes <= 102400 ? 'warning' : 'fail',
      message: `${validation.stats.sizeInKB} KB / 102 KB máximo`
    });

    // Validation errors
    const errors = validation.issues.filter(i => i.type === 'error');
    const warnings = validation.issues.filter(i => i.type === 'warning');
    
    if (errors.length > 0) {
      items.push({
        id: 'html-errors',
        label: 'Errores de compatibilidad',
        status: 'fail',
        message: `${errors.length} error(es) encontrado(s)`
      });
    }

    if (warnings.length > 0) {
      items.push({
        id: 'html-warnings',
        label: 'Advertencias de compatibilidad',
        status: 'warning',
        message: `${warnings.length} advertencia(s)`
      });
    }

    return items;
  }, [htmlCode, subject, hasContent, validation]);

  const passCount = checks.filter(c => c.status === 'pass').length;
  const failCount = checks.filter(c => c.status === 'fail').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;

  const getStatusIcon = (status: CheckItem['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: CheckItem['status']) => {
    switch (status) {
      case 'pass':
        return 'text-green-700 bg-green-50';
      case 'fail':
        return 'text-red-700 bg-red-50';
      case 'warning':
        return 'text-amber-700 bg-amber-50';
      case 'info':
        return 'text-blue-700 bg-blue-50';
    }
  };

  const overallStatus = failCount > 0 ? 'fail' : warningCount > 0 ? 'warning' : 'pass';

  return (
    <Card className="border-l-4" style={{ 
      borderLeftColor: overallStatus === 'fail' ? '#ef4444' : 
                       overallStatus === 'warning' ? '#f59e0b' : '#22c55e' 
    }}>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Checklist Pre-envío
          </CardTitle>
          <div className="flex gap-2">
            {passCount > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                ✓ {passCount}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                ⚠ {warningCount}
              </Badge>
            )}
            {failCount > 0 && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                ✗ {failCount}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-2">
        <div className="space-y-1.5">
          {checks.map((check) => (
            <div
              key={check.id}
              className={`flex items-center justify-between py-1.5 px-2 rounded-md ${getStatusColor(check.status)}`}
            >
              <div className="flex items-center gap-2">
                {getStatusIcon(check.status)}
                <span className="text-xs font-medium">{check.label}</span>
              </div>
              {check.message && (
                <span className="text-xs opacity-80">{check.message}</span>
              )}
            </div>
          ))}
        </div>
        
        {/* Score */}
        <div className="mt-3 pt-3 border-t flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Puntuación de compatibilidad</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  validation.score >= 80 ? 'bg-green-500' :
                  validation.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${validation.score}%` }}
              />
            </div>
            <span className={`text-xs font-bold ${
              validation.score >= 80 ? 'text-green-600' :
              validation.score >= 50 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {validation.score}/100
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};