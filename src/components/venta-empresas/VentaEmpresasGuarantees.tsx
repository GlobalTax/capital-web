import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, TrendingUp, Clock, Award, Users, CheckCircle } from 'lucide-react';

const guarantees = [
  {
    icon: Lock,
    title: 'Confidencialidad 100% Garantizada',
    description: 'NDA firmado desde el primer día. Tu información está protegida en todo momento.',
    badge: 'NDA Incluido'
  },
  {
    icon: TrendingUp,
    title: 'Garantía de Precio Superior',
    description: 'Si no mejoramos tu precio esperado al menos un 20%, no cobras comisión.',
    badge: 'Sin Riesgo'
  },
  {
    icon: Clock,
    title: 'Proceso Ágil y Eficiente',
    description: 'Máximo 9 meses para cerrar operación o devolvemos parte de los honorarios.',
    badge: 'Plazo Garantizado'
  },
  {
    icon: Shield,
    title: 'Protección Legal Completa',
    description: 'Equipo legal especializado para proteger tus intereses en cada paso.',
    badge: 'Legal Incluido'
  }
];

const certifications = [
  {
    name: 'ICEF',
    description: 'International Corporate Finance',
    logo: '🏆'
  },
  {
    name: 'AECG',
    description: 'Asociación Española Corporate Finance',
    logo: '⭐'
  },
  {
    name: 'ISO 9001',
    description: 'Calidad Certificada',
    logo: '✓'
  }
];

const clientLogos = [
  { name: 'Cliente 1', initials: 'C1' },
  { name: 'Cliente 2', initials: 'C2' },
  { name: 'Cliente 3', initials: 'C3' },
  { name: 'Cliente 4', initials: 'C4' },
  { name: 'Cliente 5', initials: 'C5' },
  { name: 'Cliente 6', initials: 'C6' }
];

const VentaEmpresasGuarantees = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-secondary/5 to-background">
      <div className="container mx-auto px-4">
        {/* Guarantees Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-green-200">
            <Shield className="h-4 w-4" />
            Tu Tranquilidad es Nuestra Prioridad
          </div>
          <h2 className="text-4xl font-normal mb-4">
            Garantías que Te Protegen
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Trabajamos con total transparencia y ponemos todo por escrito
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 max-w-7xl mx-auto">
          {guarantees.map((guarantee, index) => (
            <Card key={index} className="border border-slate-200 hover:border-slate-300 transition-colors bg-white shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-4">
                  <guarantee.icon className="h-9 w-9 text-slate-700" />
                </div>
                <div className="inline-block bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-lg mb-4 border border-green-200">
                  {guarantee.badge}
                </div>
                <h3 className="font-normal text-slate-900 mb-3 text-base">
                  {guarantee.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {guarantee.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Signals */}
        <div className="bg-card border rounded-2xl p-8 mb-12">
          <div className="text-center mb-8">
            <Award className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-normal mb-2">Reconocimientos y Certificaciones</h3>
            <p className="text-muted-foreground">Avalados por las principales instituciones del sector</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {certifications.map((cert, index) => (
              <div key={index} className="text-center p-4 bg-secondary/10 rounded-lg">
                <div className="text-4xl mb-2">{cert.logo}</div>
                <h4 className="font-bold">{cert.name}</h4>
                <p className="text-sm text-muted-foreground">{cert.description}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 text-primary">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">+20 años de experiencia en M&A</span>
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">€500M+ en operaciones cerradas</span>
          </div>
        </div>

        {/* Client Logos (Anonimizados) */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Users className="h-5 w-5 text-muted-foreground" />
            <p className="text-muted-foreground">Han confiado en nosotros:</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 opacity-60">
            {clientLogos.map((client, index) => (
              <div 
                key={index} 
                className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center font-bold text-muted-foreground"
              >
                {client.initials}
              </div>
            ))}
          </div>
          
          <p className="text-sm text-muted-foreground mt-6">
            * Por confidencialidad, no mostramos nombres de empresas sin autorización expresa
          </p>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasGuarantees;
