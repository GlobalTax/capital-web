import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Wand2, Sparkles } from 'lucide-react';
import { useJobTemplates } from '@/hooks/useJobTemplates';

interface JobTemplateSelectorProps {
  onSelectTemplate: (templateId: string) => void;
  onOpenAI?: () => void;
  isGenerating?: boolean;
}

export const JobTemplateSelector: React.FC<JobTemplateSelectorProps> = ({
  onSelectTemplate,
  onOpenAI,
  isGenerating,
}) => {
  const { templates } = useJobTemplates();

  if (!templates || templates.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          ¿Usar una plantilla?
        </CardTitle>
        <CardDescription>
          Empieza desde una plantilla existente o genera contenido con IA
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-4">
        <Select onValueChange={onSelectTemplate}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Selecciona una plantilla..." />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name} • {template.category}
              </SelectItem>
            ))}
            <SelectItem value="blank">🆕 Empezar desde cero</SelectItem>
          </SelectContent>
        </Select>
        {onOpenAI && (
          <Button
            type="button"
            variant="default"
            onClick={onOpenAI}
            disabled={isGenerating}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Generar con IA
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
