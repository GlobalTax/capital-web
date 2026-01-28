import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote, Loader2, Award, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useBuyerTestimonials } from '@/hooks/useBuyerTestimonials';
import { useI18n } from '@/shared/i18n/I18nProvider';

const BuyerTestimonials = () => {
  const { data: testimonials, isLoading } = useBuyerTestimonials();
  const { t } = useI18n();

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Award className="h-4 w-4" />
            {t('buyerTestimonials.badge')}
          </div>
          <h2 className="text-4xl font-bold mb-4">
            {t('buyerTestimonials.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('buyerTestimonials.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {testimonial.avatar_initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold">{testimonial.buyer_name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.buyer_position}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.buyer_company}</p>
                  </div>
                  <Quote className="h-6 w-6 text-primary/20" />
                </div>

                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-4">
                  "{testimonial.testimonial_text}"
                </p>

                {testimonial.operation_type && (
                  <div className="border-t pt-4 space-y-2">
                    {testimonial.operation_type && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">{t('buyerTestimonials.operationType')}:</span>
                        <span className="font-semibold text-foreground">{testimonial.operation_type}</span>
                      </div>
                    )}
                    {testimonial.investment_range && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">{t('buyerTestimonials.investment')}:</span>
                        <span className="font-semibold text-primary">{testimonial.investment_range}</span>
                      </div>
                    )}
                    {testimonial.time_to_close && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">{t('buyerTestimonials.timeToClose')}:</span>
                        <span className="font-semibold text-foreground">{testimonial.time_to_close}</span>
                      </div>
                    )}
                    {testimonial.satisfaction_score && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">{t('buyerTestimonials.satisfactionScore')}:</span>
                        <span className="font-semibold text-green-600">{testimonial.satisfaction_score}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <p className="text-muted-foreground">
              <strong className="text-foreground">{t('buyerTestimonials.satisfaction')}: 9.5/10</strong> {t('buyerTestimonials.basedOn')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuyerTestimonials;
