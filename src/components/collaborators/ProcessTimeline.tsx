import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, FileText, Users, Handshake, TrendingUp } from 'lucide-react';
import { useI18n } from '@/shared/i18n/I18nProvider';

export const ProcessTimeline = () => {
  const { t } = useI18n();
  
  const timelineSteps = [
    {
      id: 1,
      title: t('collab.process.step1.title'),
      description: t('collab.process.step1.desc'),
      duration: t('collab.process.step1.duration'),
      icon: FileText,
      status: "active"
    },
    {
      id: 2,
      title: t('collab.process.step2.title'),
      description: t('collab.process.step2.desc'),
      duration: t('collab.process.step2.duration'),
      icon: Users,
      status: "pending"
    },
    {
      id: 3,
      title: t('collab.process.step3.title'),
      description: t('collab.process.step3.desc'),
      duration: t('collab.process.step3.duration'),
      icon: TrendingUp,
      status: "pending"
    },
    {
      id: 4,
      title: t('collab.process.step4.title'),
      description: t('collab.process.step4.desc'),
      duration: t('collab.process.step4.duration'),
      icon: Handshake,
      status: "pending"
    }
  ];
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              {t('collab.process.badge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              {t('collab.process.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('collab.process.subtitle')}
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-border hidden md:block"></div>

            <div className="space-y-12">
              {timelineSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = step.status === 'completed';
                const isActive = step.status === 'active';
                
                return (
                  <div key={step.id} className="relative flex items-start space-x-6">
                    {/* Timeline dot */}
                    <div className={`
                      relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 
                      ${isCompleted ? 'bg-primary border-primary text-primary-foreground' : 
                        isActive ? 'bg-background border-primary text-primary' : 
                        'bg-background border-muted text-muted-foreground'}
                      transition-all duration-300 group-hover:border-primary group-hover:text-primary
                    `}>
                      <StepIcon className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <Card className={`
                        admin-card group transition-all duration-300 hover:shadow-lg
                        ${isActive ? 'ring-2 ring-primary/20 bg-primary/5' : ''}
                      `}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-foreground mb-2">
                                {step.title}
                              </h3>
                              <Badge 
                                variant={isActive ? "default" : "secondary"}
                                className="text-xs"
                              >
                                <Clock className="w-3 h-3 mr-1" />
                                {step.duration}
                              </Badge>
                            </div>
                            <div className="text-2xl font-bold text-muted-foreground">
                              {String(step.id).padStart(2, '0')}
                            </div>
                          </div>
                          
                          <p className="text-muted-foreground leading-relaxed">
                            {step.description}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary card */}
          <Card className="admin-card mt-16 bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                ¿Listo para comenzar?
              </h3>
              <p className="text-muted-foreground mb-6">
                El proceso completo toma aproximadamente 2-3 semanas. 
                Te mantendremos informado en cada paso.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Proceso transparente</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Feedback continuo</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Decisión rápida</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ProcessTimeline;