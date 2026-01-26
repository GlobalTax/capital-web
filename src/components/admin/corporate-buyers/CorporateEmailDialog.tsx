// =============================================
// CORPORATE EMAIL DIALOG
// Compose and send emails to corporate contacts
// =============================================

import { useState, useEffect } from 'react';
import { 
  Mail, 
  Sparkles, 
  FileText, 
  Send,
  Loader2,
  Users,
  Building2,
  Briefcase,
  AlertCircle,
  Check,
  ChevronDown
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  useSendCorporateEmail, 
  useGenerateCorporateEmail,
  useActiveOperations,
  useBuyerContactsForEmail,
  EMAIL_TEMPLATES,
  type EmailTemplateKey,
} from '@/hooks/useCorporateEmail';
import type { CorporateBuyer, CorporateContact } from '@/types/corporateBuyers';
import { cn } from '@/lib/utils';

interface CorporateEmailDialogProps {
  open: boolean;
  onClose: () => void;
  // Single buyer mode
  buyer?: CorporateBuyer;
  // Bulk mode
  buyers?: CorporateBuyer[];
  contacts?: CorporateContact[];
}

type EmailMode = 'template' | 'custom' | 'ai';
type EmailPurpose = 'introduction' | 'opportunity' | 'followup';
type EmailTone = 'formal' | 'professional' | 'friendly';

export function CorporateEmailDialog({
  open,
  onClose,
  buyer,
  buyers = [],
  contacts: initialContacts = [],
}: CorporateEmailDialogProps) {
  // State
  const [mode, setMode] = useState<EmailMode>('template');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateKey>('introduction');
  const [selectedOperationId, setSelectedOperationId] = useState<string>('');
  const [includeTeaser, setIncludeTeaser] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [showContactSelector, setShowContactSelector] = useState(false);
  
  // AI options
  const [aiPurpose, setAiPurpose] = useState<EmailPurpose>('introduction');
  const [aiTone, setAiTone] = useState<EmailTone>('professional');
  const [customContext, setCustomContext] = useState('');

  // Hooks
  const sendEmail = useSendCorporateEmail();
  const generateEmail = useGenerateCorporateEmail();
  const { data: operations = [] } = useActiveOperations();
  const { data: buyerContacts = [] } = useBuyerContactsForEmail(buyer?.id);

  // Determine contacts to use
  const availableContacts = buyer 
    ? buyerContacts 
    : initialContacts.filter(c => c.email);

  const isBulkMode = !buyer && buyers.length > 0;
  const recipientCount = isBulkMode 
    ? availableContacts.length 
    : selectedContactIds.size || availableContacts.length;

  // Initialize selected contacts
  useEffect(() => {
    if (open && availableContacts.length > 0) {
      // Select all contacts by default
      setSelectedContactIds(new Set(availableContacts.map(c => c.id)));
    }
  }, [open, availableContacts]);

  // Apply template
  useEffect(() => {
    if (mode === 'template') {
      const template = EMAIL_TEMPLATES[selectedTemplate];
      setSubject(template.subject);
      setBody(template.body);
    }
  }, [mode, selectedTemplate]);

  const handleGenerateAI = async () => {
    if (!buyer) return;
    
    try {
      const result = await generateEmail.mutateAsync({
        buyerId: buyer.id,
        operationId: selectedOperationId || undefined,
        tone: aiTone,
        purpose: aiPurpose,
        customContext: customContext || undefined,
      });
      
      setSubject(result.subject);
      setBody(result.body);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) return;

    const contactIds = isBulkMode 
      ? availableContacts.map(c => c.id)
      : Array.from(selectedContactIds);

    if (contactIds.length === 0) return;

    try {
      await sendEmail.mutateAsync({
        contactIds,
        subject,
        body,
        mode: mode === 'ai' ? 'ai_generated' : mode,
        operationId: selectedOperationId || undefined,
        includeTeaser,
      });
      onClose();
    } catch (error) {
      // Error handled in hook
    }
  };

  const toggleContact = (contactId: string) => {
    const newSet = new Set(selectedContactIds);
    if (newSet.has(contactId)) {
      newSet.delete(contactId);
    } else {
      newSet.add(contactId);
    }
    setSelectedContactIds(newSet);
  };

  const selectedOperation = selectedOperationId 
    ? operations.find(o => o.id === selectedOperationId) 
    : null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {isBulkMode ? 'Enviar Email Masivo' : `Email a ${buyer?.name}`}
          </DialogTitle>
          <DialogDescription>
            {isBulkMode 
              ? `Enviar a ${recipientCount} contactos de ${buyers.length} compradores`
              : `${recipientCount} destinatario${recipientCount !== 1 ? 's' : ''}`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={mode} onValueChange={(v) => setMode(v as EmailMode)} className="h-full flex flex-col">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="template" className="gap-2">
                <FileText className="h-4 w-4" />
                Template
              </TabsTrigger>
              <TabsTrigger value="custom" className="gap-2">
                <Mail className="h-4 w-4" />
                Personalizado
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2" disabled={isBulkMode}>
                <Sparkles className="h-4 w-4" />
                IA
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 pr-4">
              {/* Contact Selector (single buyer mode) */}
              {!isBulkMode && availableContacts.length > 1 && (
                <Collapsible open={showContactSelector} onOpenChange={setShowContactSelector} className="mb-4">
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {selectedContactIds.size} de {availableContacts.length} contactos seleccionados
                      </span>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", showContactSelector && "rotate-180")} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                      {availableContacts.map((contact) => (
                        <label 
                          key={contact.id}
                          className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedContactIds.has(contact.id)}
                            onCheckedChange={() => toggleContact(contact.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{contact.full_name}</p>
                            <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
                          </div>
                          {contact.is_primary_contact && (
                            <Badge variant="secondary" className="text-[10px]">Principal</Badge>
                          )}
                        </label>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Template Mode */}
              <TabsContent value="template" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Email</Label>
                  <Select value={selectedTemplate} onValueChange={(v) => setSelectedTemplate(v as EmailTemplateKey)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="introduction">Introducción</SelectItem>
                      <SelectItem value="opportunity">Presentar Oportunidad</SelectItem>
                      <SelectItem value="followup">Seguimiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedTemplate === 'opportunity' && (
                  <div className="space-y-2">
                    <Label>Seleccionar Operación</Label>
                    <Select value={selectedOperationId} onValueChange={setSelectedOperationId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una operación..." />
                      </SelectTrigger>
                      <SelectContent>
                        {operations.map((op: { id: string; company_name: string; sector: string }) => (
                          <SelectItem key={op.id} value={op.id}>
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-muted-foreground" />
                              <span>{op.company_name}</span>
                              <Badge variant="outline" className="text-[10px]">{op.sector}</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedOperation && (
                      <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-muted/50">
                        <Checkbox
                          checked={includeTeaser}
                          onCheckedChange={(c) => setIncludeTeaser(c === true)}
                        />
                        <span className="text-sm">Incluir teaser visual en el email</span>
                      </label>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Custom Mode */}
              <TabsContent value="custom" className="mt-0 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Escribe un email personalizado. Usa variables como <code className="bg-muted px-1 rounded">{'{{name}}'}</code> para personalizar.
                </p>
              </TabsContent>

              {/* AI Mode */}
              <TabsContent value="ai" className="mt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Propósito</Label>
                    <Select value={aiPurpose} onValueChange={(v) => setAiPurpose(v as EmailPurpose)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="introduction">Introducción</SelectItem>
                        <SelectItem value="opportunity">Presentar oportunidad</SelectItem>
                        <SelectItem value="followup">Seguimiento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tono</Label>
                    <Select value={aiTone} onValueChange={(v) => setAiTone(v as EmailTone)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="professional">Profesional</SelectItem>
                        <SelectItem value="friendly">Cercano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {aiPurpose === 'opportunity' && (
                <div className="space-y-2">
                    <Label>Operación (opcional)</Label>
                    <Select value={selectedOperationId} onValueChange={setSelectedOperationId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una operación..." />
                      </SelectTrigger>
                      <SelectContent>
                        {operations.map((op: { id: string; company_name: string; sector: string }) => (
                          <SelectItem key={op.id} value={op.id}>
                            {op.company_name} - {op.sector}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Contexto adicional (opcional)</Label>
                  <Textarea
                    value={customContext}
                    onChange={(e) => setCustomContext(e.target.value)}
                    placeholder="Añade contexto que la IA deba considerar..."
                    rows={2}
                  />
                </div>

                <Button 
                  onClick={handleGenerateAI}
                  disabled={generateEmail.isPending}
                  className="w-full gap-2"
                >
                  {generateEmail.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generar con IA
                    </>
                  )}
                </Button>
              </TabsContent>

              {/* Email Content (shared) */}
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Asunto</Label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Asunto del email..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cuerpo</Label>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Contenido del email..."
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>

                {/* Variables hint */}
                <div className="bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Variables disponibles:</p>
                  <div className="flex flex-wrap gap-2">
                    <code className="bg-background px-1 rounded">{'{{name}}'}</code>
                    <code className="bg-background px-1 rounded">{'{{buyer_name}}'}</code>
                    <code className="bg-background px-1 rounded">{'{{title}}'}</code>
                    <code className="bg-background px-1 rounded">{'{{sectors}}'}</code>
                    <code className="bg-background px-1 rounded">{'{{geography}}'}</code>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </Tabs>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          {recipientCount === 0 && (
            <div className="flex items-center gap-2 text-sm text-amber-600 mr-auto">
              <AlertCircle className="h-4 w-4" />
              No hay destinatarios con email
            </div>
          )}
          
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={
              sendEmail.isPending || 
              !subject.trim() || 
              !body.trim() || 
              recipientCount === 0
            }
            className="gap-2"
          >
            {sendEmail.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar ({recipientCount})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
