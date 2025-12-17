import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, AlertCircle, Clock, Send } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Campaign {
  id: string;
  subject: string;
  operations_included: string[];
  recipients_count: number;
  sent_at: string | null;
  status: string;
  open_count: number;
  click_count: number;
  created_at: string;
}

interface CampaignHistoryProps {
  campaigns: Campaign[];
  isLoading: boolean;
}

function getStatusBadge(status: string) {
  const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
    sent: { label: "Enviado", variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
    sending: { label: "Enviando", variant: "secondary", icon: <Send className="h-3 w-3 animate-pulse" /> },
    draft: { label: "Borrador", variant: "outline", icon: <Clock className="h-3 w-3" /> },
    failed: { label: "Error", variant: "destructive", icon: <AlertCircle className="h-3 w-3" /> },
    scheduled: { label: "Programado", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
  };
  const { label, variant, icon } = config[status] || config.draft;
  return (
    <Badge variant={variant} className="gap-1">
      {icon}
      {label}
    </Badge>
  );
}

export const CampaignHistory: React.FC<CampaignHistoryProps> = ({ campaigns, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Campañas</CardTitle>
          <CardDescription>Newsletters enviados anteriormente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Campañas</CardTitle>
        <CardDescription>
          {campaigns.length} newsletters enviados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {campaigns.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Asunto</TableHead>
                <TableHead className="text-center">Operaciones</TableHead>
                <TableHead className="text-center">Enviados</TableHead>
                <TableHead className="text-center">Aperturas</TableHead>
                <TableHead className="text-center">Clicks</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="whitespace-nowrap">
                    {campaign.sent_at 
                      ? format(new Date(campaign.sent_at), "d MMM yyyy", { locale: es })
                      : format(new Date(campaign.created_at), "d MMM yyyy", { locale: es })
                    }
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate font-medium">
                    {campaign.subject}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{campaign.operations_included?.length || 0}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {campaign.recipients_count}
                  </TableCell>
                  <TableCell className="text-center">
                    {campaign.open_count}
                  </TableCell>
                  <TableCell className="text-center">
                    {campaign.click_count}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(campaign.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay campañas registradas</p>
            <p className="text-sm">Crea tu primer newsletter para empezar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
