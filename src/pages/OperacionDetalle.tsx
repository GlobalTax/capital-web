import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { HomeLayout } from '@/shared';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, Euro, Calendar, Users, TrendingUp, Phone, Mail } from 'lucide-react';
import ContactFormOperation from '@/components/operations/ContactFormOperation';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  valuation_amount: number;
  valuation_currency: string;
  year: number;
  description: string;
  is_featured: boolean;
  is_active: boolean;
  display_locations: string[];
  featured_image_url?: string;
  logo_url?: string;
}

const OperacionDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const [operation, setOperation] = useState<Operation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOperation();
    }
  }, [id]);

  const fetchOperation = async () => {
    try {
      const { data, error } = await supabase
        .from('company_operations')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching operation:', error);
        setOperation(null);
      } else {
        setOperation(data);
        // SEO dinámico
        document.title = `${data.company_name} - ${data.sector} | Capittal Market`;
        
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.setAttribute('name', 'description');
          document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', `${data.company_name} en venta - ${data.description.substring(0, 150)}...`);
      }
    } catch (error) {
      console.error('Error:', error);
      setOperation(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <HomeLayout>
        <div className="pt-16 min-h-screen">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </HomeLayout>
    );
  }

  if (!operation) {
    return <Navigate to="/operaciones" replace />;
  }

  return (
    <HomeLayout>
      <div className="pt-16 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="secondary" className="rounded-lg">
                {operation.sector}
              </Badge>
              {operation.is_featured && (
                <Badge variant="default" className="rounded-lg bg-yellow-100 text-yellow-800">
                  Destacado
                </Badge>
              )}
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {operation.company_name}
            </h1>
            
            <div className="flex items-center gap-6 text-gray-600">
              <div className="flex items-center gap-2">
                <Euro className="w-5 h-5" />
                <span className="text-xl font-semibold">
                  {operation.valuation_amount}M{operation.valuation_currency}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{operation.year}</span>
              </div>
            </div>
          </div>

          {/* Imagen destacada si existe */}
          {operation.featured_image_url && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img 
                src={operation.featured_image_url} 
                alt={operation.company_name}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contenido principal */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Descripción de la Empresa
                  </h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {operation.description}
                  </p>
                </CardContent>
              </Card>

              {/* Información adicional */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Detalles de la Oportunidad
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <Building className="w-6 h-6 text-primary" />
                      <div>
                        <div className="text-sm text-gray-600">Sector</div>
                        <div className="font-semibold">{operation.sector}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-6 h-6 text-primary" />
                      <div>
                        <div className="text-sm text-gray-600">Valoración</div>
                        <div className="font-semibold">
                          {operation.valuation_amount}M{operation.valuation_currency}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-primary" />
                      <div>
                        <div className="text-sm text-gray-600">Año</div>
                        <div className="font-semibold">{operation.year}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-6 h-6 text-primary" />
                      <div>
                        <div className="text-sm text-gray-600">Estado</div>
                        <div className="font-semibold text-green-600">Disponible</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar con formulario de contacto */}
            <div className="space-y-6">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Información Confidencial
                  </h3>
                  <p className="text-gray-600 mb-6 text-sm">
                    Para acceder a información detallada de esta oportunidad, 
                    completa el formulario de contacto.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>Teaser ejecutivo</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Building className="w-4 h-4" />
                      <span>Estados financieros</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>Contacto directo</span>
                    </div>
                  </div>

                  {!showContactForm ? (
                    <Button 
                      onClick={() => setShowContactForm(true)}
                      className="w-full"
                    >
                      Solicitar Información
                    </Button>
                  ) : (
                    <ContactFormOperation operationId={operation.id} companyName={operation.company_name} />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
};

export default OperacionDetalle;