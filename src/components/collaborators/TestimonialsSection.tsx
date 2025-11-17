import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Quote } from 'lucide-react';
import { useI18n } from '@/shared/i18n/I18nProvider';

export const TestimonialsSection = () => {
  const { t } = useI18n();
  
  const testimonials = [
    {
      id: 1,
      name: t('collab.testimonials.1.name'),
      role: t('collab.testimonials.1.role'),
      company: t('collab.testimonials.1.company'),
      avatar: "",
      rating: 5,
      content: t('collab.testimonials.1.content'),
      sector: t('collab.testimonials.1.sector'),
      joinedYear: t('collab.testimonials.1.joinedYear')
    },
    {
      id: 2,
      name: t('collab.testimonials.2.name'),
      role: t('collab.testimonials.2.role'),
      company: t('collab.testimonials.2.company'),
      avatar: "",
      rating: 5,
      content: t('collab.testimonials.2.content'),
      sector: t('collab.testimonials.2.sector'),
      joinedYear: t('collab.testimonials.2.joinedYear')
    },
    {
      id: 3,
      name: t('collab.testimonials.3.name'),
      role: t('collab.testimonials.3.role'),
      company: t('collab.testimonials.3.company'),
      avatar: "",
      rating: 5,
      content: t('collab.testimonials.3.content'),
      sector: t('collab.testimonials.3.sector'),
      joinedYear: t('collab.testimonials.3.joinedYear')
    }
  ];
  
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
            {t('collab.testimonials.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('collab.testimonials.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white border border-gray-300 rounded-lg p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-4 h-4 fill-yellow-400 text-yellow-400" 
                  />
                ))}
              </div>

              {/* Quote */}
              <div className="relative mb-6">
                <Quote className="w-6 h-6 text-gray-300 absolute -top-1 -left-1" />
                <p className="text-gray-600 leading-relaxed pl-4">
                  "{testimonial.content}"
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback className="bg-black text-white">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-black">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {testimonial.role}
                  </p>
                  <p className="text-xs text-gray-500">
                    {testimonial.company}
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-300">
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {testimonial.sector}
                </div>
                <span className="text-xs text-gray-500">
                  {t('collab.testimonials.stats.since')} {testimonial.joinedYear}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-gray-300">
          <div className="text-center">
            <div className="text-3xl font-bold text-black mb-2">50+</div>
            <div className="text-gray-600 font-medium text-base">{t('collab.testimonials.stats.active')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-black mb-2">98,7%</div>
            <div className="text-gray-600 font-medium text-base">{t('collab.testimonials.stats.satisfaction')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-black mb-2">€500M+</div>
            <div className="text-gray-600 font-medium text-base">{t('collab.testimonials.stats.value')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-black mb-2">15</div>
            <div className="text-gray-600 font-medium text-base">{t('collab.testimonials.stats.experience')}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;