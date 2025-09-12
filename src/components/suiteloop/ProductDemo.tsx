import React, { useState } from 'react';
import { Play } from 'lucide-react';

const ProductDemo: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Ve SuiteLoop en acción
            </h2>
            <p className="text-muted-foreground">
              Demo de 3 minutos mostrando las funcionalidades principales
            </p>
          </div>

          <div className="relative bg-muted rounded-lg overflow-hidden aspect-video">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <button
                  onClick={() => setIsPlaying(true)}
                  className="bg-primary text-primary-foreground rounded-full p-4 hover:bg-primary/90 transition-colors"
                >
                  <Play className="h-8 w-8 ml-1" />
                </button>
                <p className="text-muted-foreground mt-4">
                  Haz clic para ver la demo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDemo;