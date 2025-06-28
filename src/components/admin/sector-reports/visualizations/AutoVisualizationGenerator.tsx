
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter
} from 'recharts';
import {
  Sparkles, BarChart3, LineChart as LineIcon, PieChart as PieIcon, 
  TrendingUp, Map, Image, Download, Wand2, RefreshCw
} from 'lucide-react';
import { SectorReportResult, ChartData, InfographicData, HeatmapData } from '@/types/sectorReports';

interface AutoVisualizationGeneratorProps {
  report: SectorReportResult;
  onVisualizationsGenerated: (visualizations: any) => void;
}

const AutoVisualizationGenerator: React.FC<AutoVisualizationGeneratorProps> = ({
  report,
  onVisualizationsGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('charts');
  const [generatedCharts, setGeneratedCharts] = useState<ChartData[]>([]);
  const [generatedInfographics, setGeneratedInfographics] = useState<InfographicData[]>([]);
  const [generatedHeatmaps, setGeneratedHeatmaps] = useState<HeatmapData[]>([]);

  // Datos de ejemplo para demostrar las visualizaciones
  const sampleMultiplesData = [
    { sector: 'Tecnología', ebitda: 15.2, revenue: 4.8, book: 2.1 },
    { sector: 'Healthcare', ebitda: 12.8, revenue: 3.2, book: 1.8 },
    { sector: 'Industrial', ebitda: 8.5, revenue: 2.1, book: 1.2 },
    { sector: 'Retail', ebitda: 6.2, revenue: 1.8, book: 0.9 },
    { sector: 'Energía', ebitda: 5.8, revenue: 1.5, book: 0.8 }
  ];

  const sampleMAData = [
    { year: '2020', deals: 45, value: 2.3 },
    { year: '2021', deals: 62, value: 4.1 },
    { year: '2022', deals: 78, value: 5.8 },
    { year: '2023', deals: 91, value: 7.2 },
    { year: '2024', deals: 85, value: 6.9 }
  ];

  const sampleGeographicData = [
    { region: 'Europa', activity: 85, growth: 12.3 },
    { region: 'Norte América', activity: 92, growth: 8.7 },
    { region: 'Asia-Pacífico', activity: 78, growth: 15.2 },
    { region: 'Latinoamérica', activity: 45, growth: 9.8 },
    { region: 'Oriente Medio', activity: 38, growth: 6.4 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const generateVisualizations = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simular progreso de generación
      const steps = [
        { progress: 20, message: 'Analizando datos del reporte...' },
        { progress: 40, message: 'Generando gráficos de múltiplos...' },
        { progress: 60, message: 'Creando visualizaciones M&A...' },
        { progress: 80, message: 'Generando mapas de calor...' },
        { progress: 100, message: 'Finalizando visualizaciones...' }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setGenerationProgress(step.progress);
      }

      // Generar gráficos basados en el tipo de reporte
      const charts: ChartData[] = [];
      const infographics: InfographicData[] = [];
      const heatmaps: HeatmapData[] = [];

      if (report.reportType === 'valuation-multiples' || report.metadata.includeData.multiples) {
        charts.push({
          id: 'multiples-comparison',
          type: 'bar',
          title: 'Comparación de Múltiplos por Sector',
          data: sampleMultiplesData,
          config: {
            xAxis: 'sector',
            yAxis: ['ebitda', 'revenue', 'book'],
            colors: COLORS
          }
        });
      }

      if (report.reportType === 'ma-trends') {
        charts.push({
          id: 'ma-trends',
          type: 'line',
          title: 'Evolución de la Actividad M&A',
          data: sampleMAData,
          config: {
            xAxis: 'year',
            yAxis: ['deals', 'value'],
            colors: COLORS
          }
        });

        charts.push({
          id: 'deal-distribution',
          type: 'pie',
          title: 'Distribución de Deals por Valor',
          data: sampleMAData.map(d => ({ name: d.year, value: d.value })),
          config: {
            colors: COLORS
          }
        });
      }

      if (report.reportType === 'geographic-comparison' || report.metadata.geography) {
        charts.push({
          id: 'geographic-activity',
          type: 'bar',
          title: 'Actividad por Región',
          data: sampleGeographicData,
          config: {
            xAxis: 'region',
            yAxis: ['activity', 'growth'],
            colors: COLORS
          }
        });

        heatmaps.push({
          id: 'regional-heatmap',
          title: 'Mapa de Calor - Actividad Regional',
          data: sampleGeographicData.map(d => ({
            sector: report.sector,
            region: d.region,
            activity: d.activity,
            value: d.growth
          })),
          config: {
            colorScale: ['#E3F2FD', '#1976D2']
          }
        });
      }

      // Generar infografías automáticas
      infographics.push({
        id: 'key-metrics',
        title: 'Métricas Clave del Sector',
        elements: [
          {
            type: 'stat',
            content: { value: report.wordCount, label: 'Palabras analizadas' },
            position: { x: 10, y: 10 },
            style: { color: '#1976D2' }
          },
          {
            type: 'stat',
            content: { value: report.metadata.confidence ? Math.round(report.metadata.confidence * 100) : 85, label: '% Confianza' },
            position: { x: 10, y: 50 },
            style: { color: '#388E3C' }
          }
        ]
      });

      setGeneratedCharts(charts);
      setGeneratedInfographics(infographics);
      setGeneratedHeatmaps(heatmaps);

      onVisualizationsGenerated({
        charts,
        infographics,
        heatmaps
      });

    } finally {
      setIsGenerating(false);
    }
  };

  const renderChart = (chart: ChartData) => {
    switch (chart.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.config.xAxis} />
              <YAxis />
              <Tooltip />
              {chart.config.yAxis.map((key: string, index: number) => (
                <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.config.xAxis} />
              <YAxis />
              <Tooltip />
              {chart.config.yAxis.map((key: string, index: number) => (
                <Line key={key} type="monotone" dataKey={key} stroke={COLORS[index % COLORS.length]} strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chart.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chart.data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">Gráfico {chart.type}</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Visualizaciones Automáticas
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Gráficos e infografías generadas automáticamente para tu reporte
          </p>
        </div>
        <Button onClick={generateVisualizations} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Generar Visualizaciones
            </>
          )}
        </Button>
      </div>

      {isGenerating && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Generando visualizaciones...</span>
                <span>{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="charts">
            <BarChart3 className="h-4 w-4 mr-1" />
            Gráficos ({generatedCharts.length})
          </TabsTrigger>
          <TabsTrigger value="infographics">
            <Image className="h-4 w-4 mr-1" />
            Infografías ({generatedInfographics.length})
          </TabsTrigger>
          <TabsTrigger value="heatmaps">
            <Map className="h-4 w-4 mr-1" />
            Mapas de Calor ({generatedHeatmaps.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          {generatedCharts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h4 className="text-lg font-medium mb-2">No hay gráficos generados</h4>
                <p className="text-sm mb-4">Genera visualizaciones para ver gráficos automáticos</p>
                <Button onClick={generateVisualizations}>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generar Gráficos
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {generatedCharts.map((chart) => (
                <Card key={chart.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      {chart.title}
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {chart.type}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderChart(chart)}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="infographics" className="space-y-4">
          {generatedInfographics.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Image className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h4 className="text-lg font-medium mb-2">No hay infografías generadas</h4>
                <p className="text-sm mb-4">Genera visualizaciones para crear infografías automáticas</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedInfographics.map((infographic) => (
                <Card key={infographic.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{infographic.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                      <div className="text-center space-y-4">
                        {infographic.elements.map((element, index) => (
                          <div key={index} className="space-y-1">
                            <div className="text-2xl font-bold text-blue-600">
                              {element.content.value}
                            </div>
                            <div className="text-sm text-gray-600">
                              {element.content.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="heatmaps" className="space-y-4">
          {generatedHeatmaps.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Map className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h4 className="text-lg font-medium mb-2">No hay mapas de calor generados</h4>
                <p className="text-sm mb-4">Genera visualizaciones para crear mapas de calor automáticos</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {generatedHeatmaps.map((heatmap) => (
                <Card key={heatmap.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{heatmap.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Map className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <span className="text-gray-500">Mapa de Calor Interactivo</span>
                        <div className="mt-2 text-xs text-gray-400">
                          {heatmap.data.length} puntos de datos
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutoVisualizationGenerator;
