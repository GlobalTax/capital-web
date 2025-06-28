
import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { ArrowRight, Phone, Mail } from 'lucide-react';

interface PremiumSectorCTAProps {
  title: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  contactInfo?: {
    phone?: string;
    email?: string;
  };
}

const PremiumSectorCTA: React.FC<PremiumSectorCTAProps> = ({
  title,
  description,
  primaryButtonText,
  secondaryButtonText,
  contactInfo
}) => {
  return (
    <section className="py-24 bg-gradient-to-br from-white to-slate-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-black leading-tight">
              {title}
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              {description}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <InteractiveHoverButton
              text={primaryButtonText}
              variant="primary"
              size="lg"
              className="bg-black text-white border-black hover:shadow-2xl group"
            />
            
            <InteractiveHoverButton
              text={secondaryButtonText}
              variant="outline"
              size="lg"
              className="border-black text-black hover:bg-gray-50 group"
            />
          </div>
          
          {contactInfo && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-slate-600 mb-4">
                ¿Prefiere hablar directamente con nuestros especialistas?
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                {contactInfo.phone && (
                  <a 
                    href={`tel:${contactInfo.phone}`}
                    className="flex items-center space-x-2 text-black hover:text-blue-600 transition-colors duration-300 group"
                  >
                    <Phone className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-medium">{contactInfo.phone}</span>
                  </a>
                )}
                {contactInfo.email && (
                  <a 
                    href={`mailto:${contactInfo.email}`}
                    className="flex items-center space-x-2 text-black hover:text-blue-600 transition-colors duration-300 group"
                  >
                    <Mail className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-medium">{contactInfo.email}</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PremiumSectorCTA;
