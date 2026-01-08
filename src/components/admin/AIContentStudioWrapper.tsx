
import React, { useState } from 'react';
import AIContentStudioPro from './AIContentStudioPro';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Brain, Target, FileText, Tags, Search } from 'lucide-react';

const AIContentStudioWrapper = () => {
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioConfig, setStudioConfig] = useState<{
    type: 'title' | 'content' | 'excerpt' | 'seo' | 'tags' | 'research';
    currentTitle?: string;
    currentContent?: string;
    category?: string;
  }>({
    type: 'content'
  });

  const handleOpenStudio = (type: 'title' | 'content' | 'excerpt' | 'seo' | 'tags' | 'research') => {
    setStudioConfig({ type });
    setIsStudioOpen(true);
  };

  const handleContentGenerated = (content: string) => {
    console.log('Contenido generado:', content);
    // Aquí podrías agregar lógica adicional para manejar el contenido generado
  };

  const studioOptions = [
    {
      type: 'title' as const,
      title: 'Generador de Títulos',
      description: 'Crea títulos irresistibles optimizados para SEO',
      icon: Target,
      color: 'bg-blue-500'
    },
    {
      type: 'content' as const,
      title: 'Escritor de Artículos',
      description: 'Genera artículos completos con estructura profesional',
      icon: FileText,
      color: 'bg-green-500'
    },
    {
      type: 'excerpt' as const,
      title: 'Creador de Extractos',
      description: 'Desarrolla extractos que convierten lectores en clientes',
      icon: Sparkles,
      color: 'bg-purple-500'
    },
    {
      type: 'seo' as const,
      title: 'Optimizador SEO',
      description: 'Optimiza meta títulos y descripciones para máxima visibilidad',
      icon: Search,
      color: 'bg-orange-500'
    },
    {
      type: 'tags' as const,
      title: 'Generador de Tags',
      description: 'Identifica los tags perfectos para tu contenido',
      icon: Tags,
      color: 'bg-indigo-500'
    },
    {
      type: 'research' as const,
      title: 'Asistente de Investigación',
      description: 'Investiga datos actuales y tendencias del mercado M&A',
      icon: Brain,
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-normal flex items-center gap-3 mb-2">
          <Brain className="h-8 w-8 text-blue-600" />
          AI Content Studio Pro
        </h1>
        <p className="text-gray-600 text-lg">
          Herramientas avanzadas de generación de contenido con IA para crear contenido profesional de M&A
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studioOptions.map((option) => (
          <Card key={option.type} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${option.color} text-white`}>
                  <option.icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">{option.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4 text-sm">
                {option.description}
              </CardDescription>
              <Button 
                onClick={() => handleOpenStudio(option.type)}
                className="w-full"
                variant="outline"
              >
                Abrir {option.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <AIContentStudioPro
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        onContentGenerated={handleContentGenerated}
        type={studioConfig.type}
        currentTitle={studioConfig.currentTitle}
        currentContent={studioConfig.currentContent}
        category={studioConfig.category}
      />
    </div>
  );
};

export default AIContentStudioWrapper;
