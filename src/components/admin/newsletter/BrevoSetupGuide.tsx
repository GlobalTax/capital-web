import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, CheckCircle2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ReengagementType } from './templates/reengagementTemplates';

interface BrevoSetupGuideProps {
  reengagementType?: ReengagementType;
}

const BREVO_SEGMENTS = {
  abandoned: {
    name: 'Valoración Abandonada',
    filters: [
      { field: 'VALUATION_STATUS', operator: 'es igual a', value: 'started' },
      { field: 'CREATED_AT', operator: 'hace más de', value: '24 horas' },
      { field: 'CREATED_AT', operator: 'hace menos de', value: '7 días' },
    ],
    automation: 'Trigger: 24-48h después de que el lead abandone',
  },
  reactivation: {
    name: 'Leads Dormidos (30+ días)',
    filters: [
      { field: 'LAST_ACTIVITY', operator: 'hace más de', value: '30 días' },
      { field: 'VALUATION_STATUS', operator: 'es igual a', value: 'completed' },
    ],
    automation: 'Trigger: Diario a las 10:00h',
  },
  value_added: {
    name: 'Leads Activos - Valor Añadido',
    filters: [
      { field: 'VALUATION_STATUS', operator: 'es igual a', value: 'completed' },
      { field: 'CREATED_AT', operator: 'hace más de', value: '45 días' },
      { field: 'CREATED_AT', operator: 'hace menos de', value: '60 días' },
    ],
    automation: 'Trigger: Único, 45 días post-valoración',
  },
  revaluation: {
    name: 'Re-valorización (6+ meses)',
    filters: [
      { field: 'VALUATION_STATUS', operator: 'es igual a', value: 'completed' },
      { field: 'CREATED_AT', operator: 'hace más de', value: '180 días' },
    ],
    automation: 'Trigger: Mensual, primer lunes del mes',
  },
  nurturing: {
    name: 'Nurturing Mensual',
    filters: [
      { field: 'EMAIL_OPTOUT', operator: 'es igual a', value: 'false' },
      { field: 'VALUATION_STATUS', operator: 'existe', value: '' },
    ],
    automation: 'Trigger: Mensual, último jueves del mes',
  },
};

const BREVO_VARIABLES = [
  { variable: '{{contact.FIRSTNAME}}', description: 'Nombre del contacto', required: true },
  { variable: '{{contact.COMPANY}}', description: 'Nombre de la empresa', required: true },
  { variable: '{{contact.SECTOR}}', description: 'Sector de la empresa', required: true },
  { variable: '{{contact.VALUATION}}', description: 'Última valoración (ej: 2.5M - 3.2M€)', required: false },
  { variable: '{{contact.EMAIL}}', description: 'Email del contacto', required: true },
  { variable: '{{unsubscribe}}', description: 'Link de baja (automático)', required: true },
  { variable: '{{update_profile}}', description: 'Link actualizar preferencias', required: false },
];

export const BrevoSetupGuide: React.FC<BrevoSetupGuideProps> = ({ reengagementType = 'reactivation' }) => {
  const { toast } = useToast();
  const segmentConfig = BREVO_SEGMENTS[reengagementType];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado', description: text });
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          Guía de Configuración Brevo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
          {/* Step 1: Create Segment */}
          <AccordionItem value="segment">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full h-6 w-6 p-0 flex items-center justify-center">1</Badge>
                Crear Segmento: {segmentConfig.name}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <p className="text-sm text-muted-foreground">
                Ve a <strong>Contactos → Segmentos → Crear segmento</strong>
              </p>
              <div className="bg-muted rounded-lg p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Filtros a configurar:</p>
                {segmentConfig.filters.map((filter, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <code className="bg-background px-2 py-0.5 rounded text-xs">{filter.field}</code>
                    <span className="text-muted-foreground">{filter.operator}</span>
                    <code className="bg-background px-2 py-0.5 rounded text-xs">{filter.value}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(filter.field)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <a
                href="https://app.brevo.com/contacts/segments"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary flex items-center gap-1 hover:underline"
              >
                Abrir Segmentos en Brevo <ExternalLink className="h-3 w-3" />
              </a>
            </AccordionContent>
          </AccordionItem>

          {/* Step 2: Required Variables */}
          <AccordionItem value="variables">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full h-6 w-6 p-0 flex items-center justify-center">2</Badge>
                Variables Requeridas en Brevo
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <p className="text-sm text-muted-foreground">
                Asegúrate de tener estos atributos de contacto configurados:
              </p>
              <div className="bg-muted rounded-lg p-3 space-y-2">
                {BREVO_VARIABLES.filter(v => v.required || reengagementType === 'value_added').map((variable, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <code className="bg-background px-2 py-0.5 rounded text-xs font-mono">
                        {variable.variable}
                      </code>
                      {variable.required && (
                        <Badge variant="destructive" className="text-[10px] h-4">Requerido</Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{variable.description}</span>
                  </div>
                ))}
              </div>
              <a
                href="https://app.brevo.com/contacts/attributes"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary flex items-center gap-1 hover:underline"
              >
                Configurar Atributos <ExternalLink className="h-3 w-3" />
              </a>
            </AccordionContent>
          </AccordionItem>

          {/* Step 3: Create Automation */}
          <AccordionItem value="automation">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full h-6 w-6 p-0 flex items-center justify-center">3</Badge>
                Configurar Automatización
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <p className="text-sm text-muted-foreground">
                Ve a <strong>Automatización → Crear flujo</strong>
              </p>
              <div className="bg-muted rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary">Trigger</Badge>
                  <span>{segmentConfig.automation}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary">Segmento</Badge>
                  <span>{segmentConfig.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary">Acción</Badge>
                  <span>Enviar email con template HTML</span>
                </div>
              </div>
              <a
                href="https://automation.brevo.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary flex items-center gap-1 hover:underline"
              >
                Abrir Automatizaciones <ExternalLink className="h-3 w-3" />
              </a>
            </AccordionContent>
          </AccordionItem>

          {/* Step 4: Paste HTML */}
          <AccordionItem value="html">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full h-6 w-6 p-0 flex items-center justify-center">4</Badge>
                Pegar HTML del Email
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Copia el HTML generado (botón "Copiar HTML")</li>
                <li>En Brevo, crea una nueva plantilla de email</li>
                <li>Selecciona "Editar código HTML"</li>
                <li>Pega el código copiado</li>
                <li>Guarda y usa en tu automatización</li>
              </ol>
              <a
                href="https://app.brevo.com/email-templates"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary flex items-center gap-1 hover:underline"
              >
                Abrir Templates de Email <ExternalLink className="h-3 w-3" />
              </a>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            ¿Necesitas ayuda? Consulta la{' '}
            <a
              href="https://help.brevo.com/hc/es"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              documentación de Brevo
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
