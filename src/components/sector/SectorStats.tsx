
import React from 'react';

interface SectorStatsProps {
  stats: {
    number: string;
    label: string;
  }[];
}

const SectorStats: React.FC<SectorStatsProps> = ({ stats }) => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-black mb-2">
                {stat.number}
              </div>
              <div className="text-slate-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectorStats;
