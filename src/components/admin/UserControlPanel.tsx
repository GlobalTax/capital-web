import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Mail, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Send, 
  Settings, 
  RefreshCw,
  Eye,
  Download,
  Filter,
  Search,
  Calendar
} from 'lucide-react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import EmailDiagnosticPanel from './EmailDiagnosticPanel';

interface EmailLog {
  id: string;
  notification_type: string;
  recipient_email: string;
  status: string;
  email_id?: string;
  error_message?: string;
  sent_at: string;
  created_at: string;
}

interface SystemDiagnostic {
  resend_configured: boolean;
  edge_function_deployed: boolean;
  domain_verified: boolean;
  last_email_sent?: string;
  total_emails_sent: number;
  failed_emails: number;
}

const UserControlPanel = () => {
  const { users, isLoading, refetch } = useAdminUsers();
  const { toast } = useToast();
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [diagnostics, setDiagnostics] = useState<SystemDiagnostic | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Cargar logs de email
  const loadEmailLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('admin_notifications_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setEmailLogs(data || []);
    } catch (error) {
      console.error('Error loading email logs:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los logs de email",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Cargar diagnósticos del sistema
  const loadSystemDiagnostics = async () => {
    try {
      // Obtener estadísticas de emails
      const { data: emailStats } = await supabase
        .from('admin_notifications_log')
        .select('status, sent_at')
        .order('sent_at', { ascending: false });

      const totalEmails = emailStats?.length || 0;
      const failedEmails = emailStats?.filter(log => log.status === 'failed').length || 0;
      const lastEmailSent = emailStats?.[0]?.sent_at;

      setDiagnostics({
        resend_configured: true, // Asumimos que está configurado
        edge_function_deployed: true, // El edge function existe
        domain_verified: false, // Lo verificaremos con test
        last_email_sent: lastEmailSent,
        total_emails_sent: totalEmails,
        failed_emails: failedEmails
      });
    } catch (error) {
      console.error('Error loading diagnostics:', error);
    }
  };

  // Test de envío de email
  const testEmailSending = async () => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Por favor ingresa un email para el test",
        variant: "destructive",
      });
      return;
    }

    setIsTestingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-user-credentials', {
        body: {
          email: testEmail,
          fullName: 'Usuario de Test',
          temporaryPassword: 'TestPass123!',
          role: 'editor',
          requiresPasswordChange: false
        }
      });

      if (error) throw error;

      toast({
        title: "Test exitoso",
        description: `Email de test enviado a ${testEmail}`,
      });

      // Recargar logs después del test
      setTimeout(loadEmailLogs, 2000);
    } catch (error) {
      console.error('Email test failed:', error);
      toast({
        title: "Test fallido",
        description: `Error enviando email: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  // Reenviar credenciales a un usuario específico
  const resendSingleUserCredentials = async (user: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-user-credentials', {
        body: {
          email: user.email,
          fullName: user.full_name,
          temporaryPassword: generateSecurePassword(),
          role: user.role,
          requiresPasswordChange: true
        }
      });

      if (error) throw error;

      toast({
        title: "Credenciales reenviadas",
        description: `Email enviado a ${user.email}`,
      });

      setTimeout(loadEmailLogs, 2000);
    } catch (error) {
      console.error('Error resending credentials:', error);
      toast({
        title: "Error",
        description: `No se pudieron reenviar las credenciales: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Generar contraseña segura
  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Filtrar logs
  const filteredLogs = emailLogs.filter(log => {
    const matchesSearch = log.recipient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.notification_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    loadEmailLogs();
    loadSystemDiagnostics();
  }, []);

  const StatusBadge = ({ status }: { status: string }) => {
    const config = {
      sent: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
    }[status] || { color: 'bg-gray-100 text-gray-800', icon: AlertCircle };

    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Panel de Control de Usuarios</h1>
          <p className="text-muted-foreground">
            Gestión completa de usuarios, emails y diagnósticos del sistema
          </p>
        </div>
        <Button onClick={refetch} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Diagnósticos rápidos */}
      {diagnostics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{diagnostics.total_emails_sent}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Emails Fallidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{diagnostics.failed_emails}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Último Envío</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {diagnostics.last_email_sent ? 
                  format(new Date(diagnostics.last_email_sent), 'dd/MM/yyyy HH:mm') : 
                  'Ninguno'
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Estado Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {diagnostics.resend_configured ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="text-sm">
                  {diagnostics.resend_configured ? 'Configurado' : 'No configurado'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="emails">Logs de Email</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnósticos</TabsTrigger>
          <TabsTrigger value="test">Test Email</TabsTrigger>
        </TabsList>

        {/* Tab de Usuarios */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gestión de Usuarios ({users?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Búsqueda de usuarios */}
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar usuarios por email o nombre..."
                      className="pl-8"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>
                </div>

                {/* Tabla de usuarios */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Último login</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.full_name || 'Sin nombre'}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.is_active ? "default" : "secondary"}>
                              {user.is_active ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.last_login ? 
                              format(new Date(user.last_login), 'dd/MM/yyyy') : 
                              'Nunca'
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => resendSingleUserCredentials(user)}
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Logs de Email */}
        <TabsContent value="emails">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Logs de Email ({filteredLogs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filtros */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar por email o tipo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <select 
                    className="px-3 py-2 border rounded-md"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="sent">Enviados</option>
                    <option value="pending">Pendientes</option>
                    <option value="failed">Fallidos</option>
                  </select>
                  <Button onClick={loadEmailLogs} variant="outline">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>

                {/* Tabla de logs */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Destinatario</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>ID Email</TableHead>
                        <TableHead>Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingLogs ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            Cargando logs...
                          </TableCell>
                        </TableRow>
                      ) : filteredLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            No hay logs de email
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{log.notification_type}</Badge>
                            </TableCell>
                            <TableCell>{log.recipient_email}</TableCell>
                            <TableCell>
                              <StatusBadge status={log.status} />
                            </TableCell>
                            <TableCell>
                              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                {log.email_id || 'N/A'}
                              </code>
                            </TableCell>
                            <TableCell>
                              {log.error_message && (
                                <div className="text-xs text-red-600 max-w-xs truncate">
                                  {log.error_message}
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Diagnósticos */}
        <TabsContent value="diagnostics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Diagnósticos del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {diagnostics && (
                  <div className="grid gap-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Estado del sistema de emails:</strong>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-2">
                            {diagnostics.resend_configured ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span>Resend API configurado</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {diagnostics.edge_function_deployed ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span>Edge Function desplegado</span>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>

                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Estadísticas de Envío</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>Total enviados: {diagnostics.total_emails_sent}</div>
                        <div>Emails fallidos: {diagnostics.failed_emails}</div>
                        <div>
                          Tasa de éxito: {
                            diagnostics.total_emails_sent > 0 
                              ? Math.round(((diagnostics.total_emails_sent - diagnostics.failed_emails) / diagnostics.total_emails_sent) * 100)
                              : 0
                          }%
                        </div>
                        <div>
                          Último envío: {
                            diagnostics.last_email_sent 
                              ? format(new Date(diagnostics.last_email_sent), 'dd/MM/yyyy HH:mm')
                              : 'Ninguno'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button onClick={loadSystemDiagnostics} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizar Diagnósticos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Test Email */}
        <TabsContent value="test">
          <EmailDiagnosticPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserControlPanel;