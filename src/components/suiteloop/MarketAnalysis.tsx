import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LazyResponsiveContainer, 
  LazyBarChart, 
  LazyBar, 
  LazyXAxis, 
  LazyYAxis, 
  LazyCartesianGrid, 
  LazyTooltip, 
  LazyPieChart, 
  LazyPie, 
  LazyCell 
} from '@/components/shared/LazyChart';
import { TrendingUp, MapPin, Building, Users } from 'lucide-react';
import { suiteloopData } from '@/data/suiteloop-data';

const MarketAnalysis: React.FC = () => {
  const segmentacion = suiteloopData.segmentacion;
  const geografia = suiteloopData.distribucionGeografica;

  // Colores para los gráficos
  const segmentColors = ['#0f172a', '#334155', '#64748b', '#94a3b8'];
  const geografiaColors = {
    alta: '#0f172a',
    media: '#334155', 
    baja: '#94a3b8'
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <TrendingUp className="w-4 h-4 mr-2" />
              Análisis de Mercado
            </Badge>
            <h2 className="text-3xl md:text-4xl font-normal mb-4">
              Tamaño de mercado y segmentación
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              El mercado español de asesorías se concentra en microdespachos, pero la oportunidad de digitalización 
              está en el segmento 10-50 empleados: <strong>25.460 asesorías</strong> listas para modernizar.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Segmentación por Tamaño */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  Distribución por tamaño de despacho
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Total: 67.000 asesorías registradas en España (2024)
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <LazyResponsiveContainer height={320}>
                    <LazyBarChart data={segmentacion} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <LazyCartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                      <LazyXAxis 
                        dataKey="segmento" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                      />
                      <LazyYAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <LazyTooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        formatter={(value, name) => [
                          `${value}% (${segmentacion.find(s => s.porcentaje === value)?.count.toLocaleString()} asesorías)`,
                          'Porcentaje'
                        ]}
                      />
                      <LazyBar 
                        dataKey="porcentaje" 
                        radius={[4, 4, 0, 0]}
                        fill="hsl(var(--primary))"
                      />
                    </LazyBarChart>
                  </LazyResponsiveContainer>
                </div>
                
                <div className="mt-4 space-y-2">
                  {segmentacion.map((seg, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="font-medium">{seg.segmento}</span>
                      <Badge variant={idx === 1 || idx === 2 ? "default" : "secondary"}>
                        {seg.count.toLocaleString()} asesorías
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Distribución Geográfica */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Distribución geográfica por CCAA
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Concentración en Madrid y Cataluña, oportunidades en resto
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <LazyResponsiveContainer height={320}>
                    <LazyPieChart>
                      <LazyPie
                        data={geografia}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="asesorias"
                        nameKey="ccaa"
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                      >
                        {geografia.map((entry, index) => (
                          <LazyCell 
                            key={`cell-${index}`} 
                            fill={geografiaColors[entry.densidad as keyof typeof geografiaColors]} 
                          />
                        ))}
                      </LazyPie>
                      <LazyTooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value, name) => [
                          `${(value as number).toLocaleString()} asesorías`,
                          name
                        ]}
                      />
                    </LazyPieChart>
                  </LazyResponsiveContainer>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {geografia.slice(0, 6).map((geo, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="font-medium">{geo.ccaa}</span>
                        <Badge 
                          variant="outline" 
                          className={geo.densidad === 'alta' ? 'border-primary' : ''}
                        >
                          {geo.asesorias.toLocaleString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Target Market Highlight */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-normal mb-2">
                    Target de modernización: 25.460 asesorías
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Los despachos de 10-50 empleados representan el 38% del mercado y son los más preparados 
                    para adoptar soluciones post-on-premise como SuiteLoop.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Pequeño: 17.420 asesorías</Badge>
                    <Badge>Mediano: 8.040 asesorías</Badge>
                    <Badge variant="outline">€890M TAM estimado</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default MarketAnalysis;