
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

interface TestimonialPreviewProps {
  testimonial: {
    client_name: string;
    client_company: string;
    client_position?: string;
    testimonial_text: string;
    rating: number;
    sector?: string;
    client_photo_url?: string;
  };
}

const TestimonialPreview = ({ testimonial }: TestimonialPreviewProps) => {
  return (
    <div className="p-6 bg-gray-50">
      <h3 className="text-lg font-medium text-black mb-4">Vista Previa - Testimonio</h3>
      <Card className="bg-white border-0.5 border-black rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <Quote className="w-8 h-8 text-gray-300" />
            <div className="flex">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
              ))}
            </div>
          </div>
          
          <p className="text-gray-700 mb-6 leading-relaxed italic">
            "{testimonial.testimonial_text}"
          </p>

          <div className="flex items-center">
            {testimonial.client_photo_url ? (
              <img
                src={testimonial.client_photo_url}
                alt={testimonial.client_name}
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                <span className="text-gray-500 font-medium text-sm">
                  {testimonial.client_name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <p className="font-semibold text-black">{testimonial.client_name}</p>
              <p className="text-sm text-gray-600">
                {testimonial.client_position} en {testimonial.client_company}
              </p>
              {testimonial.sector && (
                <p className="text-xs text-gray-500 mt-1">{testimonial.sector}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestimonialPreview;
