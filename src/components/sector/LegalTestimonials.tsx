import React from 'react';
import { Button } from '@/components/ui/button';
import { Quote } from 'lucide-react';

interface Testimonial {
  content: string;
  author: string;
  role: string;
  company?: string;
}

interface LegalTestimonialsProps {
  title?: string;
  testimonials: Testimonial[];
  ctaText?: string;
}

const LegalTestimonials = ({ title = "Testimonios", testimonials, ctaText }: LegalTestimonialsProps) => {
  return (
    <section className="py-16 bg-background border-t border-border">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-light text-foreground mb-12 tracking-tight">
          {title}
        </h2>

        <div className="space-y-12">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="border-l-2 border-border pl-8">
              <div className="relative">
                <Quote className="absolute -top-2 -left-10 w-6 h-6 text-muted-foreground" />
                
                <blockquote className="text-lg text-foreground leading-relaxed mb-6 font-light italic">
                  "{testimonial.content}"
                </blockquote>
                
                <div className="text-sm">
                  <cite className="not-italic font-medium text-foreground">
                    {testimonial.author}
                  </cite>
                  <div className="text-muted-foreground">
                    {testimonial.role}
                    {testimonial.company && `, ${testimonial.company}`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {ctaText && (
          <div className="mt-12 pt-8 border-t border-border">
            <Button variant="outline" className="text-sm px-6 py-3 border-border text-foreground hover:bg-muted transition-all font-medium">
              {ctaText}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default LegalTestimonials;