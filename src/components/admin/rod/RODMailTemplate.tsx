import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Save, Loader2, Mail, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEmailSignature, DEFAULT_SIGNATURE, generateSignatureHtml } from '@/hooks/useEmailSignature';
import { toast } from 'sonner';

interface RODDocument {
  id: string;
  title: string;
  file_type: string;
  language: string;
  is_active: boolean;
}

interface Props {
  sendId: string | null;
  subject: string;
  bodyText: string;
  language: string;
  attachmentIds: string[];
  onSubjectChange: (v: string) => void;
  onBodyChange: (v: string) => void;
  onLanguageChange: (v: string) => void;
  onAttachmentsChange: (v: string[]) => void;
  onSaveDraft: () => Promise<void>;
  saveStatus: 'idle' | 'saving' | 'saved';
}

const ROD_VARIABLES = [
  { key: 'nombre', label: '{{nombre}}', category: 'Contacto' },
  { key: 'empresa', label: '{{empresa}}', category: 'Contacto' },
  { key: 'firmante_nombre', label: '{{firmante_nombre}}', category: 'Firmante' },
  { key: 'firmante_cargo', label: '{{firmante_cargo}}', category: 'Firmante' },
  { key: 'firmante_telefono', label: '{{firmante_telefono}}', category: 'Firmante' },
];

export function RODMailTemplate({
  sendId, subject, bodyText, language, attachmentIds,
  onSubjectChange, onBodyChange, onLanguageChange, onAttachmentsChange,
  onSaveDraft, saveStatus,
}: Props) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const [lastFocused, setLastFocused] = useState<'subject' | 'body'>('body');
  const { signature } = useEmailSignature();

  // Fetch recipient count
  const { data: recipientCount = 0 } = useQuery({
    queryKey: ['rod-list-count', language],
    queryFn: async () => {
      const langs = language === 'both' ? ['es', 'en'] : [language];
      let total = 0;
      for (const lang of langs) {
        const { count, error } = await supabase
          .from('rod_list_members' as any)
          .select('id', { count: 'exact', head: true })
          .eq('language', lang)
          .not('email', 'is', null);
        if (!error) total += (count || 0);
      }
      return total;
    },
  });

  // Fetch active ROD documents
  const { data: documents = [] } = useQuery({
    queryKey: ['rod-documents-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rod_documents')
        .select('id, title, file_type, language, is_active')
        .eq('is_active', true)
        .eq('is_deleted', false)
        .order('language');
      if (error) throw error;
      return (data || []) as RODDocument[];
    },
  });

  const filteredDocs = useMemo(() => {
    if (language === 'both') return documents;
    return documents.filter(d => d.language === language);
  }, [documents, language]);

  const insertVariable = useCallback((key: string) => {
    const tag = `{{${key}}}`;
    if (lastFocused === 'subject' && subjectRef.current) {
      const el = subjectRef.current;
      const start = el.selectionStart || 0;
      const end = el.selectionEnd || 0;
      const newVal = subject.slice(0, start) + tag + subject.slice(end);
      onSubjectChange(newVal);
      setTimeout(() => { el.focus(); el.setSelectionRange(start + tag.length, start + tag.length); }, 0);
    } else if (bodyRef.current) {
      const el = bodyRef.current;
      const start = el.selectionStart || 0;
      const end = el.selectionEnd || 0;
      const newVal = bodyText.slice(0, start) + tag + bodyText.slice(end);
      onBodyChange(newVal);
      setTimeout(() => { el.focus(); el.setSelectionRange(start + tag.length, start + tag.length); }, 0);
    }
  }, [lastFocused, subject, bodyText, onSubjectChange, onBodyChange]);

  // Preview with resolved variables
  const resolvePreview = useCallback((tpl: string) => {
    let r = tpl
      .replace(/\{\{nombre\}\}/g, 'Juan Ejemplo')
      .replace(/\{\{empresa\}\}/g, 'Empresa Demo S.L.');
    if (signature) {
      r = r.replace(/\{\{firmante_nombre\}\}/g, signature.full_name || '');
      r = r.replace(/\{\{firmante_cargo\}\}/g, signature.job_title || '');
      r = r.replace(/\{\{firmante_telefono\}\}/g, signature.phone || '');
    }
    return r;
  }, [signature]);

  const signatureHtml = signature?.html_preview || generateSignatureHtml({ ...DEFAULT_SIGNATURE, full_name: signature?.full_name || '' });

  // Group variables by category
  const categories = ROD_VARIABLES.reduce((acc, v) => {
    if (!acc[v.category]) acc[v.category] = [];
    acc[v.category].push(v);
    return acc;
  }, {} as Record<string, typeof ROD_VARIABLES>);

  return (
    <div className="space-y-4">
      {/* Language selector + recipient count */}
      <div className="flex items-center gap-4">
        <div>
          <Label className="text-xs">Lista destino</Label>
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">Castellano</SelectItem>
              <SelectItem value="en">Inglés</SelectItem>
              <SelectItem value="both">Ambas listas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-5">
          <Mail className="h-4 w-4" />
          <span className="font-medium">{recipientCount}</span> destinatarios
        </div>
        <div className="ml-auto mt-5 flex items-center gap-2">
          {saveStatus === 'saving' && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
          {saveStatus === 'saved' && <span className="text-xs text-green-600">✓ Guardado</span>}
        </div>
      </div>

      {/* Variables */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Variables disponibles</CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="space-y-2">
            {Object.entries(categories).map(([cat, vars]) => (
              <div key={cat} className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-muted-foreground font-medium w-20">{cat}:</span>
                {vars.map(v => (
                  <Button
                    key={v.key}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs font-mono bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-800"
                    onClick={() => insertVariable(v.key)}
                  >
                    {v.label}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subject + body + preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Asunto</Label>
            <Input
              ref={subjectRef}
              value={subject}
              onChange={e => onSubjectChange(e.target.value)}
              onFocus={() => setLastFocused('subject')}
              placeholder="Relación de Oportunidades Q2 2026 Capittal"
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs">Cuerpo del email</Label>
            <Textarea
              ref={bodyRef}
              value={bodyText}
              onChange={e => onBodyChange(e.target.value)}
              onFocus={() => setLastFocused('body')}
              placeholder="Buenos días {{nombre}},&#10;&#10;Le adjuntamos la última Relación de Oportunidades..."
              className="min-h-[250px] text-sm"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs flex items-center gap-1">
            <Eye className="h-3 w-3" /> Vista previa
          </Label>
          <div className="border rounded-md p-4 bg-white min-h-[340px]">
            <p className="text-xs text-muted-foreground mb-1">Asunto:</p>
            <p className="text-sm font-medium mb-3">{resolvePreview(subject) || '(sin asunto)'}</p>
            <div className="text-sm whitespace-pre-line">{resolvePreview(bodyText) || '(sin contenido)'}</div>
            {signatureHtml && (
              <>
                <hr className="my-3 border-t border-gray-200" />
                <div dangerouslySetInnerHTML={{ __html: signatureHtml }} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Attachments */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentos adjuntos (ROD)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocs.length === 0 ? (
            <p className="text-xs text-muted-foreground">No hay documentos activos para este idioma</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredDocs.map(doc => (
                <label
                  key={doc.id}
                  className={`flex items-center gap-3 border rounded-md p-3 cursor-pointer transition-colors ${
                    attachmentIds.includes(doc.id) ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                >
                  <Checkbox
                    checked={attachmentIds.includes(doc.id)}
                    onCheckedChange={(checked) => {
                      onAttachmentsChange(
                        checked ? [...attachmentIds, doc.id] : attachmentIds.filter(id => id !== doc.id)
                      );
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{doc.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {doc.file_type === 'pdf' ? 'PDF' : 'Excel'} · {doc.language === 'es' ? 'ES' : 'EN'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
