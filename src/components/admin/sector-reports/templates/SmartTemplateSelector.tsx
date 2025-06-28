
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Search, Filter, Star, Crown, Zap, Globe, Leaf, TrendingUp } from 'lucide-react';
import { SmartTemplate, SectorReportRequest } from '@/types/sectorReports';

interface SmartTemplateSelectorProps {
  onSelectTemplate: (template: Partial<SectorReportRequest>) => void;
  currentSector?: string;
  currentAudience?: string;
}

const SmartTemplateSelector: React.FC<SmartTemplateSelectorProps> = ({
  onSelectTemplate,
  currentSector,
  currentAudience
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favoriteTemplates, setFavoriteTemplates] = useState<string[]>([]);

  const smartTemplates: SmartTemplate[] = [
    {
      id: 'investor-deep-dive',
      name: 'Análisis Profundo para Inversores',
      description: 'Reporte exhaustivo con múltiplos, análisis de riesgo y oportunidades de inversión',
      icon: '📊',
      category: 'investor',
      estimatedTime: '5-7 min',
      targetWords: '4,000-5,500',
      audience: ['investors'],
      features: ['Múltiplos avanzados', 'Análisis de riesgo', 'Comparativas'],
      premium: true,
      config: {
        reportType: 'valuation-multiples',
        depth: 'advanced',
        includeData: {
          multiples: true,
          caseStudies: true,
          statistics: true,
          visualizations: true,
          infographics: true,
          heatmaps: false
        },
        visualization: {
          includeCharts: true,
          chartTypes: ['bar', 'line', 'scatter'],
          includeInfographics: true,
          includeHeatmaps: false
        }
      },
      intelligentSuggestions: {
        sectors: ['tecnologia', 'healthcare', 'fintech'],
        audiences: ['investors', 'advisors'],
        commonCombinations: []
      },
      adaptiveConfig: {
        sectorSpecificFocus: {
          'tecnologia': 'Enfoque en métricas SaaS y múltiplos de crecimiento',
          'healthcare': 'Análisis regulatorio y pipeline de productos'
        },
        audienceOptimization: {
          'investors': { customFocus: 'ROI y métricas de inversión' }
        }
      }
    },
    {
      id: 'esg-sustainability',
      name: 'ESG y Sostenibilidad Sectorial',
      description: 'Análisis completo de factores ESG y tendencias de sostenibilidad',
      icon: '🌱',
      category: 'esg',
      estimatedTime: '4-6 min',
      targetWords: '3,500-4,500',
      audience: ['investors', 'executives'],
      features: ['Métricas ESG', 'Riesgos climáticos', 'Impacto social'],
      config: {
        reportType: 'esg-sustainability',
        depth: 'intermediate',
        includeData: {
          multiples: false,
          caseStudies: true,
          statistics: true,
          visualizations: true,
          infographics: true,
          heatmaps: true
        }
      },
      intelligentSuggestions: {
        sectors: ['energia', 'industrial', 'retail'],
        audiences: ['investors', 'executives'],
        commonCombinations: []
      },
      adaptiveConfig: {
        sectorSpecificFocus: {},
        audienceOptimization: {}
      }
    },
    {
      id: 'tech-disruption',
      name: 'Disrupciones Tecnológicas',
      description: 'Análisis de tendencias tech y su impacto en el sector',
      icon: '🚀',
      category: 'tech',
      estimatedTime: '3-5 min',
      targetWords: '2,500-3,500',
      audience: ['entrepreneurs', 'executives'],
      features: ['IA y Automatización', 'Startups disruptivas', 'Tendencias futuras'],
      config: {
        reportType: 'tech-disruption',
        depth: 'intermediate',
        includeData: {
          multiples: false,
          caseStudies: true,
          statistics: true,
          visualizations: true,
          infographics: true,
          heatmaps: false
        }
      },
      intelligentSuggestions: {
        sectors: ['tecnologia', 'fintech', 'retail'],
        audiences: ['entrepreneurs', 'executives'],
        commonCombinations: []
      },
      adaptiveConfig: {
        sectorSpecificFocus: {},
        audienceOptimization: {}
      }
    },
    {
      id: 'geographic-expansion',
      name: 'Análisis Geográfico',
      description: 'Comparativa de mercados por regiones y oportunidades globales',
      icon: '🌍',
      category: 'geographic',
      estimatedTime: '4-6 min',
      targetWords: '3,000-4,000',
      audience: ['investors', 'entrepreneurs', 'executives'],
      features: ['Comparativas regionales', 'Oportunidades globales', 'Riesgos geopolíticos'],
      config: {
        reportType: 'geographic-comparison',
        depth: 'intermediate',
        includeData: {
          multiples: true,
          caseStudies: true,
          statistics: true,
          visualizations: true,
          infographics: false,
          heatmaps: true
        },
        geography: ['europa', 'norteamerica', 'asia']
      },
      intelligentSuggestions: {
        sectors: ['tecnologia', 'retail', 'industrial'],
        audiences: ['investors', 'entrepreneurs'],
        commonCombinations: []
      },
      adaptiveConfig: {
        sectorSpecificFocus: {},
        audienceOptimization: {}
      }
    },
    {
      id: 'ma-trends-advanced',
      name: 'Tendencias M&A Avanzadas',
      description: 'Análisis profundo de fusiones y adquisiciones con visualizaciones',
      icon: '🔄',
      category: 'strategic',
      estimatedTime: '5-7 min',
      targetWords: '4,000-5,000',
      audience: ['investors', 'advisors'],
      features: ['Deal flow', 'Múltiplos M&A', 'Mapas de calor'],
      premium: true,
      config: {
        reportType: 'ma-trends',
        depth: 'advanced',
        includeData: {
          multiples: true,
          caseStudies: true,
          statistics: true,
          visualizations: true,
          infographics: true,
          heatmaps: true
        }
      },
      intelligentSuggestions: {
        sectors: ['tecnologia', 'healthcare', 'fintech'],
        audiences: ['investors', 'advisors'],
        commonCombinations: []
      },
      adaptiveConfig: {
        sectorSpecificFocus: {},
        audienceOptimization: {}
      }
    },
    {
      id: 'quick-entrepreneur',
      name: 'Resumen Ejecutivo Rápido',
      description: 'Análisis conciso para emprendedores con insights clave',
      icon: '⚡',
      category: 'quick',
      estimatedTime: '2-3 min',
      targetWords: '1,500-2,000',
      audience: ['entrepreneurs'],
      features: ['Insights clave', 'Oportunidades', 'Resumen visual'],
      config: {
        reportType: 'market-analysis',
        depth: 'basic',
        includeData: {
          multiples: false,
          caseStudies: true,
          statistics: true,
          visualizations: true,
          infographics: true,
          heatmaps: false
        }
      },
      intelligentSuggestions: {
        sectors: ['tecnologia', 'retail', 'servicios'],
        audiences: ['entrepreneurs'],
        commonCombinations: []
      },
      adaptiveConfig: {
        sectorSpecificFocus: {},
        audienceOptimization: {}
      }
    }
  ];

  const filteredTemplates = smartTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesAudience = !currentAudience || template.audience.includes(currentAudience as any);
    
    return matchesSearch && matchesCategory && matchesAudience;
  });

  const getIntelligentSuggestions = (template: SmartTemplate) => {
    if (currentSector && template.adaptiveConfig.sectorSpecificFocus[currentSector]) {
      return {
        ...template.config,
        customFocus: template.adaptiveConfig.sectorSpecificFocus[currentSector]
      };
    }
    return template.config;
  };

  const toggleFavorite = (templateId: string) => {
    setFavoriteTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      investor: '📊',
      esg: '🌱',
      tech: '🚀',
      geographic: '🌍',
      strategic: '🔄',
      quick: '⚡'
    };
    return icons[category as keyof typeof icons] || '📄';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Templates Inteligentes
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Templates optimizados para tu sector y audiencia
          </p>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            <SelectItem value="quick">Rápido</SelectItem>
            <SelectItem value="investor">Inversores</SelectItem>
            <SelectItem value="strategic">Estratégico</SelectItem>
            <SelectItem value="esg">ESG</SelectItem>
            <SelectItem value="tech">Tecnología</SelectItem>
            <SelectItem value="geographic">Geográfico</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sugerencias inteligentes */}
      {currentSector && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <Zap className="h-4 w-4" />
            <span className="font-medium">Recomendado para {currentSector}</span>
          </div>
          <div className="flex gap-2">
            {filteredTemplates
              .filter(t => t.intelligentSuggestions.sectors.includes(currentSector))
              .slice(0, 3)
              .map(template => (
                <Badge key={template.id} variant="secondary" className="text-xs">
                  {template.name}
                </Badge>
              ))
            }
          </div>
        </div>
      )}

      {/* Templates grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card 
            key={template.id} 
            className="hover:shadow-md transition-shadow cursor-pointer relative"
            onClick={() => onSelectTemplate(getIntelligentSuggestions(template))}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{template.icon}</span>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {template.name}
                      {template.premium && <Crown className="h-4 w-4 text-yellow-500" />}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {template.description}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(template.id);
                  }}
                  className="p-1"
                >
                  <Star 
                    className={`h-4 w-4 ${
                      favoriteTemplates.includes(template.id) 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-400'
                    }`} 
                  />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>⏱️ {template.estimatedTime}</span>
                  <span>📝 {template.targetWords}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    {getCategoryIcon(template.category)} {template.category}
                  </Badge>
                  {template.audience.slice(0, 2).map(aud => (
                    <Badge key={aud} variant="secondary" className="text-xs">
                      {aud}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-1">
                  {template.features.slice(0, 3).map(feature => (
                    <div key={feature} className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="h-1 w-1 bg-blue-500 rounded-full"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTemplate(getIntelligentSuggestions(template));
                  }}
                >
                  Usar Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Filter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No se encontraron templates con los filtros actuales</p>
          <Button
            variant="ghost"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="mt-2"
          >
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
};

export default SmartTemplateSelector;
