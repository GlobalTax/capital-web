import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, TrendingUp, Users, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AnalyticsData {
  access_date: string;
  access_count: number;
  unique_visitors: number;
  top_utm_sources: string[];
}

const TrackingAnalytics = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Query for analytics data - only loads when authorized
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['tracking-analytics'],
    queryFn: async () => {
      console.log('🔐 Attempting to fetch tracking analytics (super admin only)...');
      
      const { data, error } = await supabase
        .rpc('audit_tracking_data_access');
        
      if (error) {
        console.error('❌ Failed to fetch analytics:', error);
        throw error;
      }
      
      console.log('✅ Analytics data retrieved:', data?.length || 0, 'records');
      return data as AnalyticsData[];
    },
    enabled: isAuthorized, // Only fetch when explicitly authorized
    retry: false // Don't retry on auth failures
  });

  const handleAuthorize = () => {
    setIsAuthorized(true);
  };

  if (!isAuthorized) {
    return (
      <Card className="border-orange-200 bg-orange-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Shield className="h-5 w-5" />
            Restricted Analytics Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This section contains sensitive competitive intelligence data including UTM parameters, 
              visitor behavior patterns, and conversion tracking. Access is restricted to super administrators only.
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 space-y-4">
            <div className="text-sm text-gray-600">
              <p className="font-semibold mb-2">Data Protection Measures Active:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Row Level Security (RLS) enabled</li>
                <li>Super admin access control required</li>
                <li>Access attempts monitored and logged</li>
                <li>Rate limiting on data collection</li>
                <li>Automatic data cleanup (30 days)</li>
              </ul>
            </div>
            
            <Button 
              onClick={handleAuthorize}
              className="w-full"
              variant="outline"
            >
              <Eye className="mr-2 h-4 w-4" />
              Request Access (Super Admin Only)
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Loading Analytics...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-700">
              {error instanceof Error && error.message.includes('Super admin privileges') 
                ? 'Super administrator privileges required to access tracking analytics.'
                : 'Failed to load analytics data. Please check your permissions.'
              }
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={() => setIsAuthorized(false)}
            variant="outline"
            className="mt-4"
          >
            Return to Access Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalVisitors = analyticsData?.reduce((sum, day) => sum + day.unique_visitors, 0) || 0;
  const totalEvents = analyticsData?.reduce((sum, day) => sum + day.access_count, 0) || 0;
  const allUtmSources = Array.from(
    new Set(analyticsData?.flatMap(day => day.top_utm_sources || []) || [])
  );

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Shield className="h-5 w-5" />
            Secure Analytics Dashboard
            <Badge variant="outline" className="ml-auto">Super Admin</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-green-200">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-green-700">
              Access granted. All analytics viewing is monitored and logged for security purposes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Unique Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{totalVisitors.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{totalEvents.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Tracked interactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{allUtmSources.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Unique UTM sources</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Analytics Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {analyticsData?.map((day, index) => (
              <div 
                key={day.access_date} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium">
                    {new Date(day.access_date).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {day.unique_visitors} visitors • {day.access_count} events
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {day.top_utm_sources?.slice(0, 3).map((source, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {source}
                    </Badge>
                  ))}
                  {(day.top_utm_sources?.length || 0) > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{(day.top_utm_sources?.length || 0) - 3}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Security Notice</p>
              <p className="text-blue-700">
                This analytics data is automatically cleaned up every 30 days. 
                All access to this data is logged and monitored. Only super administrators 
                can view this sensitive competitive intelligence information.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackingAnalytics;