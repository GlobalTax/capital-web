import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, MessageSquare, Mail } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ValuationData {
  whatsapp_sent: boolean;
  whatsapp_sent_at: string | null;
  email_sent: boolean;
  email_sent_at: string | null;
}

interface MessageLog {
  id: string;
  type: string;
  status: string;
  recipient: string | null;
  provider_name: string | null;
  error_details: string | null;
  created_at: string;
}

interface CommunicationStatusProps {
  valuation: ValuationData;
  latestWhatsapp: MessageLog | null;
  latestEmail: MessageLog | null;
}

const CommunicationStatus: React.FC<CommunicationStatusProps> = ({
  valuation,
  latestWhatsapp,
  latestEmail
}) => {
  const getStatusBadge = (sent: boolean, sentAt: string | null, log: MessageLog | null) => {
    if (!sent) {
      return <Badge variant="outline" className="text-muted-foreground"><Clock className="w-3 h-3 mr-1" />No enviado</Badge>;
    }

    if (log?.status === 'error') {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
    }

    if (log?.status === 'success' || sent) {
      return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Enviado</Badge>;
    }

    return <Badge variant="warning"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp);
    return format(date, "dd/MM/yyyy 'a las' HH:mm", { locale: es });
  };

  const formatRelativeTime = (timestamp: string | null) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Estados de Comunicación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* WhatsApp Status */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium">WhatsApp</p>
              {valuation.whatsapp_sent_at && (
                <p className="text-sm text-muted-foreground">
                  {formatTimestamp(valuation.whatsapp_sent_at)} 
                  <span className="ml-1">({formatRelativeTime(valuation.whatsapp_sent_at)})</span>
                </p>
              )}
              {latestWhatsapp?.error_details && (
                <p className="text-sm text-destructive mt-1">
                  {latestWhatsapp.error_details}
                </p>
              )}
            </div>
          </div>
          {getStatusBadge(valuation.whatsapp_sent, valuation.whatsapp_sent_at, latestWhatsapp)}
        </div>

        {/* Email Status */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium">Email</p>
              {valuation.email_sent_at && (
                <p className="text-sm text-muted-foreground">
                  {formatTimestamp(valuation.email_sent_at)}
                  <span className="ml-1">({formatRelativeTime(valuation.email_sent_at)})</span>
                </p>
              )}
              {latestEmail?.error_details && (
                <p className="text-sm text-destructive mt-1">
                  {latestEmail.error_details}
                </p>
              )}
            </div>
          </div>
          {getStatusBadge(valuation.email_sent, valuation.email_sent_at, latestEmail)}
        </div>

      </CardContent>
    </Card>
  );
};

export default CommunicationStatus;