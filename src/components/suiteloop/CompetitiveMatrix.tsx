import React from 'react';
import { suiteloopData } from '@/data/suiteloop-data';

const CompetitiveMatrix: React.FC = () => {
  const rows = suiteloopData.mixCompetidores;

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
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left p-4 font-semibold">Proveedor</th>
                    <th className="text-center p-4 font-semibold">Cuota</th>
                    <th className="text-left p-4 font-semibold">Fortaleza</th>
                    <th className="text-left p-4 font-semibold">Gap</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="p-4 font-medium">{r.proveedor}</td>
                      <td className="text-center p-4 text-primary font-semibold">{r.marketShare}%</td>
                      <td className="p-4 text-muted-foreground">{r.fuerza}</td>
                      <td className="p-4 text-muted-foreground">{r.gap}</td>
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