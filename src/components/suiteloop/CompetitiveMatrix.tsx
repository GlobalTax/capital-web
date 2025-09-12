import React from 'react';
import { Check, X } from 'lucide-react';
import { suiteloopData } from '@/data/suiteloop-data';

const CompetitiveMatrix: React.FC = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Comparativa de soluciones
            </h2>
          </div>

          <div className="bg-background rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4 font-semibold">Característica</th>
                    <th className="text-center p-4 font-semibold text-primary">SuiteLoop</th>
                    <th className="text-center p-4 font-semibold">Competidor A</th>
                    <th className="text-center p-4 font-semibold">Competidor B</th>
                  </tr>
                </thead>
                <tbody>
                  {suiteloopData.matrizCompetitiva.map((row, index) => (
                    <tr key={index} className="border-t border-border">
                      <td className="p-4 font-medium">{row.caracteristica}</td>
                      <td className="text-center p-4">
                        {row.suiteloop ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mx-auto" />
                        )}
                      </td>
                      <td className="text-center p-4">
                        {row.competidorA ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mx-auto" />
                        )}
                      </td>
                      <td className="text-center p-4">
                        {row.competidorB ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompetitiveMatrix;