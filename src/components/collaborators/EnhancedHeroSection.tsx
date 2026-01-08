import React from 'react';
import { SimpleButton } from '@/components/ui/simple-button';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/shared/i18n/I18nProvider';

// Fixed: Removed undefined variable reference that was causing crashes

export const EnhancedHeroSection = () => {
  const { t } = useI18n();
  
  const recentActivity = [
    { name: t('collab.hero.dashboard_activity1'), value: '€25M', status: t('collab.hero.dashboard_status1'), color: 'bg-green-500', statusColor: 'text-green-600' },
    { name: t('collab.hero.dashboard_activity2'), value: '€45M', status: t('collab.hero.dashboard_status2'), color: 'bg-blue-500', statusColor: 'text-blue-600' },
    { name: t('collab.hero.dashboard_activity3'), value: '€18M', status: t('collab.hero.dashboard_status3'), color: 'bg-slate-800', statusColor: 'text-slate-600' }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };


  return (
    <div className="bg-background">
      {/* Main Hero Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                {t('collab.hero.badge')}
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-slate-900 leading-tight">
                {t('collab.hero.title')}
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-lg">
                {t('collab.hero.subtitle')}
              </p>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-6 py-8">
                <div>
                  <div className="text-3xl font-bold text-slate-900">{t('collab.hero.stat1_value')}</div>
                  <div className="text-sm text-slate-600">{t('collab.hero.stat1')}</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">{t('collab.hero.stat2_value')}</div>
                  <div className="text-sm text-slate-600">{t('collab.hero.stat2')}</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">{t('collab.hero.stat3_value')}</div>
                  <div className="text-sm text-slate-600">{t('collab.hero.stat3')}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <SimpleButton 
                  text={t('collab.hero.cta_apply')}
                  variant="primary"
                  size="lg"
                  onClick={() => scrollToSection('application-form')}
                />
                <SimpleButton 
                  text={t('collab.hero.cta_requirements')}
                  variant="outline"
                  size="lg"
                  onClick={() => scrollToSection('benefits-section')}
                />
              </div>
            </div>

            {/* Right Collaborators Dashboard Panel */}
            <div className="bg-card border border-border rounded-xl shadow-xl">
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
                <h3 className="text-lg font-medium">Capital Collaborators - Network Dashboard</h3>
                <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">+12 Nuevos</div>
              </div>
              
              {/* Top Stats */}
              <div className="p-6 border-b border-border">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-2xl font-bold text-slate-900">50+</div>
                    <div className="text-sm text-slate-600">Colaboradores Activos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">€1.2B</div>
                    <div className="text-sm text-slate-600">Valor Gestionado</div>
                  </div>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="p-6">
                <h4 className="text-sm font-medium text-slate-900 mb-4">Actividad Reciente</h4>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${activity.color}`}></div>
                        <div>
                          <div className="font-medium text-slate-900 text-sm">{activity.name}</div>
                          <div className="text-xs text-slate-600">{activity.value}</div>
                        </div>
                      </div>
                      <div className={`font-medium text-xs ${activity.statusColor}`}>
                        {activity.status}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Footer Stats */}
                <div className="mt-6 pt-4 border-t border-border flex justify-between text-sm">
                  <span className="text-slate-600">98,7% Satisfacción</span>
                  <span className="text-slate-600">23 activos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default EnhancedHeroSection;