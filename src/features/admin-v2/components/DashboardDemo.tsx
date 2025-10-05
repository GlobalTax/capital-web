import React, { useState } from 'react';
import { Glass, FeatureCard, TabMenu } from './LiquidGlassKit';
import { Target, Building2, TrendingUp, FileText, Users, BarChart3 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const DashboardDemo: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('resumen');

  const features = [
    {
      icon: Target,
      title: 'Mandatos Activos',
      description: '28 mandatos en progreso',
      href: '/admin/mandatos'
    },
    {
      icon: Building2,
      title: 'Targets Identificados',
      description: '142 empresas objetivo',
      href: '/admin/targets'
    },
    {
      icon: TrendingUp,
      title: 'Open Deals',
      description: '15 operaciones abiertas',
      href: '/admin/deals'
    }
  ];

  const tabs = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'mandatos', label: 'Mandatos' },
    { id: 'operaciones', label: 'Operaciones' }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Glass blur="xl" className="p-8">
        <h1 className="text-4xl font-bold mb-2 text-foreground">
          Panel de Transacciones
        </h1>
        <p className={`text-lg ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
          Gestiona mandatos, targets y deals desde una interfaz moderna
        </p>
      </Glass>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            href={feature.href}
          />
        ))}
      </div>

      {/* Tab Menu */}
      <TabMenu
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      <Glass blur="md" className="p-8">
        {activeTab === 'resumen' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Resumen General</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Glass blur="sm" className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className={`w-8 h-8 ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`} />
                  <div>
                    <div className="text-2xl font-bold text-foreground">1,247</div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>
                      Documentos
                    </div>
                  </div>
                </div>
              </Glass>

              <Glass blur="sm" className="p-4">
                <div className="flex items-center gap-3">
                  <Users className={`w-8 h-8 ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`} />
                  <div>
                    <div className="text-2xl font-bold text-foreground">342</div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>
                      Contactos
                    </div>
                  </div>
                </div>
              </Glass>

              <Glass blur="sm" className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className={`w-8 h-8 ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`} />
                  <div>
                    <div className="text-2xl font-bold text-foreground">€12.5M</div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>
                      Valor Total
                    </div>
                  </div>
                </div>
              </Glass>
            </div>
          </div>
        )}

        {activeTab === 'mandatos' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Gestión de Mandatos</h2>
            <p className={theme === 'dark' ? 'text-white/60' : 'text-slate-600'}>
              Esta sección mostrará la lista completa de mandatos activos
            </p>
          </div>
        )}

        {activeTab === 'operaciones' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Operaciones Abiertas</h2>
            <p className={theme === 'dark' ? 'text-white/60' : 'text-slate-600'}>
              Aquí se visualizarán todas las operaciones en curso
            </p>
          </div>
        )}
      </Glass>

      {/* Info Box */}
      <Glass blur="md" className="p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
            <FileText className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Admin V2 - Demo Seguro
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>
              Esta es una versión de demostración del nuevo panel administrativo con glassmorphism.
              El acceso está protegido con AdminV2Guard y todos los eventos se loguean en security_events.
            </p>
          </div>
        </div>
      </Glass>
    </div>
  );
};

export default DashboardDemo;
