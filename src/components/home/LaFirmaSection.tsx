import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCountAnimation } from '@/hooks/useCountAnimation';


interface StatItem {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
}

const defaultContent = {
  section_label: 'La Firma',
  heading_line1: 'Confianza y experiencia',
  heading_line2: 'desde 2008',
  image_url: null as string | null,
  image_alt: 'Equipo Capittal en reunión',
  paragraph1: 'Desde 2008, acompañamos a empresarios en los momentos más importantes de sus trayectorias empresariales. Nuestra misión es maximizar el valor de cada operación con un enfoque personalizado y resultados medibles.',
  paragraph2: 'Combinamos experiencia sectorial, metodología probada y una red global de más de 2.000 contactos cualificados. Cada proyecto es único y recibe la dedicación de un equipo multidisciplinar comprometido con tu éxito.',
  value1_title: 'Confidencialidad',
  value1_text: 'Máxima discreción en cada operación',
  value2_title: 'Independencia',
  value2_text: 'Asesoramiento objetivo y transparente',
  cta_text: 'Conocer al equipo',
  cta_url: '/equipo',
  stat1_value: 902, stat1_suffix: 'M', stat1_prefix: '€', stat1_label: 'Valor asesorado',
  stat2_value: 200, stat2_suffix: '+', stat2_prefix: '', stat2_label: 'Operaciones',
  stat3_value: 98, stat3_suffix: '%', stat3_prefix: '', stat3_label: 'Tasa de éxito',
  stat4_value: 60, stat4_suffix: '+', stat4_prefix: '', stat4_label: 'Profesionales',
};

const StatCounter: React.FC<StatItem & { delay: number }> = ({ value, suffix, prefix = '', label, delay }) => {
  const { count, ref } = useCountAnimation(value, 2000 + delay, '');
  return (
    <div ref={ref} className="text-center md:text-left">
      <div className="text-foreground text-4xl md:text-5xl lg:text-6xl font-light tracking-tight">
        {prefix}{count}{suffix}
      </div>
      <div className="text-foreground/70 text-sm mt-2 tracking-wide uppercase">{label}</div>
    </div>
  );
};

const LaFirmaSection: React.FC = () => {
  const { data: dbContent, isLoading } = useQuery({
    queryKey: ['la-firma-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('la_firma_content')
        .select('*')
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const c = dbContent || defaultContent;

  if (isLoading) {
    return (
      <section id="la-firma" className="py-24 md:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 animate-pulse">
          <div className="h-6 w-24 bg-muted rounded mb-4" />
          <div className="h-12 w-96 max-w-full bg-muted rounded mb-16" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <div className="aspect-[4/3] bg-muted rounded" />
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
              <div className="h-4 bg-muted rounded w-4/6" />
            </div>
          </div>
        </div>
      </section>
    );
  }
  const imageSource = c.image_url || '';

  const stats: StatItem[] = [
    { value: c.stat1_value, suffix: c.stat1_suffix, prefix: c.stat1_prefix || '', label: c.stat1_label },
    { value: c.stat2_value, suffix: c.stat2_suffix, prefix: c.stat2_prefix || '', label: c.stat2_label },
    { value: c.stat3_value, suffix: c.stat3_suffix, prefix: c.stat3_prefix || '', label: c.stat3_label },
    { value: c.stat4_value, suffix: c.stat4_suffix, prefix: c.stat4_prefix || '', label: c.stat4_label },
  ];

  return (
    <section id="la-firma" className="py-24 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-16">
          <span className="text-foreground/60 text-sm tracking-[0.2em] uppercase block mb-4">{c.section_label}</span>
          <h2 className="font-serif text-foreground text-4xl md:text-5xl lg:text-6xl leading-tight">
            {c.heading_line1}<br /><span className="text-foreground">{c.heading_line2}</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative">
            <div className="aspect-[4/3] overflow-hidden bg-muted">
              {imageSource && <img src={imageSource} alt={c.image_alt || 'Capittal equipo de asesores M&A'} className="w-full h-full object-cover" width={800} height={600} loading="lazy" decoding="async" />}
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 border border-border -z-10 hidden lg:block" />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}>
            <p className="text-foreground/80 text-lg md:text-xl leading-relaxed mb-6">{c.paragraph1}</p>
            <p className="text-foreground/70 text-base leading-relaxed mb-8">{c.paragraph2}</p>

            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="border-l-2 border-border pl-4">
                <h4 className="text-foreground font-medium mb-1">{c.value1_title}</h4>
                <p className="text-foreground/70 text-sm">{c.value1_text}</p>
              </div>
              <div className="border-l-2 border-border pl-4">
                <h4 className="text-foreground font-medium mb-1">{c.value2_title}</h4>
                <p className="text-foreground/70 text-sm">{c.value2_text}</p>
              </div>
            </div>

            <a href={c.cta_url} className="inline-flex items-center gap-3 text-foreground text-sm font-medium tracking-wide hover:text-muted-foreground transition-colors group">
              {c.cta_text}
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }} className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mt-20 pt-16 border-t border-border">
          {stats.map((stat, index) => (
            <StatCounter key={stat.label} {...stat} delay={index * 200} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default LaFirmaSection;
