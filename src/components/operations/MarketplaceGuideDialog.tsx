import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Target,
  Search,
  Eye,
  Mail,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface MarketplaceGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const tabs = [
  { value: 'welcome', label: 'Bienvenida', icon: Target },
  { value: 'explore', label: 'Explorar', icon: Search },
  { value: 'details', label: 'Ver Detalles', icon: Eye },
  { value: 'request', label: 'Solicitar Info', icon: Mail },
  { value: 'confidentiality', label: 'Confidencialidad', icon: Shield },
];

export const MarketplaceGuideDialog: React.FC<MarketplaceGuideDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [activeTab, setActiveTab] = useState('welcome');
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const currentIndex = tabs.findIndex((tab) => tab.value === activeTab);

  useEffect(() => {
    if (open) {
      setActiveTab('welcome');
    }
  }, [open]);

  const handleNext = () => {
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].value);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].value);
    }
  };

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('marketplace-guide-disabled', 'true');
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Guía del Marketplace de Oportunidades
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex flex-col items-center gap-1 py-3"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs hidden sm:inline">{tab.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {index + 1}/5
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab 1: Bienvenida */}
          <TabsContent value="welcome" className="space-y-4">
            <div className="text-center mb-6">
              <Target className="h-16 w-16 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Bienvenido al Marketplace de Oportunidades
              </h3>
              <p className="text-muted-foreground">
                Tu acceso directo a las mejores oportunidades de inversión y
                adquisición de empresas
              </p>
            </div>

            <div className="space-y-4 bg-muted/50 p-6 rounded-lg">
              <h4 className="font-semibold">¿Qué encontrarás aquí?</h4>
              <ul className="space-y-2 list-disc list-inside text-sm">
                <li>
                  Empresas verificadas disponibles para adquisición en diversos
                  sectores
                </li>
                <li>
                  Información financiera clave: valoración, EBITDA, facturación
                </li>
                <li>Filtros avanzados para encontrar tu oportunidad ideal</li>
                <li>
                  Proceso confidencial y seguro para solicitar información
                  detallada
                </li>
                <li>
                  Asesoramiento profesional de expertos en M&A para cada
                  operación
                </li>
              </ul>
            </div>

            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
              <p className="text-sm">
                <strong>💡 Tip:</strong> Este marketplace está diseñado para
                inversores y compradores estratégicos. Todas las operaciones
                están sujetas a confidencialidad y verificación de perfil.
              </p>
            </div>
          </TabsContent>

          {/* Tab 2: Explorar */}
          <TabsContent value="explore" className="space-y-4">
            <div className="text-center mb-6">
              <Search className="h-16 w-16 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Explora las Oportunidades
              </h3>
              <p className="text-muted-foreground">
                Usa nuestras herramientas de búsqueda y filtrado para encontrar
                la operación perfecta
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                    1
                  </div>
                  Búsqueda Rápida
                </h4>
                <p className="text-sm text-muted-foreground pl-8">
                  Utiliza la barra de búsqueda para encontrar empresas por
                  nombre, sector o palabras clave. La búsqueda es instantánea y
                  filtra los resultados en tiempo real.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                    2
                  </div>
                  Filtros Avanzados
                </h4>
                <div className="pl-8 space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong>Por Sector:</strong> Filtra por industria
                    (Tecnología, Retail, Manufactura, Servicios, etc.)
                  </p>
                  <p>
                    <strong>Por EBITDA:</strong> Establece rangos de
                    rentabilidad operativa
                  </p>
                  <p>
                    <strong>Por Facturación:</strong> Define el tamaño de
                    empresa que buscas
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                    3
                  </div>
                  Ordenación
                </h4>
                <p className="text-sm text-muted-foreground pl-8">
                  Ordena los resultados por valoración, EBITDA, facturación o
                  fecha de publicación para priorizar según tus criterios.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Ver Detalles */}
          <TabsContent value="details" className="space-y-4">
            <div className="text-center mb-6">
              <Eye className="h-16 w-16 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Visualiza los Detalles
              </h3>
              <p className="text-muted-foreground">
                Accede a información completa de cada oportunidad
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">
                  📋 Información en las Tarjetas
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    • <strong>Nombre de la empresa</strong> (o código
                    confidencial)
                  </li>
                  <li>
                    • <strong>Sector</strong> de actividad
                  </li>
                  <li>
                    • <strong>Valoración estimada</strong> del negocio
                  </li>
                  <li>
                    • <strong>EBITDA</strong> y margen operativo
                  </li>
                  <li>
                    • <strong>Facturación anual</strong>
                  </li>
                  <li>
                    • <strong>Año</strong> de la operación
                  </li>
                </ul>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-3">🔍 Modal de Detalles</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Al hacer clic en cualquier tarjeta, se abrirá un modal con
                  información ampliada:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Descripción detallada del negocio</li>
                  <li>• Métricas financieras adicionales</li>
                  <li>• Gráficos de rendimiento (si disponibles)</li>
                  <li>
                    • Formulario integrado para solicitar información
                    confidencial
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm">
                  <strong>⚠️ Nota:</strong> Por motivos de confidencialidad,
                  algunos datos sensibles (nombre exacto, ubicación, clientes
                  clave) solo se revelan tras verificación de perfil de
                  inversor.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Tab 4: Solicitar Info */}
          <TabsContent value="request" className="space-y-4">
            <div className="text-center mb-6">
              <Mail className="h-16 w-16 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Solicita Información Confidencial
              </h3>
              <p className="text-muted-foreground">
                Proceso simple y seguro para acceder a datos detallados
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Completa el Formulario</h4>
                    <p className="text-sm text-muted-foreground">
                      Dentro del modal de detalles encontrarás un formulario
                      integrado. Proporciona tus datos de contacto y explica
                      brevemente tu interés en la operación.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">
                      Verificación de Perfil
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Nuestro equipo revisará tu perfil de inversor para
                      asegurar que cumples con los requisitos de la operación.
                      Este proceso es confidencial y rápido.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">
                      Respuesta en 24-48h
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Recibirás una confirmación inmediata por email. Un asesor
                      especializado se pondrá en contacto contigo en un máximo
                      de 48 horas con información detallada.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">
                      Acceso a Documentación
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Una vez verificado tu perfil, recibirás acceso a
                      memorandums, estados financieros, due diligence y otros
                      documentos confidenciales de la operación.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>📧 Información que necesitarás:</strong>
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• Nombre completo</li>
                  <li>• Email de contacto</li>
                  <li>• Teléfono (opcional pero recomendado)</li>
                  <li>• Empresa o vehículo de inversión</li>
                  <li>
                    • Breve descripción de tu interés y capacidad de inversión
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* Tab 5: Confidencialidad */}
          <TabsContent value="confidentiality" className="space-y-4">
            <div className="text-center mb-6">
              <Shield className="h-16 w-16 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Confidencialidad Garantizada
              </h3>
              <p className="text-muted-foreground">
                Tu privacidad y la de los vendedores es nuestra prioridad
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Acuerdo de Confidencialidad (NDA)
                </h4>
                <p className="text-sm text-muted-foreground">
                  Al solicitar información sobre cualquier operación, aceptas
                  implícitamente un acuerdo de confidencialidad. Todos los
                  datos que recibas deben ser tratados con la máxima discreción
                  y no pueden ser compartidos con terceros sin autorización
                  expresa.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">🔒 Protección de Datos</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    • Toda la información sensible está encriptada y protegida
                  </li>
                  <li>
                    • Los datos de contacto solo se comparten tras verificación
                  </li>
                  <li>
                    • Cumplimiento estricto con GDPR y normativas de protección
                    de datos
                  </li>
                  <li>
                    • Tus datos nunca se venderán ni compartirán con terceros
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">✅ Verificación de Perfil</h4>
                <p className="text-sm text-muted-foreground">
                  Verificamos cada solicitud para proteger tanto a compradores
                  como a vendedores:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground mt-2">
                  <li>• Validación de identidad y datos de contacto</li>
                  <li>• Comprobación de capacidad financiera indicativa</li>
                  <li>• Verificación de intención seria de compra/inversión</li>
                  <li>
                    • Evaluación de alineación con el perfil buscado por el
                    vendedor
                  </li>
                </ul>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">
                  📞 ¿Tienes dudas sobre confidencialidad?
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Nuestro equipo está disponible para resolver cualquier
                  pregunta sobre el proceso de confidencialidad y protección de
                  datos.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="/contacto">Contactar con un Asesor</a>
                </Button>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm">
                  <strong>✨ Compromiso Capittal:</strong> Llevamos más de 10
                  años gestionando operaciones confidenciales con éxito. La
                  confianza de nuestros clientes es nuestro mayor activo.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Navigation and actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center gap-2">
            <Checkbox
              id="dont-show"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
            />
            <label
              htmlFor="dont-show"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              No mostrar de nuevo
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            
            {currentIndex === tabs.length - 1 ? (
              <Button size="sm" onClick={handleClose}>
                Explorar Ahora
                <Target className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleNext}
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
