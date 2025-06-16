
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import CaseStudiesManager from './CaseStudiesManager';
import OperationsManager from './OperationsManager';
import StatisticsManager from './StatisticsManager';
import MultiplesManager from './MultiplesManager';
import TestimonialsManager from './TestimonialsManager';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('case-studies');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserName(user.email);
          
          const { data: adminUser } = await supabase
            .from('admin_users')
            .select('role')
            .eq('user_id', user.id)
            .single();
          
          setUserRole(adminUser?.role || null);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    };

    checkUserRole();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onLogout();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const tabs = [
    { id: 'case-studies', label: 'Casos de Éxito', component: CaseStudiesManager },
    { id: 'operations', label: 'Operaciones', component: OperationsManager },
    { id: 'statistics', label: 'Estadísticas', component: StatisticsManager },
    { id: 'multiples', label: 'Múltiplos', component: MultiplesManager },
    { id: 'testimonials', label: 'Testimonios', component: TestimonialsManager },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || CaseStudiesManager;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-black">Panel de Administración</h1>
            <p className="text-sm text-gray-600">
              {userName} {userRole && `(${userRole})`}
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border border-gray-300 rounded-lg"
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-300 px-6">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <ActiveComponent />
      </div>
    </div>
  );
};

export default AdminDashboard;
