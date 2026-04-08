import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { differenceInDays } from 'date-fns';

interface FollowUpAlert {
  campaignId: string;
  campaignName: string;
  sector: string | null;
  reminderDays: number;
  daysSinceLastSend: number;
  companiesWithoutResponse: number;
}

interface FollowUpAlertsPanelProps {
  onNavigateToCampaign?: (campaignId: string) => void;
}

export function FollowUpAlertsPanel({ onNavigateToCampaign }: FollowUpAlertsPanelProps) {
  const { data: alerts, isLoading } = useQuery<FollowUpAlert[]>({
    queryKey: ['followup-alerts'],
    queryFn: async () => {
      // 1. Get campaigns with followup_reminder_days set
      const { data: campaigns } = await (supabase as any)
        .from('valuation_campaigns')
        .select('id, name, sector, followup_reminder_days')
        .not('followup_reminder_days', 'is', null);

      if (!campaigns?.length) return [];

      const ids = campaigns.map((c: any) => c.id);

      // 2. Get last send dates from campaign_emails and campaign_followup_sends
      const [{ data: emails }, { data: followups }, { data: companies }] = await Promise.all([
        (supabase as any)
          .from('campaign_emails')
          .select('campaign_id, sent_at')
          .in('campaign_id', ids)
          .eq('status', 'sent')
          .order('sent_at', { ascending: false }),
        (supabase as any)
          .from('campaign_followup_sends')
          .select('campaign_id, sent_at')
          .in('campaign_id', ids)
          .order('sent_at', { ascending: false }),
        (supabase as any)
          .from('valuation_campaign_companies')
          .select('campaign_id, seguimiento_estado')
          .in('campaign_id', ids),
      ]);

      // 3. Calculate last send per campaign
      const lastSendMap: Record<string, Date> = {};
      for (const e of (emails || [])) {
        if (!e.sent_at) continue;
        const d = new Date(e.sent_at);
        if (!lastSendMap[e.campaign_id] || d > lastSendMap[e.campaign_id]) {
          lastSendMap[e.campaign_id] = d;
        }
      }
      for (const f of (followups || [])) {
        if (!f.sent_at) continue;
        const d = new Date(f.sent_at);
        if (!lastSendMap[f.campaign_id] || d > lastSendMap[f.campaign_id]) {
          lastSendMap[f.campaign_id] = d;
        }
      }

      // 4. Count companies without response per campaign
      const noResponseMap: Record<string, number> = {};
      for (const c of (companies || [])) {
        const estado = c.seguimiento_estado || 'sin_respuesta';
        if (estado === 'sin_respuesta') {
          noResponseMap[c.campaign_id] = (noResponseMap[c.campaign_id] || 0) + 1;
        }
      }

      // 5. Build alerts
      const now = new Date();
      const result: FollowUpAlert[] = [];

      for (const camp of campaigns) {
        const lastSend = lastSendMap[camp.id];
        if (!lastSend) continue; // No sends yet

        const daysSince = differenceInDays(now, lastSend);
        if (daysSince >= camp.followup_reminder_days) {
          result.push({
            campaignId: camp.id,
            campaignName: camp.name,
            sector: camp.sector,
            reminderDays: camp.followup_reminder_days,
            daysSinceLastSend: daysSince,
            companiesWithoutResponse: noResponseMap[camp.id] || 0,
          });
        }
      }

      return result.sort((a, b) => b.daysSinceLastSend - a.daysSinceLastSend);
    },
    staleTime: 60_000,
  });

  if (isLoading || !alerts) return null;

  if (alerts.length === 0) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardContent className="p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-700 font-medium">Follow-up al día — No hay campañas pendientes de seguimiento</p>
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
            Follow-up pendiente ({alerts.length} campaña{alerts.length > 1 ? 's' : ''})
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {alerts.map((alert) => (
            <div
              key={alert.campaignId}
              className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white border border-amber-200 shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{alert.campaignName}</p>
                <div className="flex items-center gap-2 mt-1">
                  {alert.sector && (
                    <Badge variant="secondary" className="text-[10px] h-5">{alert.sector}</Badge>
                  )}
                  <span className="flex items-center gap-1 text-xs text-amber-700">
                    <Clock className="h-3 w-3" />
                    {alert.daysSinceLastSend}d sin envío
                  </span>
                  {alert.companiesWithoutResponse > 0 && (
                    <span className="text-xs text-muted-foreground">
                      · {alert.companiesWithoutResponse} sin respuesta
                    </span>
                  )}
                </div>
              </div>
              {onNavigateToCampaign && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs shrink-0"
                  onClick={() => onNavigateToCampaign(alert.campaignId)}
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
