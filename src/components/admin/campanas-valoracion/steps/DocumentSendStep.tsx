import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Send, Loader2, Mail, CheckCircle2, AlertCircle, Search, Building2, MoreVertical, RefreshCw } from 'lucide-react';
import { useCampaignCompanies } from '@/hooks/useCampaignCompanies';
import { useCampaignEmails } from '@/hooks/useCampaignEmails';
import { ValuationCampaign } from '@/hooks/useCampaigns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  campaignId: string;
  campaign: ValuationCampaign;
}

type ResendConfirm = 
  | { type: 'single'; emailId: string; companyName: string }
  | { type: 'bulk'; emailIds: string[]; count: number }
  | null;

export const DocumentSendStep: React.FC<Props> = ({ campaignId, campaign }) => {
  const { companies } = useCampaignCompanies(campaignId);
  const { emails, sendEmail, sendAllPending, isSendingAll, isLoading } = useCampaignEmails(campaignId);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [resendConfirm, setResendConfirm] = useState<ResendConfirm>(null);

  const emailMap = useMemo(() => {
    const map = new Map<string, typeof emails[0]>();
    emails.forEach(e => map.set(e.company_id, e));
    return map;
  }, [emails]);

  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return companies;
    const q = searchQuery.toLowerCase();
    return companies.filter(c =>
      c.client_company?.toLowerCase().includes(q) ||
      c.client_email?.toLowerCase().includes(q) ||
      c.client_name?.toLowerCase().includes(q)
    );
  }, [companies, searchQuery]);

  const pendingEmails = emails.filter(e => e.status === 'pending');
  const sentEmails = emails.filter(e => e.status === 'sent');
  const errorEmails = emails.filter(e => e.status === 'error');

  const resetAndResend = async (emailId: string) => {
    setSendingId(emailId);
    try {
      await supabase.from('campaign_emails')
        .update({ status: 'pending', sent_at: null, error_message: null })
        .eq('id', emailId);
      await sendEmail(emailId);
    } catch {
      // error handled by hook
    } finally {
      setSendingId(null);
    }
  };

  const handleResendConfirm = async () => {
    if (!resendConfirm) return;
    if (resendConfirm.type === 'single') {
      await resetAndResend(resendConfirm.emailId);
    } else {
      for (const emailId of resendConfirm.emailIds) {
        await resetAndResend(emailId);
      }
    }
    setResendConfirm(null);
  };

  const handleSendSingle = async (emailId: string) => {
    setSendingId(emailId);
    try {
      await sendEmail(emailId);
    } catch {
      // error handled by hook
    } finally {
      setSendingId(null);
    }
  };

  const handleSendAll = async () => {
    if (pendingEmails.length === 0) {
      toast.info('No hay emails pendientes para enviar');
      return;
    }
    await sendAllPending();
  };

  const handleBulkResend = () => {
    const sentEmailIds = sentEmails.map(e => e.id);
    if (sentEmailIds.length === 0) return;
    setResendConfirm({ type: 'bulk', emailIds: sentEmailIds, count: sentEmailIds.length });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredCompanies.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCompanies.map(c => c.id)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Empresas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{companies.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Mail className="h-4 w-4" /> Emails Generados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{emails.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Enviados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{sentEmails.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-4 w-4" /> Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{pendingEmails.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {pendingEmails.length} pendiente{pendingEmails.length !== 1 ? 's' : ''} · {sentEmails.length} enviado{sentEmails.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              {sentEmails.length > 0 && (
                <Button variant="outline" onClick={handleBulkResend} disabled={isSendingAll}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reenviar {sentEmails.length} enviados
                </Button>
              )}
              {pendingEmails.length > 0 && (
                <Button onClick={handleSendAll} disabled={isSendingAll}>
                  {isSendingAll ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enviando...</>
                  ) : (
                    <><Send className="h-4 w-4 mr-2" />Enviar todos ({pendingEmails.length})</>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Empresas ({filteredCompanies.length})
            </CardTitle>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground text-sm">Cargando...</div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">No hay empresas</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedIds.size === filteredCompanies.length && filteredCompanies.length > 0}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map(c => {
                  const email = emailMap.get(c.id);
                  const status = email?.status || 'sin_email';
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(c.id)}
                          onCheckedChange={() => toggleSelect(c.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{c.client_company}</TableCell>
                      <TableCell className="text-sm">{c.client_name || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.client_email || '—'}</TableCell>
                      <TableCell className="text-center">
                        {status === 'sent' && <Badge variant="outline" className="border-green-300 text-green-700">Enviado</Badge>}
                        {status === 'pending' && <Badge variant="secondary">Pendiente</Badge>}
                        {status === 'error' && <Badge variant="destructive">Error</Badge>}
                        {status === 'sin_email' && <Badge variant="outline" className="text-muted-foreground">Sin email</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        {email && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={sendingId === email.id}>
                                {sendingId === email.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreVertical className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {status === 'pending' && (
                                <DropdownMenuItem onClick={() => handleSendSingle(email.id)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Enviar
                                </DropdownMenuItem>
                              )}
                              {status === 'sent' && (
                                <DropdownMenuItem onClick={() => setResendConfirm({
                                  type: 'single',
                                  emailId: email.id,
                                  companyName: c.client_company || 'esta empresa'
                                })}>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Reenviar email
                                </DropdownMenuItem>
                              )}
                              {status === 'error' && (
                                <DropdownMenuItem onClick={() => setResendConfirm({
                                  type: 'single',
                                  emailId: email.id,
                                  companyName: c.client_company || 'esta empresa'
                                })}>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Reintentar envío
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        {email?.error_message && (
                          <span className="text-xs text-destructive ml-1" title={email.error_message}>
                            {email.error_message.substring(0, 30)}...
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Resend confirmation dialog */}
      <AlertDialog open={!!resendConfirm} onOpenChange={(open) => { if (!open) setResendConfirm(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              ⚠️ Confirmar reenvío
            </AlertDialogTitle>
            <AlertDialogDescription>
              {resendConfirm?.type === 'single'
                ? `Este email ya fue enviado a "${resendConfirm.companyName}". ¿Estás seguro de que quieres reenviarlo?`
                : `¿Estás seguro de que quieres reenviar ${resendConfirm?.count} emails que ya fueron enviados? Esta acción no se puede deshacer.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleResendConfirm}>
              Sí, reenviar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
