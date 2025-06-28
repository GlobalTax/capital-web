
import React from 'react';
import { Award, CheckCircle } from 'lucide-react';

interface SectorExpertiseProps {
  title: string;
  description: string;
  expertiseAreas: string[];
  achievementTitle: string;
  achievementDescription: string;
  achievementDetails: string;
}

const SectorExpertise: React.FC<SectorExpertiseProps> = ({
  title,
  description,
  expertiseAreas,
  achievementTitle,
  achievementDescription,
  achievementDetails
}) => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
              {title}
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              {description}
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {expertiseAreas.map((area, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">{area}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-50 p-8 rounded-lg border-0.5 border-black">
            <Award className="w-16 h-16 text-blue-600 mb-6" />
            <h3 className="text-2xl font-bold text-black mb-4">
              {achievementTitle}
            </h3>
            <p className="text-slate-600 mb-4">
              {achievementDescription}
            </p>
            <p className="text-slate-600">
              {achievementDetails}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectorExpertise;
