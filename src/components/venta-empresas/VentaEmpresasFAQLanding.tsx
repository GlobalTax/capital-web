import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const VentaEmpresasFAQLanding = () => {
  const [openItems, setOpenItems] = useState<number[]>([0]); // First item open by default

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqs = [
    {
      question: "¿Realmente la consulta inicial es GRATUITA?",
      answer: "Sí, completamente gratuita. Analizamos tu caso y te explicamos el proceso. Solo cobramos cuando vendemos tu empresa exitosamente.",
      highlight: "100% Gratuita"
    },
    {
      question: "¿Cuánto tiempo tarda el proceso?",
      answer: "El proceso completo dura entre 6 y 12 meses. La valoración inicial la tienes en 48h.",
      highlight: "6-12 meses"
    },
    {
      question: "¿Es confidencial?",
      answer: "Absolutamente. Firmamos acuerdos de confidencialidad y solo compartimos información con compradores cualificados tras tu autorización.",
      highlight: "100% Confidencial"
    },
    {
      question: "¿Qué tamaño de empresa necesito?",
      answer: "Trabajamos con empresas a partir de 1M€ de facturación. El mínimo varía entre 1M€ y 3M€ según el sector.",
      highlight: "Desde 1M€"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-slate-200 text-slate-800 rounded-full text-sm font-medium mb-6">
            <HelpCircle className="mr-2 h-4 w-4" />
            Resolvemos Todas Tus Dudas
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Preguntas <span className="text-foreground font-black">Frecuentes</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            <strong className="text-foreground">¡Estas son las preguntas que nos hacen el 98,7% de nuestros clientes!</strong> 
            Si tienes alguna duda más, llámanos y te la resolvemos en 2 minutos.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <button
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors duration-200"
                onClick={() => toggleItem(index)}
              >
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {faq.question}
                  </h3>
                  <span className="inline-flex items-center px-3 py-1 bg-slate-200 text-slate-800 rounded-full text-xs font-bold">
                    ⭐ {faq.highlight}
                  </span>
                </div>
                <div className="ml-4 flex-shrink-0">
                  {openItems.includes(index) ? (
                    <ChevronUp className="h-6 w-6 text-slate-900" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
              </button>
              
              {openItems.includes(index) && (
                <div className="px-8 pb-6 border-t border-border bg-muted/30">
                  <div className="pt-4">
                    <p className="text-muted-foreground leading-relaxed text-base">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">¿Tienes Más Preguntas?</h3>
            <p className="text-slate-200 mb-6">
              ¡Llámanos AHORA y te las resolvemos todas en una conversación de 15 minutos! 
              Sin compromisos, solo información clara y directa.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="tel:+34695717490"
                className="inline-flex items-center px-6 py-3 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-100 transition-colors duration-200"
              >
                📞 Llamar Ahora: 695 717 490
              </a>
              
              <div className="text-slate-300 text-sm font-medium">
                ⏰ Horario: L-V 9:00-19:00 | Sáb 10:00-14:00
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasFAQLanding;
