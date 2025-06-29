
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { FileText, Building2, Calculator, PenTool, MessageSquare, TrendingUp } from 'lucide-react';

export function SectionCards() {
  const { stats, isLoading } = useDashboardStats();

  const cards = [
    {
      title: "Casos de Éxito",
      value: stats.caseStudies,
      description: "Transacciones documentadas",
      icon: FileText,
      color: "text-blue-600"
    },
    {
      title: "Operaciones",
      value: stats.operations,
      description: "Deal flow activo",
      icon: Building2,
      color: "text-green-600"
    },
    {
      title: "Valoraciones",
      value: stats.valuations,
      description: "Cálculos realizados",
      icon: Calculator,
      color: "text-purple-600"
    },
    {
      title: "Blog Posts",
      value: stats.blogPosts,
      description: "Contenido publicado",
      icon: PenTool,
      color: "text-orange-600"
    },
    {
      title: "Testimonios",
      value: stats.testimonials,
      description: "Reseñas de clientes",
      icon: MessageSquare,
      color: "text-cyan-600"
    },
    {
      title: "Estadísticas",
      value: stats.statistics,
      description: "Métricas del negocio",
      icon: TrendingUp,
      color: "text-pink-600"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 px-4 lg:px-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 px-4 lg:px-6">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <p className="text-xs text-gray-500 mt-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
