import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  geographic_location: string | null;
  revenue_amount: number | null;
  ebitda_amount: number | null;
  short_description: string | null;
  project_status: string;
}

interface NewsletterPreviewProps {
  subject: string;
  introText: string;
  operations: Operation[];
  onClose: () => void;
}

function formatCurrency(amount: number | null): string {
  if (!amount) return "Consultar";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const NewsletterPreview: React.FC<NewsletterPreviewProps> = ({
  subject,
  introText,
  operations,
  onClose,
}) => {
  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Vista Previa del Newsletter</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh]">
          <div className="bg-slate-100 p-6 rounded-lg">
            {/* Email Preview */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-center">
                <h1 className="text-2xl font-bold text-white tracking-tight">CAPITTAL</h1>
                <p className="text-slate-400 text-sm mt-1">Oportunidades de la Semana</p>
              </div>

              {/* Date */}
              <div className="text-center pt-6 px-8">
                <p className="text-sm text-slate-500">📅 {currentDate}</p>
              </div>

              {/* Intro */}
              <div className="px-8 py-6">
                <p className="text-slate-700">
                  Hola <strong>[Nombre]</strong>,
                </p>
                <p className="text-slate-700 mt-4">
                  {introText || "Te compartimos las últimas oportunidades de inversión disponibles en nuestro Marketplace. Como suscriptor, tienes acceso prioritario a estas operaciones."}
                </p>
              </div>

              {/* Value Prop */}
              <div className="mx-8 mb-6 bg-slate-50 rounded-xl p-5">
                <p className="font-semibold text-slate-900 mb-3">¿Por qué usar nuestro Marketplace?</p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>✓ Acceso a la red más amplia de asesores M&A en España</li>
                  <li>✓ Todas las operaciones con mandato directo</li>
                  <li>✓ Due diligence verificado</li>
                </ul>
              </div>

              {/* Section Title */}
              <div className="px-8 py-4 border-t border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 text-center">
                  🏆 OPORTUNIDADES DE LA SEMANA
                </h2>
              </div>

              {/* Operations */}
              <div className="px-8 py-6 space-y-4">
                {operations.map((op) => (
                  <div key={op.id} className="border border-slate-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-slate-900">🏢 {op.company_name}</h3>
                      <Badge 
                        variant={op.project_status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {op.project_status === 'active' ? 'Activo' : 
                         op.project_status === 'upcoming' ? 'Próximo' : 'Exclusivo'}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600 mb-3">
                      <p>📍 <strong>Sector:</strong> {op.sector}</p>
                      <p>📍 <strong>Ubicación:</strong> {op.geographic_location || "España"}</p>
                      <p>💰 <strong>Facturación:</strong> {formatCurrency(op.revenue_amount)}</p>
                      <p>📊 <strong>EBITDA:</strong> {formatCurrency(op.ebitda_amount)}</p>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">
                      {op.short_description || "Oportunidad de inversión disponible..."}
                    </p>
                    <div className="text-center">
                      <button className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-3 rounded-lg text-sm font-semibold">
                        📩 Solicitar Información
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="px-8 pb-8 text-center">
                <button className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-8 py-4 rounded-lg font-semibold">
                  🔍 Ver Todas las Oportunidades
                </button>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 p-6 text-center border-t border-slate-200">
                <p className="font-semibold text-slate-900">CAPITTAL · Especialistas en M&A</p>
                <p className="text-sm text-slate-500">info@capittal.es · capittal.es</p>
                <p className="text-xs text-slate-400 mt-3 underline cursor-pointer">
                  Darse de baja
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
