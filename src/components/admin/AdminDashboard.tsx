
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import AdminDashboardHome from './AdminDashboardHome';
import LeadScoringIntelligenceDashboard from './LeadScoringIntelligenceDashboard';
import MarketingIntelligenceDashboard from './MarketingIntelligenceDashboard';
import MarketingAutomationDashboard from './MarketingAutomationDashboard';

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    if (!user) {
      // Redirect will be handled by parent component
      return;
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "👋 Adiós!",
      description: "Has cerrado sesión exitosamente.",
    });
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'home':
        return <AdminDashboardHome />;
      case 'lead-scoring':
        return <LeadScoringIntelligenceDashboard />;
      case 'marketing-intelligence':
        return <MarketingIntelligenceDashboard />;
      case 'marketing-automation':
        return <MarketingAutomationDashboard />;
      default:
        return <AdminDashboardHome />;
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <Button variant="destructive" onClick={handleSignOut}>
          Cerrar Sesión
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Navegación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveSection('home')}>
              Inicio
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveSection('lead-scoring')}>
              Lead Scoring
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveSection('marketing-intelligence')}>
              Marketing Intelligence
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveSection('marketing-automation')}>
              Marketing Automation
            </Button>
          </CardContent>
        </Card>

        <div className="md:col-span-3">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
