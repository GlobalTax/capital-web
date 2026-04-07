import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Loader2, Mail, Pen, RefreshCw, AlertCircle, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  sendId: string | null;
  language: string;
  subjectTemplate: string;
  bodyTemplate: string;
}

interface RODSendEmail {
  id: string;
  send_id: string;
  member_id: string | null;
  email: string;
  full_name: string | null;
  company: string | null;
  subject: string;
  body_html: string | null;
  body_text: string | null;
  is_manually_edited: boolean;
  status: string;
}

export function RODMailList({ sendId, language, subjectTemplate, bodyTemplate }: Props) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editingEmail, setEditingEmail] = useState<RODSendEmail | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Fetch generated emails
  const { data: emails = [], isLoading } = useQuery({
    queryKey: ['rod-send-emails', sendId],
    queryFn: async () => {
      if (!sendId) return [];
      const { data, error } = await supabase
        .from('rod_send_emails' as any)
        .select('*')
        .eq('send_id', sendId)
        .order('full_name');
      if (error) throw error;
      return (data || []) as RODSendEmail[];
    },
    enabled: !!sendId,
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return emails;
    const q = search.toLowerCase();
    return emails.filter(e =>
      (e.full_name || '').toLowerCase().includes(q) ||
      (e.email || '').toLowerCase().includes(q) ||
      (e.company || '').toLowerCase().includes(q)
    );
  }, [emails, search]);

  const manualCount = emails.filter(e => e.is_manually_edited).length;

  // Generate emails for all members
  const generateEmails = async () => {
    if (!sendId) {
      toast.error('Guarda el borrador primero');
      return;
    }
    if (!subjectTemplate.trim()) {
      toast.error('Escribe un asunto en el template');
      return;
    }

    setGenerating(true);
    try {
      const langs = language === 'both' ? ['es', 'en'] : [language];
      const allMembers: any[] = [];
      for (const lang of langs) {
        const { data } = await supabase
          .from('rod_list_members' as any)
          .select('id, email, full_name, company')
          .eq('language', lang)
          .not('email', 'is', null);
        if (data) allMembers.push(...data);
      }

      // Deduplicate by email
      const seen = new Set<string>();
      const uniqueMembers = allMembers.filter(m => {
        const key = m.email.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Delete existing non-sent emails
      await supabase
        .from('rod_send_emails' as any)
        .delete()
        .eq('send_id', sendId)
        .in('status', ['pending']);

      // Generate personalized emails
      const rows = uniqueMembers.map(m => {
        const personalizedSubject = subjectTemplate
          .replace(/\{\{nombre\}\}/g, m.full_name || '')
          .replace(/\{\{empresa\}\}/g, m.company || '');
        const personalizedBody = bodyTemplate
          .replace(/\{\{nombre\}\}/g, m.full_name || '')
          .replace(/\{\{empresa\}\}/g, m.company || '');

        return {
          send_id: sendId,
          member_id: m.id,
          email: m.email,
          full_name: m.full_name,
          company: m.company,
          subject: personalizedSubject,
          body_html: personalizedBody.replace(/\n/g, '<br/>'),
          body_text: personalizedBody,
          status: 'pending',
        };
      });

      // Insert in batches of 50
      for (let i = 0; i < rows.length; i += 50) {
        const batch = rows.slice(i, i + 50);
        const { error } = await supabase.from('rod_send_emails' as any).insert(batch);
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['rod-send-emails', sendId] });
      toast.success(`${rows.length} emails generados`);
    } catch (e: any) {
      toast.error('Error generando emails: ' + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const openEdit = (email: RODSendEmail) => {
    setEditingEmail(email);
    setEditSubject(email.subject);
    setEditBody(email.body_text || '');
  };

  const saveEdit = async () => {
    if (!editingEmail) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('rod_send_emails' as any)
        .update({
          subject: editSubject,
          body_html: editBody.replace(/\n/g, '<br/>'),
          body_text: editBody,
          is_manually_edited: true,
        })
        .eq('id', editingEmail.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['rod-send-emails', sendId] });
      setEditingEmail(null);
      toast.success('Email actualizado');
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium">Lista de emails</h3>
          {emails.length > 0 && (
            <Badge variant="secondary" className="text-xs">{emails.length} emails</Badge>
          )}
          {manualCount > 0 && (
            <Badge variant="outline" className="text-xs text-amber-700 border-amber-300">
              <Pen className="h-3 w-3 mr-1" />{manualCount} editados
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          onClick={generateEmails}
          disabled={generating || !sendId}
        >
          {generating ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1.5" />}
          {emails.length > 0 ? 'Regenerar emails' : 'Generar emails'}
        </Button>
      </div>

      {emails.length === 0 && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-1">
              No hay emails generados todavía
            </p>
            <p className="text-xs text-muted-foreground">
              Primero guarda el template y luego pulsa "Generar emails" para crear los emails personalizados
            </p>
          </CardContent>
        </Card>
      )}

      {emails.length > 0 && (
        <>
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contacto..."
              className="pl-9 h-9 text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Contacto</TableHead>
                  <TableHead className="text-xs">Email</TableHead>
                  <TableHead className="text-xs">Empresa</TableHead>
                  <TableHead className="text-xs">Asunto</TableHead>
                  <TableHead className="text-xs">Estado</TableHead>
                  <TableHead className="text-xs w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(email => (
                  <TableRow
                    key={email.id}
                    className={`cursor-pointer ${email.is_manually_edited ? 'bg-amber-50/50' : ''}`}
                    onClick={() => email.status === 'pending' && openEdit(email)}
                  >
                    <TableCell className="text-xs font-medium">
                      <div className="flex items-center gap-1">
                        {email.is_manually_edited && <Pen className="h-3 w-3 text-amber-600" />}
                        {email.full_name || '—'}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{email.email}</TableCell>
                    <TableCell className="text-xs">{email.company || '—'}</TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">{email.subject}</TableCell>
                    <TableCell>
                      <Badge variant={email.status === 'sent' ? 'default' : email.status === 'failed' ? 'destructive' : 'secondary'} className="text-[10px]">
                        {email.status === 'pending' ? 'Pendiente' : email.status === 'sent' ? 'Enviado' : email.status === 'failed' ? 'Error' : email.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {email.status === 'pending' && (
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); openEdit(email); }}>
                          <Pen className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editingEmail} onOpenChange={() => setEditingEmail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm">
              Editar email — {editingEmail?.full_name} ({editingEmail?.email})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Asunto</Label>
              <Input value={editSubject} onChange={e => setEditSubject(e.target.value)} className="h-9" />
            </div>
            <div>
              <Label className="text-xs">Cuerpo</Label>
              <Textarea value={editBody} onChange={e => setEditBody(e.target.value)} className="min-h-[200px] text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditingEmail(null)}>Cancelar</Button>
            <Button size="sm" onClick={saveEdit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
