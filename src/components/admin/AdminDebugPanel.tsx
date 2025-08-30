import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Bug, 
  RefreshCw, 
  Database, 
  User, 
  Shield, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const AdminDebugPanel: React.FC = () => {
  const { user, session, isAdmin, isLoading, forceAdminReload, getDebugInfo, checkAdminStatus } = useAuth();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<any>(null);
  const [adminData, setAdminData] = useState<any>(null);

  const debugInfo = getDebugInfo();

  const testDatabaseConnection = async () => {
    setIsTestingConnection(true);
    setConnectionResult(null);
    
    try {
      console.log('🔍 Testing database connection...');
      
      // Test 1: Basic connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from('admin_users')
        .select('count')
        .limit(1);

      if (connectionError) {
        throw new Error(`Connection failed: ${connectionError.message}`);
      }

      // Test 2: Get current user admin record
      if (user?.id) {
        const { data: adminRecord, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        setAdminData(adminRecord);
        
        setConnectionResult({
          success: true,
          hasAdminRecord: !!adminRecord,
          adminRecord,
          connectionTest: 'OK',
          timestamp: new Date().toISOString()
        });
      } else {
        setConnectionResult({
          success: true,
          hasAdminRecord: false,
          adminRecord: null,
          connectionTest: 'OK',
          noUser: true,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error: any) {
      console.error('🔍 Database test failed:', error);
      setConnectionResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleForceAdminCheck = async () => {
    console.log('🔄 Force admin check initiated from debug panel');
    await forceAdminReload();
    await testDatabaseConnection();
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Admin Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4" />
                <span className="font-medium">Authentication</span>
              </div>
              <div className="space-y-2">
                <Badge variant={user ? "default" : "destructive"}>
                  {user ? "Authenticated" : "Not Authenticated"}
                </Badge>
                {user && (
                  <p className="text-sm text-gray-600">
                    {user.email}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Admin Status</span>
              </div>
              <div className="space-y-2">
                <Badge variant={isAdmin ? "default" : "destructive"}>
                  {isAdmin ? "Admin Access" : "No Admin Access"}
                </Badge>
                {isLoading && (
                  <Badge variant="secondary">Loading...</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4" />
                <span className="font-medium">Database</span>
              </div>
              <div className="space-y-2">
                <Badge variant={connectionResult?.success ? "default" : "secondary"}>
                  {connectionResult?.success ? "Connected" : "Unknown"}
                </Badge>
                {adminData && (
                  <Badge variant={adminData.is_active ? "default" : "destructive"}>
                    {adminData.is_active ? "Active Record" : "Inactive Record"}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={handleForceAdminCheck}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Force Admin Reload
          </Button>
          
          <Button 
            onClick={testDatabaseConnection}
            disabled={isTestingConnection}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            {isTestingConnection ? "Testing..." : "Test DB Connection"}
          </Button>
        </div>

        {/* Debug Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Current State</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Connection Test Results */}
        {connectionResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                {connectionResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                Database Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                {JSON.stringify(connectionResult, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Admin Record Details */}
        {adminData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Admin Record</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Active:</span>
                  <Badge variant={adminData.is_active ? "default" : "destructive"}>
                    {adminData.is_active ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Role:</span>
                  <Badge variant="secondary">{adminData.role}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Needs Credentials:</span>
                  <Badge variant={adminData.needs_credentials ? "destructive" : "default"}>
                    {adminData.needs_credentials ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emergency Actions */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Si el problema persiste, intenta:
            1. Cerrar sesión y volver a iniciar sesión
            2. Limpiar caché del navegador
            3. Usar el enlace de recuperación de admin
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};