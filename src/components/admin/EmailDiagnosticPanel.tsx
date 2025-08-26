import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  Settings, 
  Zap,
  RefreshCw,
  Eye,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning' | 'info';
  message: string;
  details?: string;
  action?: string;
  actionUrl?: string;
}

const EmailDiagnosticPanel = () => {
  const { toast } = useToast();
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [diagnosticProgress, setDiagnosticProgress] = useState(0);

  // Ejecutar diagnóstico completo
  const runFullDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    setDiagnosticProgress(0);
    const results: DiagnosticResult[] = [];

    try {
      // Test 1: Verificar configuración de Resend
      setDiagnosticProgress(10);
      const resendConfigResult = await testResendConfiguration();
      results.push(resendConfigResult);

      // Test 2: Verificar edge function
      setDiagnosticProgress(30);
      const edgeFunctionResult = await testEdgeFunction();
      results.push(edgeFunctionResult);

      // Test 3: Verificar tabla de logs
      setDiagnosticProgress(50);
      const logsTableResult = await testLogsTable();
      results.push(logsTableResult);

      // Test 4: Verificar dominios y DNS
      setDiagnosticProgress(70);
      const domainResult = await testDomainConfiguration();
      results.push(domainResult);

      // Test 5: Verificar historial de envíos
      setDiagnosticProgress(90);
      const historyResult = await testEmailHistory();
      results.push(historyResult);

      setDiagnosticProgress(100);
      setDiagnosticResults(results);

      // Mostrar resumen
      const passedTests = results.filter(r => r.status === 'pass').length;
      const failedTests = results.filter(r => r.status === 'fail').length;

      if (failedTests === 0) {
        toast({
          title: "Diagnóstico completado",
          description: `✅ Todos los tests pasaron (${passedTests}/${results.length})`,
        });
      } else {
        toast({
          title: "Problemas detectados",
          description: `❌ ${failedTests} problemas encontrados de ${results.length} tests`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error running diagnostic:', error);
      toast({
        title: "Error en diagnóstico",
        description: `Error ejecutando tests: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  // Test de configuración de Resend
  const testResendConfiguration = async (): Promise<DiagnosticResult> => {
    try {
      // Intentar usar el edge function de test
      const { data, error } = await supabase.functions.invoke('test-email-config', {
        body: { testEmail: 'test@example.com' }
      });

      if (error) {
        return {
          test: "Configuración de Resend",
          status: "fail",
          message: "Error de configuración",
          details: error.message,
          action: "Configura RESEND_API_KEY en los secretos",
          actionUrl: "https://supabase.com/dashboard/project/fwhqtzkkvnjkazhaficj/settings/functions"
        };
      }

      return {
        test: "Configuración de Resend",
        status: "pass",
        message: "API de Resend configurada correctamente",
        details: "La clave API está presente y funcional"
      };
    } catch (error) {
      return {
        test: "Configuración de Resend",
        status: "fail",
        message: "No se pudo verificar la configuración",
        details: error.message,
        action: "Verificar secretos de edge functions"
      };
    }
  };

  // Test de edge function
  const testEdgeFunction = async (): Promise<DiagnosticResult> => {
    try {
      const { error } = await supabase.functions.invoke('send-user-credentials', {
        body: { 
          email: 'test@test.com',
          fullName: 'Test User',
          temporaryPassword: 'TestPass123',
          role: 'editor'
        }
      });

      if (error && error.message.includes('Missing required')) {
        return {
          test: "Edge Function",
          status: "pass",
          message: "Edge function desplegado y accesible",
          details: "El function responde correctamente a las peticiones"
        };
      }

      return {
        test: "Edge Function",
        status: "warning",
        message: "Edge function funcional con advertencias",
        details: error?.message || "Respuesta inesperada del edge function"
      };
    } catch (error) {
      return {
        test: "Edge Function",
        status: "fail",
        message: "Edge function no accesible",
        details: error.message,
        action: "Verificar despliegue de functions",
        actionUrl: "https://supabase.com/dashboard/project/fwhqtzkkvnjkazhaficj/functions"
      };
    }
  };

  // Test de tabla de logs
  const testLogsTable = async (): Promise<DiagnosticResult> => {
    try {
      const { data, error } = await supabase
        .from('admin_notifications_log')
        .select('count')
        .limit(1);

      if (error) {
        return {
          test: "Tabla de Logs",
          status: "fail",
          message: "No se puede acceder a la tabla de logs",
          details: error.message,
          action: "Verificar políticas RLS y permisos"
        };
      }

      return {
        test: "Tabla de Logs",
        status: "pass",
        message: "Tabla de logs accesible",
        details: "Se pueden registrar y consultar logs de email"
      };
    } catch (error) {
      return {
        test: "Tabla de Logs",
        status: "fail",
        message: "Error consultando tabla de logs",
        details: error.message
      };
    }
  };

  // Test de configuración de dominio
  const testDomainConfiguration = async (): Promise<DiagnosticResult> => {
    // Este test requeriría llamar a la API de Resend para verificar dominios
    // Por simplicidad, asumimos que necesita verificación manual
    return {
      test: "Configuración de Dominio",
      status: "warning",
      message: "Verificación de dominio requerida",
      details: "El dominio necesita ser verificado en Resend para envío desde @capittal.com",
      action: "Verificar dominio en Resend",
      actionUrl: "https://resend.com/domains"
    };
  };

  // Test de historial de emails
  const testEmailHistory = async (): Promise<DiagnosticResult> => {
    try {
      const { data, error } = await supabase
        .from('admin_notifications_log')
        .select('*')
        .eq('notification_type', 'user_credentials')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const recentEmails = data?.length || 0;
      const successfulEmails = data?.filter(log => log.status === 'sent').length || 0;

      if (recentEmails === 0) {
        return {
          test: "Historial de Emails",
          status: "info",
          message: "No hay emails enviados recientemente",
          details: "No se han enviado credenciales de usuario en el sistema"
        };
      }

      const successRate = (successfulEmails / recentEmails) * 100;

      if (successRate > 80) {
        return {
          test: "Historial de Emails",
          status: "pass",
          message: `${successfulEmails}/${recentEmails} emails enviados exitosamente`,
          details: `Tasa de éxito: ${successRate.toFixed(1)}%`
        };
      } else {
        return {
          test: "Historial de Emails",
          status: "warning",
          message: `Baja tasa de éxito: ${successRate.toFixed(1)}%`,
          details: `Solo ${successfulEmails} de ${recentEmails} emails fueron enviados exitosamente`
        };
      }
    } catch (error) {
      return {
        test: "Historial de Emails",
        status: "fail",
        message: "Error consultando historial",
        details: error.message
      };
    }
  };

  // Test de envío real
  const testRealEmailSending = async () => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Por favor ingresa un email para el test",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('test-email-config', {
        body: { testEmail }
      });

      if (error) throw error;

      toast({
        title: "Test de email exitoso",
        description: `Email enviado a ${testEmail}. Revisa tu bandeja de entrada.`,
      });

      // Actualizar diagnóstico después del test
      setTimeout(() => runFullDiagnostic(), 2000);
    } catch (error) {
      toast({
        title: "Test de email fallido",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Ejecutar diagnóstico al montar el componente
  useEffect(() => {
    runFullDiagnostic();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'fail': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'info': return <Clock className="w-4 h-4 text-blue-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-100 text-green-800';
      case 'fail': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Diagnóstico de Email</h2>
          <p className="text-muted-foreground">
            Sistema completo de diagnóstico para identificar problemas de envío de emails
          </p>
        </div>
        <Button 
          onClick={runFullDiagnostic} 
          disabled={isRunningDiagnostic}
          variant="outline"
        >
          {isRunningDiagnostic ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Settings className="w-4 h-4 mr-2" />
          )}
          {isRunningDiagnostic ? 'Ejecutando...' : 'Ejecutar Diagnóstico'}
        </Button>
      </div>

      {/* Progress Bar */}
      {isRunningDiagnostic && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso del diagnóstico</span>
                <span>{diagnosticProgress}%</span>
              </div>
              <Progress value={diagnosticProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test de Envío Directo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Test de Envío Directo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="tu-email@ejemplo.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                type="email"
                className="flex-1"
              />
              <Button onClick={testRealEmailSending}>
                <Mail className="w-4 h-4 mr-2" />
                Enviar Test
              </Button>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Este test enviará un email real de configuración al email especificado. 
                Úsalo para verificar que el sistema está funcionando correctamente.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Resultados del Diagnóstico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Resultados del Diagnóstico ({diagnosticResults.length} tests)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {diagnosticResults.length === 0 && !isRunningDiagnostic && (
              <div className="text-center py-8 text-muted-foreground">
                No hay resultados disponibles. Ejecuta el diagnóstico para comenzar.
              </div>
            )}

            {diagnosticResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.test}</span>
                    <Badge className={getStatusColor(result.status)}>
                      {result.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-2">{result.message}</p>
                
                {result.details && (
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded mb-2">
                    {result.details}
                  </div>
                )}
                
                {result.action && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-medium text-orange-600">Acción requerida:</span>
                    <span className="text-xs text-orange-600">{result.action}</span>
                    {result.actionUrl && (
                      <a 
                        href={result.actionUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Ir
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guía de Solución de Problemas */}
      <Card>
        <CardHeader>
          <CardTitle>Guía de Solución de Problemas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">🔑 Problema: API Key de Resend no configurada</h4>
              <p className="text-muted-foreground mb-2">
                Si ves errores de configuración, necesitas agregar la clave API de Resend.
              </p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4">
                <li>Ve a <a href="https://resend.com/api-keys" className="text-blue-600 underline">Resend API Keys</a></li>
                <li>Crea una nueva API key</li>
                <li>Añádela a los secretos de Supabase como <code>RESEND_API_KEY</code></li>
              </ol>
            </div>

            <div>
              <h4 className="font-medium mb-2">📧 Problema: Dominio no verificado</h4>
              <p className="text-muted-foreground mb-2">
                Para enviar desde @capittal.com necesitas verificar el dominio.
              </p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4">
                <li>Ve a <a href="https://resend.com/domains" className="text-blue-600 underline">Resend Domains</a></li>
                <li>Agrega el dominio capittal.com</li>
                <li>Configura los registros DNS necesarios</li>
              </ol>
            </div>

            <div>
              <h4 className="font-medium mb-2">📮 Problema: Los emails van a spam</h4>
              <p className="text-muted-foreground mb-2">
                Si los emails llegan pero van a spam, verifica la configuración SPF/DKIM.
              </p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4">
                <li>Verifica que los registros DNS estén correctos</li>
                <li>Usa un email "from" verificado</li>
                <li>Evita palabras que activen filtros de spam</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailDiagnosticPanel;