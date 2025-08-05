
import React from 'react';

const About = () => {
  return (
    <section id="nosotros" className="py-24 bg-background">
      <div className="container max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-foreground mb-6 tracking-tight">
            Gestión Integral de Procesos de Compraventa
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
            Capittal forma parte del Grupo Navarro, un ecosistema integral de servicios profesionales 
            que garantiza el éxito de cada transacción. Contamos con más de 70 especialistas que 
            trabajan de forma coordinada para maximizar el valor de tu operación desde el primer día.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 py-8 border-t border-b border-border">
          <div className="text-center">
            <div className="text-3xl font-light text-foreground mb-2">70+</div>
            <div className="text-muted-foreground font-light text-base">Profesionales</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-light text-foreground mb-2">15+</div>
            <div className="text-muted-foreground font-light text-base">Años Experiencia</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-light text-foreground mb-2">4</div>
            <div className="text-muted-foreground font-light text-base">Especialidades</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-light text-foreground mb-2">100%</div>
            <div className="text-muted-foreground font-light text-base">Dedicación</div>
          </div>
        </div>

        {/* Ecosystem Section */}
        <div className="mb-20 text-center">
          <h3 className="text-xl font-light text-foreground mb-6 tracking-tight">
            Ecosistema Integral del Grupo Navarro
          </h3>
          <p className="text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light">
            Nuestro enfoque multidisciplinar nos permite cubrir todas las áreas críticas de una transacción M&A. 
            Desde el análisis legal hasta la optimización fiscal, pasando por la gestión laboral y el análisis 
            financiero, cada especialista aporta su experiencia para garantizar el éxito de tu operación.
          </p>
        </div>

        {/* Specialties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6 bg-card border border-border rounded-lg">
            <h3 className="text-lg font-medium text-foreground mb-3">
              Abogados
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed font-light">
              Especialistas en derecho mercantil y transacciones empresariales con amplia experiencia en operaciones complejas.
            </p>
          </div>

          <div className="text-center p-6 bg-card border border-border rounded-lg">
            <h3 className="text-lg font-medium text-foreground mb-3">
              Asesores Fiscales
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed font-light">
              Expertos en optimización fiscal y planificación tributaria para maximizar la eficiencia de cada transacción.
            </p>
          </div>

          <div className="text-center p-6 bg-card border border-border rounded-lg">
            <h3 className="text-lg font-medium text-foreground mb-3">
              Asesores Laborales
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed font-light">
              Especialistas en derecho laboral y recursos humanos para gestionar aspectos críticos del capital humano.
            </p>
          </div>

          <div className="text-center p-6 bg-card border border-border rounded-lg">
            <h3 className="text-lg font-medium text-foreground mb-3">
              Economistas
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed font-light">
              Expertos en gestión empresarial y análisis financiero para valoraciones precisas y estrategias sólidas.
            </p>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="mt-20 text-center">
          <h3 className="text-xl font-light text-foreground mb-6 tracking-tight">
            Nuestro Compromiso
          </h3>
          <p className="text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light">
            En Capittal, no solo ejecutamos transacciones, creamos valor. Nuestro enfoque integral y 
            la experiencia combinada de nuestros especialistas nos permite identificar oportunidades, 
            mitigar riesgos y maximizar el retorno de cada operación. Tu éxito es nuestro éxito.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
