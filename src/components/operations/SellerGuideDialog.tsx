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
  FileText,
  ClipboardCheck,
  PlusCircle,
  Eye,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SellerGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const tabs = [
  { value: 'introduction', label: 'Introducción', icon: FileText },
  { value: 'prepare', label: 'Preparar Info', icon: ClipboardCheck },
  { value: 'create', label: 'Crear Operación', icon: PlusCircle },
  { value: 'visibility', label: 'Visibilidad', icon: Eye },
  { value: 'confidentiality', label: 'Confidencialidad', icon: Shield },
];

export const SellerGuideDialog: React.FC<SellerGuideDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [activeTab, setActiveTab] = useState('introduction');
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const currentIndex = tabs.findIndex((tab) => tab.value === activeTab);

  useEffect(() => {
    if (open) {
      setActiveTab('introduction');
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
      localStorage.setItem('seller-guide-disabled', 'true');
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Guía: Cómo Publicar Operaciones en el Marketplace
          </DialogTitle>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Paso {currentIndex + 1} de {tabs.length}
          </p>
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
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab 1: Introducción */}
          <TabsContent value="introduction" className="space-y-4">
            <div className="text-center mb-6">
              <FileText className="h-16 w-16 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Publica tu Empresa en el Marketplace
              </h3>
              <p className="text-muted-foreground">
                Accede a inversores verificados de forma confidencial y profesional
              </p>
            </div>

            <div className="space-y-4 bg-muted/50 p-6 rounded-lg">
              <h4 className="font-semibold">✅ Por qué publicar en Capittal:</h4>
              <ul className="space-y-2 list-disc list-inside text-sm">
                <li>Acceso a inversores verificados y cualificados</li>
                <li>Proceso confidencial y profesional</li>
                <li>Asesoramiento experto en M&A durante todo el proceso</li>
                <li>Mayor visibilidad en el mercado de adquisiciones</li>
                <li>Control total sobre la información compartida</li>
              </ul>
            </div>

            <div className="space-y-4 bg-primary/10 p-6 rounded-lg border border-primary/20">
              <h4 className="font-semibold">📋 Antes de empezar, prepara:</h4>
              <ul className="space-y-2 text-sm">
                <li>☑ Información básica de la empresa</li>
                <li>☑ Datos financieros (últimos 2-3 años)</li>
                <li>☑ Descripción del negocio y sector</li>
                <li>☑ Valoración estimada o rango esperado</li>
                <li>☑ Documentos opcionales (pitch deck, estados financieros)</li>
              </ul>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm">
                <strong>💡 Tip:</strong> Cuanto más completa sea la información, más atractiva será tu operación para inversores serios.
              </p>
            </div>
          </TabsContent>

          {/* Tab 2: Preparar Información */}
          <TabsContent value="prepare" className="space-y-4">
            <div className="text-center mb-6">
              <ClipboardCheck className="h-16 w-16 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Preparar la Información
              </h3>
              <p className="text-muted-foreground">
                Qué datos necesitas tener listos antes de crear tu operación
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">📊 Datos Obligatorios:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Nombre de la empresa (o código confidencial)</li>
                  <li>• Sector de actividad</li>
                  <li>• Descripción detallada del negocio</li>
                  <li>• Año de la operación</li>
                  <li>• Valoración estimada</li>
                </ul>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">📈 Datos Financieros Recomendados:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• EBITDA (útil para cálculo de múltiplos)</li>
                  <li>• Facturación anual</li>
                  <li>• Margen operativo</li>
                  <li>• Tendencia de crecimiento</li>
                </ul>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-3">✍️ Descripción Efectiva:</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Explica claramente el modelo de negocio</li>
                  <li>• Destaca ventajas competitivas</li>
                  <li>• Menciona posicionamiento en el mercado</li>
                  <li>• Incluye oportunidades de crecimiento</li>
                </ul>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm">
                  <strong>⚠️ Importante:</strong>
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>- Sé honesto con las cifras financieras</li>
                  <li>- Evita información sensible en la descripción pública</li>
                  <li>- Los datos confidenciales se comparten después</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Crear Operación */}
          <TabsContent value="create" className="space-y-4">
            <div className="text-center mb-6">
              <PlusCircle className="h-16 w-16 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Crear la Operación
              </h3>
              <p className="text-muted-foreground">
                Paso a paso del formulario de publicación
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shrink-0">
                  1
                </div>
                <div className="flex-1 bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Información Básica</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>- Nombre de empresa o código</li>
                    <li>- Sector y subsector</li>
                    <li>- Descripción (mínimo 100 caracteres)</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shrink-0">
                  2
                </div>
                <div className="flex-1 bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Datos Financieros</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>- Valoración (requerida)</li>
                    <li>- EBITDA (opcional pero recomendado)</li>
                    <li>- Facturación (opcional)</li>
                    <li>- Moneda (€, $, £)</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shrink-0">
                  3
                </div>
                <div className="flex-1 bg-primary/10 p-4 rounded-lg border border-primary/20">
                  <h4 className="font-semibold mb-2">Configuración de Visibilidad</h4>
                  <ul className="space-y-1 text-sm">
                    <li>📍 <strong>Activa:</strong> Visible en el marketplace</li>
                    <li>⭐ <strong>Destacada:</strong> Aparece en posiciones premium</li>
                    <li>🌐 <strong>Ubicaciones:</strong> Home, Operaciones, Inversores</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shrink-0">
                  4
                </div>
                <div className="flex-1 bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Información Adicional</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>- Tamaño de empresa (empleados)</li>
                    <li>- Tipo de operación (venta, fusión, etc.)</li>
                    <li>- Estado (disponible, en negociación, etc.)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm">
                <strong>💾 Importante:</strong> Revisa toda la información antes de guardar. Podrás editarla en cualquier momento.
              </p>
            </div>
          </TabsContent>

          {/* Tab 4: Visibilidad y Gestión */}
          <TabsContent value="visibility" className="space-y-4">
            <div className="text-center mb-6">
              <Eye className="h-16 w-16 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Visibilidad y Gestión
              </h3>
              <p className="text-muted-foreground">
                Cómo aparece tu operación y cómo gestionarla
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">👁️ Cómo Aparece Tu Operación:</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>En el Marketplace:</strong></p>
                  <ul className="ml-4 space-y-1">
                    <li>- Tarjeta compacta con datos clave</li>
                    <li>- Filtrable por sector, valoración, EBITDA</li>
                    <li>- Posición destacada si está marcada como tal</li>
                  </ul>
                  <p className="mt-3"><strong>En el Modal de Detalles:</strong></p>
                  <ul className="ml-4 space-y-1">
                    <li>- Descripción completa</li>
                    <li>- Gráficos financieros</li>
                    <li>- Formulario de contacto integrado</li>
                  </ul>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">✏️ Editar y Actualizar:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Puedes editar en cualquier momento</li>
                  <li>• Los cambios se reflejan inmediatamente</li>
                  <li>• Actualiza el estado según avance</li>
                </ul>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-3">🔄 Estados de Operación:</h4>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Disponible:</strong> Abierta a solicitudes</li>
                  <li>• <strong>En Negociación:</strong> Proceso avanzado</li>
                  <li>• <strong>Vendida:</strong> Operación cerrada</li>
                  <li>• <strong>Retirada:</strong> Temporalmente no disponible</li>
                </ul>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">📊 Seguimiento:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Visualizaciones de tu operación</li>
                  <li>• Solicitudes de información recibidas</li>
                  <li>• Perfil de inversores interesados</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* Tab 5: Confidencialidad */}
          <TabsContent value="confidentiality" className="space-y-4">
            <div className="text-center mb-6">
              <Shield className="h-16 w-16 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Confidencialidad y Proceso
              </h3>
              <p className="text-muted-foreground">
                Tu información está protegida en todo momento
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-3">🔒 Información Pública vs. Confidencial</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold text-green-700 dark:text-green-400">✅ Se Muestra Públicamente:</p>
                    <ul className="mt-1 space-y-1 text-muted-foreground ml-4">
                      <li>- Sector y subsector</li>
                      <li>- Descripción general del negocio</li>
                      <li>- Métricas financieras clave (valoración, EBITDA)</li>
                      <li>- Año de operación</li>
                    </ul>
                  </div>
                  <div className="mt-3">
                    <p className="font-semibold text-blue-700 dark:text-blue-400">🔐 Información Confidencial (tras NDA):</p>
                    <ul className="mt-1 space-y-1 text-muted-foreground ml-4">
                      <li>- Nombre exacto de la empresa (si usas código)</li>
                      <li>- Ubicación específica</li>
                      <li>- Clientes principales</li>
                      <li>- Estados financieros detallados</li>
                      <li>- Razones de venta</li>
                      <li>- Documentación legal</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <h4 className="font-semibold mb-3">⚖️ Valoraciones Realistas:</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Usa múltiplos del sector</li>
                  <li>• Considera tendencias actuales</li>
                  <li>• Justifica tu valoración</li>
                  <li>• Acepta rangos de negociación</li>
                </ul>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">🛡️ Proceso de Verificación:</h4>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li>1. Inversor solicita información</li>
                  <li>2. Nuestro equipo verifica su perfil</li>
                  <li>3. Se firma NDA bilateral</li>
                  <li>4. Compartes documentación detallada</li>
                  <li>5. Coordinamos reuniones si hay interés</li>
                </ol>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-3">✉️ Siguientes Pasos:</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Recibirás notificación de cada solicitud</li>
                  <li>• Un asesor coordinará el proceso</li>
                  <li>• Mantienes control total sobre la información</li>
                  <li>• Decides con quién avanzar en negociaciones</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="dont-show"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
            />
            <label
              htmlFor="dont-show"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              No volver a mostrar
            </label>
          </div>

          {currentIndex < tabs.length - 1 ? (
            <Button onClick={handleNext}>
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleClose}>
              Finalizar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
