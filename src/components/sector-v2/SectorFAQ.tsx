import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface SectorFAQProps {
  title?: string;
  subtitle?: string;
  faqs: FAQItem[];
  accentColor?: 'emerald' | 'blue' | 'amber' | 'slate' | 'stone' | 'rose' | 'indigo' | 'pink';
}

const colorClasses = {
  emerald: {
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600'
  },
  blue: {
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  amber: {
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600'
  },
  slate: {
    iconBg: 'bg-slate-200',
    iconColor: 'text-slate-600'
  },
  stone: {
    iconBg: 'bg-stone-100',
    iconColor: 'text-stone-600'
  },
  rose: {
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600'
  },
  indigo: {
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600'
  },
  pink: {
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600'
  }
};

const SectorFAQ: React.FC<SectorFAQProps> = ({
  title = "Preguntas Frecuentes",
  subtitle,
  faqs,
  accentColor = 'emerald'
}) => {
  const colors = colorClasses[accentColor];

  // Generate FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="py-20 bg-slate-50">
      {/* FAQ Schema for SEO */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${colors.iconBg} mb-6`}>
            <HelpCircle className={`h-7 w-7 ${colors.iconColor}`} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-slate-600">
              {subtitle}
            </p>
          )}
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <Accordion type="single" collapsible className="divide-y divide-slate-100">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-none">
                <AccordionTrigger className="px-6 py-5 text-left text-lg font-medium text-slate-900 hover:text-slate-700 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5 text-slate-600 leading-relaxed">
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

export default SectorFAQ;
