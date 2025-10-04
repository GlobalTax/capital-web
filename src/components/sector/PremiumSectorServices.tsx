
import React from 'react';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface ServiceItem {
  icon: LucideIcon;
  title: string;
  description: string;
  features?: string[];
}

interface PremiumSectorServicesProps {
  title: string;
  subtitle: string;
  services: ServiceItem[];
}

const PremiumSectorServices: React.FC<PremiumSectorServicesProps> = ({ title, subtitle, services }) => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.03) 50%), linear-gradient(rgba(0,0,0,0.03) 50%, transparent 50%)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            {title}
          </h2>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div key={index} className="group">
              <div className="bg-white rounded-2xl p-8 border-0.5 border-gray-200 hover:shadow-2xl hover:border-gray-300 transition-all duration-500 hover:-translate-y-1 h-full">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <service.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-black mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      {service.description}
                    </p>
                    
                    {service.features && (
                      <ul className="space-y-2">
                        {service.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center text-sm text-slate-600">
                            <ArrowRight className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PremiumSectorServices;
