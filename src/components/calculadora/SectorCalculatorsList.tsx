import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Calculator, 
  Factory, 
  Laptop, 
  Building2, 
  HeartHandshake, 
  GraduationCap,
  ShoppingCart,
  Wrench,
  Plane,
  Zap,
  DollarSign,
  Users,
  Briefcase,
  TreePine
} from 'lucide-react';
import { useSectorsList } from '@/hooks/useSectorMultiples';

const sectorIcons: Record<string, React.ComponentType<any>> = {
  tecnologia: Laptop,
  manufactura: Factory,
  construccion: Building2,
  salud: HeartHandshake,
  educacion: GraduationCap,
  retail: ShoppingCart,
  servicios: Wrench,
  turismo: Plane,
  energia: Zap,
  finanzas: DollarSign,
  consultoria: Users,
  inmobiliario: Building2,
  agricultura: TreePine,
  otro: Briefcase
};

const sectorColors: Record<string, string> = {
  tecnologia: 'from-blue-500/20 to-cyan-500/20',
  manufactura: 'from-orange-500/20 to-red-500/20',
  construccion: 'from-yellow-500/20 to-orange-500/20',
  salud: 'from-green-500/20 to-emerald-500/20',
  educacion: 'from-purple-500/20 to-violet-500/20',
  retail: 'from-pink-500/20 to-rose-500/20',
  servicios: 'from-indigo-500/20 to-blue-500/20',
  turismo: 'from-teal-500/20 to-cyan-500/20',
  energia: 'from-yellow-500/20 to-amber-500/20',
  finanzas: 'from-green-500/20 to-teal-500/20',
  consultoria: 'from-slate-500/20 to-gray-500/20',
  inmobiliario: 'from-stone-500/20 to-amber-500/20',
  agricultura: 'from-green-500/20 to-lime-500/20',
  otro: 'from-gray-500/20 to-slate-500/20'
};

export const SectorCalculatorsList: React.FC = () => {
  const { data: sectors, isLoading } = useSectorsList();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Calculator className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando sectores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5">
      {/* Hero Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge variant="secondary" className="mb-6 text-sm font-medium">
              <Calculator className="w-4 h-4 mr-2" />
              Calculadoras Especializadas
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-primary-foreground bg-clip-text text-transparent">
              Valoración por Sectores
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              Elige tu sector para obtener una valoración precisa y personalizada, 
              utilizando múltiplos específicos y metodologías adaptadas a tu industria.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sectores Grid */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sectors?.map((sector, index) => {
              const IconComponent = sectorIcons[sector.sector_name] || Briefcase;
              const bgGradient = sectorColors[sector.sector_name] || 'from-gray-500/20 to-slate-500/20';
              
              return (
                <motion.div
                  key={sector.sector_name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer overflow-hidden">
                    <div className={`h-2 bg-gradient-to-r ${bgGradient}`} />
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${bgGradient}`}>
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Especializada
                        </Badge>
                      </div>
                      <CardTitle className="text-lg leading-tight">
                        {sector.description}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        Valoración optimizada para empresas del sector {sector.description.toLowerCase()}, 
                        con múltiplos específicos y análisis adaptado.
                      </p>
                      <Button 
                        asChild 
                        variant="default" 
                        size="sm" 
                        className="w-full group-hover:bg-primary/90 transition-colors"
                      >
                        <Link to={`/calculadora/${sector.sector_name}`}>
                          <Calculator className="w-4 h-4 mr-2" />
                          Calcular Valoración
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-6">
              ¿Por qué usar calculadoras especializadas?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Múltiplos Específicos</h3>
                <p className="text-sm text-muted-foreground">
                  Utilizamos múltiplos específicos de cada sector para mayor precisión
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Análisis Adaptado</h3>
                <p className="text-sm text-muted-foreground">
                  Metodología ajustada a las características únicas de tu industria
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Recomendaciones</h3>
                <p className="text-sm text-muted-foreground">
                  Insights y recomendaciones específicas para tu sector
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};