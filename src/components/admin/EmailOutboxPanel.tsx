import React, { useState } from 'react';
import { useEmailOutbox, EmailOutboxFilters, EmailOutboxEntry } from '@/hooks/useEmailOutbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, RotateCcw, Mail, AlertCircle, CheckCircle, Clock, Send, ChevronDown, Trash2, AlertTriangle, Beaker } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
  sending: { label: 'Enviando', color: 'bg-blue-100 text-blue-800', icon: <Send className="h-3 w-3" /> },
  sent: { label: 'Enviado', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
  failed: { label: 'Fallido', color: 'bg-red-100 text-red-800', icon: <AlertCircle className="h-3 w-3" /> },
  retrying: { label: 'Reintentando', color: 'bg-orange-100 text-orange-800', icon: <RotateCcw className="h-3 w-3" /> },
};

// Helper to detect provider errors in entries marked as "sent"
const hasProviderError = (entry: EmailOutboxEntry): boolean => {
  if (entry.status !== 'sent') return false;
  if (entry.provider_message_id) return false;
  
  const response = entry.provider_response as any;
  if (!response) return true;
  if (response.error) return true;
  if (!response.data?.id) return true;
  
  return false;
};

const EmailOutboxPanel: React.FC = () => {
  const [filters, setFilters] = useState<EmailOutboxFilters>({});
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const {
    entries,
    stats,
    isLoading,
    refetch,
    retryEmail,
    retryAllFailed,
    cleanupOldEntries,
    fixFalsePositives,
    isRetrying,
    isFixingFalsePositives
  } = useEmailOutbox(filters);

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return format(new Date(dateStr), 'dd/MM/yyyy HH:mm', { locale: es });
  };

  const testEmailConfig = async () => {
    setIsTestingEmail(true);
    setTestResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('test-email-config', {
        body: { recipientEmail: 'samuel@capittal.es' }
      });
      
      if (error) throw error;
      
      setTestResult({
        success: data.success,
        message: data.success 
          ? `✅ Email enviado (ID: ${data.messageId?.slice(0, 8)}...)`
          : `❌ ${data.error}`
      });
      
      if (data.success) {
        toast.success(`Email de prueba enviado a ${data.recipient}`);
      } else {
        toast.error(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `❌ ${err.message}`
      });
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsTestingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email Outbox</h1>
          <p className="text-muted-foreground">Monitorización y gestión de envío de emails</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refrescar
          </Button>
          {stats.failed > 0 && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => retryAllFailed()}
              disabled={isRetrying}
            >
              <RotateCcw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              Reintentar todos ({stats.failed})
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Enviados</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-muted-foreground">Fallidos</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Pendientes</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Reintentando</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{stats.retrying}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-muted-foreground">Falsos +</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{stats.falsePositives}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Tasa éxito</span>
            </div>
            <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Test Email Config Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Beaker className="h-4 w-4" />
            Test de Configuración
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <Button 
              onClick={testEmailConfig} 
              disabled={isTestingEmail}
              variant="outline"
            >
              {isTestingEmail ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Email de Prueba
                </>
              )}
            </Button>
            {testResult && (
              <Badge className={testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {testResult.message}
              </Badge>
            )}
            {stats.falsePositives > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fixFalsePositives()}
                disabled={isFixingFalsePositives}
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                {isFixingFalsePositives ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <AlertTriangle className="h-4 w-4 mr-2" />
                )}
                Corregir {stats.falsePositives} falso(s) positivo(s)
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Envía un email de prueba a samuel@capittal.es para verificar la configuración de Resend.
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-48">
              <Select 
                value={filters.status || 'all'} 
                onValueChange={(v) => setFilters({ ...filters, status: v === 'all' ? undefined : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="sent">Enviados</SelectItem>
                  <SelectItem value="failed">Fallidos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="retrying">Reintentando</SelectItem>
                  <SelectItem value="sending">Enviando</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Select 
                value={filters.valuation_type || 'all'} 
                onValueChange={(v) => setFilters({ ...filters, valuation_type: v === 'all' ? undefined : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="standard">Automática</SelectItem>
                  <SelectItem value="professional">Profesional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Buscar por email o asunto..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => cleanupOldEntries()}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar antiguos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Intentos</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead>Enviado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {isLoading ? 'Cargando...' : 'No hay emails en el outbox'}
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry: EmailOutboxEntry) => (
                  <React.Fragment key={entry.id}>
                    <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRow(entry.id)}>
                      <TableCell>
                        <ChevronDown 
                          className={`h-4 w-4 transition-transform ${expandedRows.has(entry.id) ? 'rotate-180' : ''}`} 
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium truncate max-w-[200px]">{entry.recipient_email}</p>
                          {entry.recipient_name && (
                            <p className="text-xs text-muted-foreground">{entry.recipient_name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {entry.valuation_type === 'professional' ? 'Pro' : 'Auto'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Badge className={`${statusConfig[entry.status]?.color || 'bg-gray-100'} flex items-center gap-1 w-fit`}>
                            {statusConfig[entry.status]?.icon}
                            {statusConfig[entry.status]?.label || entry.status}
                          </Badge>
                          {hasProviderError(entry) && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                              ⚠️ Error proveedor
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={entry.attempts >= entry.max_attempts ? 'text-red-600 font-medium' : ''}>
                          {entry.attempts}/{entry.max_attempts}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(entry.created_at)}</TableCell>
                      <TableCell className="text-sm">{formatDate(entry.sent_at)}</TableCell>
                      <TableCell className="text-right">
                        {(entry.status === 'failed' || entry.status === 'retrying') && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); retryEmail(entry.id); }}
                            disabled={isRetrying}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(entry.id) && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-muted/30 p-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium mb-2">Detalles</p>
                              <dl className="space-y-1">
                                <div className="flex gap-2">
                                  <dt className="text-muted-foreground">Asunto:</dt>
                                  <dd className="truncate">{entry.subject || '-'}</dd>
                                </div>
                                <div className="flex gap-2">
                                  <dt className="text-muted-foreground">ID Valoración:</dt>
                                  <dd className="font-mono text-xs">{entry.valuation_id || '-'}</dd>
                                </div>
                                <div className="flex gap-2">
                                  <dt className="text-muted-foreground">Message ID:</dt>
                                  <dd className="font-mono text-xs truncate">{entry.provider_message_id || '-'}</dd>
                                </div>
                                <div className="flex gap-2">
                                  <dt className="text-muted-foreground">Primer intento:</dt>
                                  <dd>{formatDate(entry.first_attempt_at)}</dd>
                                </div>
                                <div className="flex gap-2">
                                  <dt className="text-muted-foreground">Último intento:</dt>
                                  <dd>{formatDate(entry.last_attempt_at)}</dd>
                                </div>
                                {entry.next_retry_at && (
                                  <div className="flex gap-2">
                                    <dt className="text-muted-foreground">Próximo reintento:</dt>
                                    <dd>{formatDate(entry.next_retry_at)}</dd>
                                  </div>
                                )}
                              </dl>
                            </div>
                            {entry.last_error && (
                              <div>
                                <p className="font-medium mb-2 text-red-600">Error</p>
                                <div className="bg-red-50 border border-red-200 rounded p-2">
                                  <p className="text-red-800 text-xs break-all">{entry.last_error}</p>
                                  {entry.error_details && (
                                    <pre className="mt-2 text-xs text-red-700 overflow-auto max-h-32">
                                      {JSON.stringify(entry.error_details, null, 2)}
                                    </pre>
                                  )}
                                </div>
                              </div>
                            )}
                            {entry.metadata && (
                              <div className="col-span-2">
                                <p className="font-medium mb-2">Metadata</p>
                                <pre className="bg-muted rounded p-2 text-xs overflow-auto max-h-32">
                                  {JSON.stringify(entry.metadata, null, 2)}
                                </pre>
                              </div>
                            )}
                            {entry.provider_response && (
                              <div className="col-span-2">
                                <p className="font-medium mb-2">Respuesta del Proveedor</p>
                                <pre className={`rounded p-2 text-xs overflow-auto max-h-32 ${
                                  hasProviderError(entry) ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-muted'
                                }`}>
                                  {JSON.stringify(entry.provider_response, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailOutboxPanel;
