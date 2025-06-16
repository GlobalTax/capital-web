
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Award } from 'lucide-react';

interface CaseStudyPreviewProps {
  caseStudy: {
    title: string;
    sector: string;
    company_size?: string;
    value_amount?: number;
    value_currency: string;
    description: string;
    highlights?: string[];
    year?: number;
    is_featured: boolean;
  };
}

const CaseStudyPreview = ({ caseStudy }: CaseStudyPreviewProps) => {
  return (
    <div className="p-6 bg-gray-50">
      <h3 className="text-lg font-medium text-black mb-4">Vista Previa - Caso de Éxito</h3>
      <Card className="bg-white border-0.5 border-black rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out group max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-white border-0.5 border-black text-black rounded-lg">
              {caseStudy.sector}
            </Badge>
            {caseStudy.is_featured && (
              <Award className="w-5 h-5 text-yellow-500" />
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-black mb-3 leading-tight">
            {caseStudy.title}
          </h3>
          
          <p className="text-gray-600 mb-4 leading-relaxed text-sm">
            {caseStudy.description}
          </p>

          <div className="space-y-3 mb-4">
            {caseStudy.value_amount && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Valoración:</span>
                <span className="text-xl font-bold text-black">
                  {caseStudy.value_amount}M{caseStudy.value_currency}
                </span>
              </div>
            )}
            
            {caseStudy.year && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Año:
                </span>
                <span className="font-medium text-black">{caseStudy.year}</span>
              </div>
            )}

            {caseStudy.company_size && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Tamaño:</span>
                <span className="font-medium text-black">{caseStudy.company_size}</span>
              </div>
            )}
          </div>

          {caseStudy.highlights && caseStudy.highlights.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-black mb-2">Destacados:</h4>
              {caseStudy.highlights.slice(0, 3).map((highlight, idx) => (
                <div key={idx} className="flex items-start text-sm text-gray-600">
                  <TrendingUp className="w-3 h-3 text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span className="leading-relaxed">{highlight}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CaseStudyPreview;
