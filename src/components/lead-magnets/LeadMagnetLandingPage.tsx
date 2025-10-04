
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLeadMagnetDownloads } from '@/hooks/useLeadMagnets';
import { Download, CheckCircle, Users, TrendingUp } from 'lucide-react';
import type { LeadMagnet, DownloadFormData } from '@/types/leadMagnets';

interface LeadMagnetLandingPageProps {
  leadMagnet: LeadMagnet;
}

const LeadMagnetLandingPage = ({ leadMagnet }: LeadMagnetLandingPageProps) => {
  const { recordDownload } = useLeadMagnetDownloads();
  const [formData, setFormData] = useState<DownloadFormData>({
    user_email: '',
    user_name: '',
    user_company: '',
    user_phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.user_email) return;

    setIsSubmitting(true);
    
    try {
      await recordDownload(leadMagnet.id, formData);
      
      // Iniciar descarga si hay archivo disponible
      if (leadMagnet.file_url) {
        window.open(leadMagnet.file_url, '_blank');
      }
      
      setDownloadComplete(true);
    } catch (error) {
      console.error('Error en descarga:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'report': return '📊';
      case 'whitepaper': return '📄';
      case 'checklist': return '✅';
      case 'template': return '📋';
      default: return '📄';
    }
  };

  const getBenefitsByType = (type: string) => {
    switch (type) {
      case 'report':
        return [
          'Análisis completo del mercado y tendencias actuales',
          'Múltiplos de valoración actualizados por subsector',
          'Casos de éxito y transacciones recientes',
          'Recomendaciones estratégicas para compradores y vendedores',
          'Perspectivas y oportunidades para 2024-2025'
        ];
      case 'whitepaper':
        return [
          'Investigación profunda con metodología rigurosa',
          'Framework probado en transacciones reales',
          'Casos de aplicación práctica',
          'Referencias y fuentes especializadas',
          'Insights exclusivos del equipo de Capittal'
        ];
      case 'checklist':
        return [
          'Lista completa paso a paso',
          'Tips específicos para tu sector',
          'Errores comunes y cómo evitarlos',
          'Recursos complementarios',
          'Formato fácil de seguir y marcar'
        ];
      case 'template':
        return [
          'Plantilla lista para usar inmediatamente',
          'Campos predefinidos y ejemplos',
          'Guía de mejores prácticas incluida',
          'Adaptado específicamente a tu sector',
          'Formato profesional y personalizable'
        ];
      default:
        return ['Contenido de alta calidad', 'Información actualizada', 'Aplicación práctica'];
    }
  };

  if (downloadComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Descarga Exitosa!</h2>
            <p className="text-gray-600 mb-4">
              Tu descarga debería comenzar automáticamente. Si no es así, 
              <a href={leadMagnet.file_url} className="text-blue-600 hover:underline ml-1">
                haz clic aquí
              </a>.
            </p>
            <p className="text-sm text-gray-500">
              También te enviaremos una copia a tu email para acceso futuro.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/dfc75c41-289d-4bfd-963f-7838a1a06225.png" 
              alt="Capittal" 
              className="h-8"
            />
            <span className="text-lg font-semibold text-gray-900">Capittal</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Content Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{getTypeIcon(leadMagnet.type)}</span>
                <Badge variant="secondary" className="capitalize">
                  {leadMagnet.sector}
                </Badge>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {leadMagnet.title}
              </h1>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                {leadMagnet.description}
              </p>
            </div>

            {/* Benefits */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Lo que obtendrás:
              </h3>
              <ul className="space-y-3">
                {getBenefitsByType(leadMagnet.type).map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>{leadMagnet.download_count} descargas</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>+1000 profesionales confían en nosotros</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Contenido actualizado 2024</span>
              </div>
            </div>
          </div>

          {/* Right Column - Download Form */}
          <div className="lg:sticky lg:top-8">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Descarga Gratuita</CardTitle>
                <p className="text-gray-600">
                  Completa tus datos para acceder al contenido
                </p>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleDownload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <Input
                      type="email"
                      required
                      value={formData.user_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, user_email: e.target.value }))}
                      placeholder="tu@empresa.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre completo
                    </label>
                    <Input
                      value={formData.user_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, user_name: e.target.value }))}
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Empresa
                    </label>
                    <Input
                      value={formData.user_company}
                      onChange={(e) => setFormData(prev => ({ ...prev, user_company: e.target.value }))}
                      placeholder="Nombre de tu empresa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono (opcional)
                    </label>
                    <Input
                      type="tel"
                      value={formData.user_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, user_phone: e.target.value }))}
                      placeholder="600 000 000"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg"
                    disabled={isSubmitting || !formData.user_email}
                  >
                    {isSubmitting ? 'Procesando...' : 'Descargar Ahora'}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Al descargar, aceptas recibir emails con contenido relevante de Capittal. 
                    Puedes darte de baja en cualquier momento.
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Trust Signals */}
            <div className="mt-6 text-center text-sm text-gray-600">
              <p className="mb-2">✅ Sin spam, solo contenido de valor</p>
              <p className="mb-2">🔒 Tus datos están seguros</p>
              <p>📧 Acceso inmediato por email</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadMagnetLandingPage;
