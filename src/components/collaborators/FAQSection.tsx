import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { HelpCircle } from 'lucide-react';
import { useI18n } from '@/shared/i18n/I18nProvider';

export const FAQSection = () => {
  const { t } = useI18n();
  
  const faqs = [
    { id: "faq-1", question: t('collab.faq.q1'), answer: t('collab.faq.a1') },
    { id: "faq-2", question: t('collab.faq.q2'), answer: t('collab.faq.a2') },
    { id: "faq-3", question: t('collab.faq.q3'), answer: t('collab.faq.a3') },
    { id: "faq-4", question: t('collab.faq.q4'), answer: t('collab.faq.a4') },
    { id: "faq-5", question: t('collab.faq.q5'), answer: t('collab.faq.a5') },
    { id: "faq-6", question: t('collab.faq.q6'), answer: t('collab.faq.a6') }
  ];
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 flex items-center justify-center gap-2 w-fit mx-auto">
              <HelpCircle className="w-4 h-4" />
              Preguntas Frecuentes
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              {t('collab.faq.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('collab.faq.subtitle')}
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq) => (
              <AccordionItem 
                key={faq.id} 
                value={faq.id}
                className="admin-card border-0 rounded-lg"
              >
                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                  <span className="font-semibold text-foreground">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;