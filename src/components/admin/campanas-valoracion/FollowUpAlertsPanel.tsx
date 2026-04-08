import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Bell, ChevronDown, ChevronRight, ArrowRight, CheckCircle2 } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CompanyFollowUp {
  companyId: string;
  companyName: string;
  seguimientoEstado: string;
  initialSentAt: Date | null;
  lastFollowUpAt: Date | null;
  lastContactDate: Date;
  daysSinceContact: number;
}

interface CampaignFollowUp {
  campaignId: string;
  campaignName: string;
  sector: string | null;
  reminderDays: number;
  sendDates: { date: string; count: number }[];
  companies: CompanyFollowUp[];
  pendingCount: number;
  totalNoResponse: number;
}

interface FollowUpAlertsPanelProps {
  onNavigateToCampaign?: (campaignId: string) => void;
}

export function FollowUpAlertsPanel({ onNavigateToCampaign }: FollowUpAlertsPanelProps) {
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());

  const { data: campaignFollowUps, isLoading } = useQuery<CampaignFollowUp[]>({
    queryKey: ['followup-detailed-alerts'],
    queryFn: async () => {
      // 1. Campaigns with followup_reminder_days
      const { data: campaigns } = await (supabase as any)
        .from('valuation_campaigns')
        .select('id, name, sector, followup_reminder_days')
        .not('followup_reminder_days', 'is', null);

      if (!campaigns?.length) return [];

      const ids = campaigns.map((c: any) => c.id);

      // 2. Fetch all related data in parallel
      const [{ data: emails }, { data: followups }, { data: companies }] = await Promise.all([
        (supabase as any)
          .from('campaign_emails')
          .select('campaign_id, company_id, sent_at')
          .in('campaign_id', ids)
          .eq('status', 'sent')
          .order('sent_at', { ascending: true }),
        (supabase as any)
          .from('campaign_followup_sends')
          .select('campaign_id, company_id, sent_at')
          .in('campaign_id', ids)
          .eq('status', 'sent')
          .order('sent_at', { ascending: true }),
        (supabase as any)
          .from('valuation_campaign_companies')
          .select('id, campaign_id, client_company, seguimiento_estado')
          .in('campaign_id', ids),
      ]);

      const now = new Date();

      // 3. Index emails by campaign+company (first sent = initial)
      const emailMap: Record<string, Record<string, Date>> = {};
      for (const e of (emails || [])) {
        if (!e.sent_at || !e.company_id) continue;
        if (!emailMap[e.campaign_id]) emailMap[e.campaign_id] = {};
        // Keep earliest (initial send)
        const d = new Date(e.sent_at);
        if (!emailMap[e.campaign_id][e.company_id] || d < emailMap[e.campaign_id][e.company_id]) {
          emailMap[e.campaign_id][e.company_id] = d;
        }
      }

      // 4. Index follow-ups by campaign+company (latest)
      const fuMap: Record<string, Record<string, Date>> = {};
      for (const f of (followups || [])) {
        if (!f.sent_at || !f.company_id) continue;
        if (!fuMap[f.campaign_id]) fuMap[f.campaign_id] = {};
        const d = new Date(f.sent_at);
        if (!fuMap[f.campaign_id][f.company_id] || d > fuMap[f.campaign_id][f.company_id]) {
          fuMap[f.campaign_id][f.company_id] = d;
        }
      }

      // 5. Compute send date distribution per campaign
      const sendDateMap: Record<string, Record<string, number>> = {};
      for (const e of (emails || [])) {
        if (!e.sent_at) continue;
        const dateKey = format(new Date(e.sent_at), 'yyyy-MM-dd');
        if (!sendDateMap[e.campaign_id]) sendDateMap[e.campaign_id] = {};
        sendDateMap[e.campaign_id][dateKey] = (sendDateMap[e.campaign_id][dateKey] || 0) + 1;
      }

      // 6. Build per-campaign data
      const result: CampaignFollowUp[] = [];

      for (const camp of campaigns) {
        const campaignCompanies = (companies || []).filter((c: any) => c.campaign_id === camp.id);
        const companyResults: CompanyFollowUp[] = [];
        let totalNoResponse = 0;

        for (const comp of campaignCompanies) {
          const estado = comp.seguimiento_estado || 'sin_respuesta';
          if (estado !== 'sin_respuesta') continue;
          totalNoResponse++;

          const initialSent = emailMap[camp.id]?.[comp.id] || null;
          if (!initialSent) continue; // Not sent yet

          const lastFU = fuMap[camp.id]?.[comp.id] || null;
          const lastContact = lastFU && lastFU > initialSent ? lastFU : initialSent;
          const daysSince = differenceInDays(now, lastContact);

          if (daysSince >= camp.followup_reminder_days) {
            companyResults.push({
              companyId: comp.id,
              companyName: comp.client_company || 'Sin nombre',
              seguimientoEstado: estado,
              initialSentAt: initialSent,
              lastFollowUpAt: lastFU,
              lastContactDate: lastContact,
              daysSinceContact: daysSince,
            });
          }
        }

        if (companyResults.length === 0) continue;

        // Sort by days descending
        companyResults.sort((a, b) => b.daysSinceContact - a.daysSinceContact);

        // Send dates
        const dates = sendDateMap[camp.id] || {};
        const sendDates = Object.entries(dates)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, count]) => ({ date, count }));

        result.push({
          campaignId: camp.id,
          campaignName: camp.name,
          sector: camp.sector,
          reminderDays: camp.followup_reminder_days,
          sendDates,
          companies: companyResults,
          pendingCount: companyResults.length,
          totalNoResponse,
        });
      }

      return result.sort((a, b) => b.pendingCount - a.pendingCount);
    },
    staleTime: 60_000,
  });

  const toggleCampaign = (id: string) => {
    setExpandedCampaigns(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalPending = useMemo(() =>
    (campaignFollowUps || []).reduce((sum, c) => sum + c.pendingCount, 0),
    [campaignFollowUps]
  );

  if (isLoading || !campaignFollowUps) return null;

  if (campaignFollowUps.length === 0) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardContent className="p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-700 font-medium">Follow-up al día — No hay empresas pendientes de seguimiento</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-300 bg-amber-50/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-800">
            Follow-up pendiente ({campaignFollowUps.length} campaña{campaignFollowUps.length > 1 ? 's' : ''}, {totalPending} empresa{totalPending > 1 ? 's' : ''})
          </span>
        </div>

        <div className="space-y-2">
          {campaignFollowUps.map((camp) => {
            const isExpanded = expandedCampaigns.has(camp.campaignId);
            return (
              <Collapsible key={camp.campaignId} open={isExpanded} onOpenChange={() => toggleCampaign(camp.campaignId)}>
                <div className="rounded-lg bg-white border border-amber-200 shadow-sm overflow-hidden">
                  {/* Campaign header */}
                  <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center gap-3 p-3 hover:bg-amber-50/50 transition-colors text-left">
                      {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{camp.campaignName}</span>
                          {camp.sector && <Badge variant="secondary" className="text-[10px] h-5">{camp.sector}</Badge>}
                          <Badge variant="outline" className="text-[10px] h-5">FU: {camp.reminderDays}d</Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-muted-foreground">Envíos:</span>
                          {camp.sendDates.map(sd => (
                            <Badge key={sd.date} variant="secondary" className="text-[10px] h-5 font-normal">
                              {format(new Date(sd.date), 'd MMM', { locale: es })}: {sd.count}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-amber-700 mt-1 font-medium">
                          {camp.pendingCount} pendiente{camp.pendingCount > 1 ? 's' : ''} de FU
                          <span className="text-muted-foreground font-normal"> · {camp.totalNoResponse} sin respuesta total</span>
                        </p>
                      </div>
                      {onNavigateToCampaign && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs shrink-0"
                          onClick={(e) => { e.stopPropagation(); onNavigateToCampaign(camp.campaignId); }}
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </button>
                  </CollapsibleTrigger>

                  {/* Company detail table */}
                  <CollapsibleContent>
                    <div className="border-t border-amber-100">
                      <Table density="compact">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-[11px]">Empresa</TableHead>
                            <TableHead className="text-[11px]">Enviado</TableHead>
                            <TableHead className="text-[11px]">Último FU</TableHead>
                            <TableHead className="text-[11px] text-right">Días</TableHead>
                            <TableHead className="text-[11px] w-10"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {camp.companies.map((comp) => {
                            const ratio = comp.daysSinceContact / camp.reminderDays;
                            const statusColor = ratio >= 1.5 ? 'text-red-500' : ratio >= 1 ? 'text-amber-500' : 'text-muted-foreground';
                            const dot = ratio >= 1.5 ? '🔴' : '🟡';
                            return (
                              <TableRow key={comp.companyId}>
                                <TableCell className="text-xs font-medium truncate max-w-[200px]">{comp.companyName}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {comp.initialSentAt ? format(comp.initialSentAt, 'd MMM', { locale: es }) : '—'}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {comp.lastFollowUpAt ? format(comp.lastFollowUpAt, 'd MMM', { locale: es }) : '—'}
                                </TableCell>
                                <TableCell className={`text-xs text-right font-medium ${statusColor}`}>
                                  {comp.daysSinceContact}d
                                </TableCell>
                                <TableCell className="text-center text-xs">{dot}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
