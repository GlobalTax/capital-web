// ============= ADMIN OFFLINE MODE COMPONENT =============
// Provides basic admin functionality when services are degraded

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

export const AdminOfflineMode = () => {
  const { user, signOut } = useAuth();

  const offlineFeatures = [
    {
      name: 'User Information',
      description: 'View basic user profile',
      available: true,
      data: {
        email: user?.email,
        id: user?.id,
        lastSignIn: user?.last_sign_in_at
      }
    },
    {
      name: 'Local Storage Access',
      description: 'Access cached data',
      available: true,
      action: () => {
        const keys = Object.keys(localStorage);
        console.log('LocalStorage Keys:', keys);
        keys.forEach(key => {
          if (key.includes('capittal') || key.includes('admin')) {
            console.log(`${key}:`, localStorage.getItem(key));
          }
        });
      }
    },
    {
      name: 'Session Information',
      description: 'Current session details',
      available: true,
      data: {
        userAgent: navigator.userAgent,
        currentTime: new Date().toISOString(),
        referrer: document.referrer
      }
    }
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Admin Panel - Offline Mode
                  <Badge variant="secondary">Limited Functionality</Badge>
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  Services are experiencing issues. This offline mode provides basic functionality.
                </p>
              </div>
              <Button onClick={signOut} variant="outline">
                Sign Out
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Available Features */}
        <div className="grid gap-6 md:grid-cols-2">
          {offlineFeatures.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{feature.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {feature.data && (
                  <div className="space-y-2">
                    {Object.entries(feature.data).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-muted-foreground truncate max-w-xs">
                          {value || 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                {feature.action && (
                  <Button 
                    onClick={feature.action} 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                  >
                    View Details
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recovery Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Recovery Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
              >
                Refresh Page
              </Button>
              <Button 
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }} 
                variant="outline"
              >
                Clear Cache
              </Button>
              <Button 
                onClick={() => window.open('https://capittal.es', '_blank')} 
                variant="outline"
              >
                Open Main Site
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <strong>Status:</strong> If services continue to be unavailable, please try again later 
              or contact support if the issue persists.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};