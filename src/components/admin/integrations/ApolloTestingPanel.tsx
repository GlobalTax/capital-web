
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Play, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  test: string;
  status: 'success' | 'error' | 'running';
  message: string;
  data?: any;
}

const ApolloTestingPanel = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testDomain, setTestDomain] = useState('microsoft.com');
  const { toast } = useToast();

  const updateTestResult = (test: string, status: 'success' | 'error' | 'running', message: string, data?: any) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.test === test);
      if (existing) {
        existing.status = status;
        existing.message = message;
        existing.data = data;
        return [...prev];
      }
      return [...prev, { test, status, message, data }];
    });
  };

  const runComprehensiveTest = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: Verificar conexión a Supabase
      updateTestResult('supabase-connection', 'running', 'Verificando conexión a Supabase...');
      
      const { data: healthCheck, error: healthError } = await supabase
        .from('integration_logs')
        .select('count')
        .limit(1);

      if (healthError) {
        updateTestResult('supabase-connection', 'error', `Error de conexión: ${healthError.message}`);
        return;
      }

      updateTestResult('supabase-connection', 'success', 'Conexión a Supabase OK');

      // Test 2: Verificar tablas Apollo
      updateTestResult('apollo-tables', 'running', 'Verificando tablas Apollo...');
      
      const { data: companies, error: companiesError } = await supabase
        .from('apollo_companies')
        .select('count');

      const { data: contacts, error: contactsError } = await supabase
        .from('apollo_contacts')
        .select('count');

      if (companiesError || contactsError) {
        updateTestResult('apollo-tables', 'error', 'Error accediendo a tablas Apollo');
        return;
      }

      updateTestResult('apollo-tables', 'success', `Tablas Apollo OK - Companies: ${companies?.length || 0}, Contacts: ${contacts?.length || 0}`);

      // Test 3: Probar Edge Function de enriquecimiento
      updateTestResult('apollo-enrichment', 'running', `Probando enriquecimiento con ${testDomain}...`);
      
      const { data: enrichResult, error: enrichError } = await supabase.functions.invoke('apollo-company-enrichment', {
        body: { company_domain: testDomain }
      });

      if (enrichError) {
        updateTestResult('apollo-enrichment', 'error', `Error en enriquecimiento: ${enrichError.message}`);
      } else {
        updateTestResult('apollo-enrichment', 'success', `Enriquecimiento exitoso para ${testDomain}`, enrichResult);
        
        // Test 4: Probar enriquecimiento de contactos
        updateTestResult('apollo-contacts', 'running', `Enriqueciendo contactos para ${testDomain}...`);
        
        const { data: contactsResult, error: contactsError } = await supabase.functions.invoke('apollo-contacts-enrichment', {
          body: { company_domain: testDomain }
        });

        if (contactsError) {
          updateTestResult('apollo-contacts', 'error', `Error enriqueciendo contactos: ${contactsError.message}`);
        } else {
          updateTestResult('apollo-contacts', 'success', `Contactos enriquecidos: ${contactsResult?.contacts_found || 0} encontrados`, contactsResult);
        }
      }

      // Test 5: Verificar datos finales
      updateTestResult('final-verification', 'running', 'Verificando datos finales...');
      
      const { data: finalCompanies } = await supabase
        .from('apollo_companies')
        .select('*')
        .eq('company_domain', testDomain);

      const { data: finalContacts } = await supabase
        .from('apollo_contacts')
        .select('*')
        .eq('company_domain', testDomain);

      const { data: logs } = await supabase
        .from('integration_logs')
        .select('*')
        .eq('company_domain', testDomain)
        .order('created_at', { ascending: false })
        .limit(5);

      updateTestResult('final-verification', 'success', 
        `Verificación completa - Empresa: ${finalCompanies?.length ? 'OK' : 'NO'}, Contactos: ${finalContacts?.length || 0}, Logs: ${logs?.length || 0}`
      );

      toast({
        title: "Testing completado",
        description: "Revisa los resultados para ver el estado de cada componente",
      });

    } catch (error) {
      console.error('Error en testing:', error);
      updateTestResult('general-error', 'error', `Error general: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const addSampleData = async () => {
    try {
      const sampleDomains = ['google.com', 'apple.com', 'salesforce.com'];
      
      for (const domain of sampleDomains) {
        await supabase.functions.invoke('apollo-company-enrichment', {
          body: { company_domain: domain }
        });
        
        // Esperar un poco entre requests para no saturar la API
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      toast({
        title: "Datos de prueba añadidos",
        description: "Se han enriquecido 3 empresas como datos de prueba",
      });

    } catch (error) {
      toast({
        title: "Error añadiendo datos",
        description: "No se pudieron añadir los datos de prueba",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Panel de Testing Apollo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Dominio para probar</label>
              <Input
                value={testDomain}
                onChange={(e) => setTestDomain(e.target.value)}
                placeholder="ejemplo.com"
              />
            </div>
            <Button 
              onClick={runComprehensiveTest} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {isRunning ? 'Ejecutando...' : 'Ejecutar Test Completo'}
            </Button>
            <Button 
              onClick={addSampleData} 
              variant="outline"
              disabled={isRunning}
            >
              Añadir Datos de Prueba
            </Button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-3 mt-6">
              <h3 className="font-semibold">Resultados del Testing:</h3>
              {testResults.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{result.test}</span>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{result.message}</p>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-600 cursor-pointer">Ver datos</summary>
                        <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApolloTestingPanel;
