import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

// Puntos de actividad de Search Funds en España
const activityPoints = [
  { x: 200, y: 120, city: "Madrid", count: 28 },
  { x: 310, y: 100, city: "Barcelona", count: 15 },
  { x: 265, y: 175, city: "Valencia", count: 8 },
  { x: 115, y: 85, city: "Bilbao", count: 6 },
  { x: 95, y: 210, city: "Sevilla", count: 5 },
  { x: 250, y: 75, city: "Zaragoza", count: 3 },
  { x: 160, y: 200, city: "Málaga", count: 2 },
];

// Datos del gráfico de crecimiento (2015-2024)
const growthData = [
  { year: 2015, value: 5 },
  { year: 2016, value: 8 },
  { year: 2017, value: 14 },
  { year: 2018, value: 22 },
  { year: 2019, value: 31 },
  { year: 2020, value: 38 },
  { year: 2021, value: 48 },
  { year: 2022, value: 55 },
  { year: 2023, value: 62 },
  { year: 2024, value: 67 },
];

// Hook para contador animado
const useAnimatedCounter = (end: number, duration: number = 2000, startOnView: boolean = true) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(!startOnView);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasStarted) return;
    
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, hasStarted]);

  useEffect(() => {
    if (!startOnView) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [startOnView, hasStarted]);

  return { count, ref };
};

// Componente del mapa de España simplificado
const SpainMap: React.FC = () => (
  <svg viewBox="0 0 400 280" className="w-full h-auto">
    {/* Silueta simplificada de España */}
    <path
      d="M 50 80 
         Q 60 50 100 40 
         Q 140 30 180 35 
         Q 220 25 260 40 
         Q 300 35 340 50 
         Q 370 60 380 90 
         Q 385 120 370 150 
         Q 360 180 340 200 
         Q 300 230 260 240 
         Q 220 250 180 245 
         Q 140 250 100 235 
         Q 60 220 45 190 
         Q 30 160 35 130 
         Q 38 100 50 80 Z"
      className="fill-slate-100 dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-700"
      strokeWidth="1.5"
    />
    {/* Portugal (referencia visual) */}
    <path
      d="M 30 100 
         Q 20 120 25 150 
         Q 28 180 40 200 
         Q 45 190 35 130 
         Q 38 100 30 100 Z"
      className="fill-slate-50 dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-700"
      strokeWidth="1"
    />
  </svg>
);

// Componente de puntos pulsantes
const ActivityPulses: React.FC<{ points: typeof activityPoints }> = ({ points }) => (
  <svg viewBox="0 0 400 280" className="absolute inset-0 w-full h-auto">
    {points.map((point, i) => (
      <g key={i}>
        {/* Anillo exterior pulsante */}
        <motion.circle
          cx={point.x}
          cy={point.y}
          r={12}
          className="fill-primary/20"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [1, 1.8, 1], 
            opacity: [0.4, 0, 0.4] 
          }}
          transition={{ 
            delay: i * 0.15, 
            duration: 2.5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        {/* Punto central */}
        <motion.circle
          cx={point.x}
          cy={point.y}
          r={6}
          className="fill-primary"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            delay: i * 0.1 + 0.2, 
            duration: 0.4,
            ease: "backOut"
          }}
        />
        {/* Número de count pequeño */}
        <motion.text
          x={point.x + 10}
          y={point.y - 8}
          className="fill-foreground text-[10px] font-semibold"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 + 0.4, duration: 0.3 }}
        >
          {point.count}
        </motion.text>
      </g>
    ))}
  </svg>
);

// Componente del gráfico de crecimiento
const GrowthChart: React.FC = () => {
  const width = 200;
  const height = 50;
  const padding = 5;
  
  const maxValue = Math.max(...growthData.map(d => d.value));
  const minValue = 0;
  
  const points = growthData.map((d, i) => ({
    x: padding + (i / (growthData.length - 1)) * (width - padding * 2),
    y: height - padding - ((d.value - minValue) / (maxValue - minValue)) * (height - padding * 2)
  }));
  
  const pathD = points.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    return `${acc} L ${point.x} ${point.y}`;
  }, '');

  // Path para el área bajo la línea
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">Crecimiento 2015-2024</span>
        <span className="text-xs font-semibold text-primary">+1.240%</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Área de gradiente */}
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        {/* Área bajo la curva */}
        <motion.path
          d={areaD}
          fill="url(#chartGradient)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          viewport={{ once: true }}
        />
        
        {/* Línea principal */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          viewport={{ once: true }}
        />
        
        {/* Punto final destacado */}
        <motion.circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={4}
          className="fill-primary"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ delay: 1.5, duration: 0.3, type: "spring" }}
          viewport={{ once: true }}
        />
      </svg>
      
      {/* Etiquetas de años */}
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-muted-foreground">2015</span>
        <span className="text-[10px] text-muted-foreground">2024</span>
      </div>
    </div>
  );
};

// Componente de estadística individual
const StatItem: React.FC<{ 
  value: number; 
  prefix?: string; 
  suffix?: string; 
  label: string;
  delay?: number;
}> = ({ value, prefix = '', suffix = '', label, delay = 0 }) => {
  const { count, ref } = useAnimatedCounter(value, 2000);
  
  return (
    <motion.div 
      ref={ref}
      className="text-center"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      viewport={{ once: true }}
    >
      <div className="text-2xl font-bold text-primary">
        {prefix}{count}{suffix}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </motion.div>
  );
};

// Componente principal
export const SearchFundsDataVisual: React.FC = () => {
  return (
    <motion.div 
      className="relative bg-card border border-border rounded-2xl p-6 shadow-lg overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Decoración de fondo */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
      
      {/* Header */}
      <motion.div 
        className="text-center mb-4 relative z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-2">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-xs font-medium text-primary">En vivo</span>
        </div>
        <h3 className="font-bold text-lg text-foreground">España: Líder europeo</h3>
        <p className="text-xs text-muted-foreground">Ecosistema Search Funds más activo de Europa</p>
      </motion.div>
      
      {/* Mapa con puntos de actividad */}
      <div className="relative mb-4">
        <SpainMap />
        <ActivityPulses points={activityPoints} />
      </div>
      
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-border relative z-10">
        <StatItem value={67} suffix="+" label="Search Funds" delay={0.4} />
        <StatItem value={32} suffix="%" label="ROI histórico" delay={0.5} />
        <StatItem value={1} prefix="#" label="en Europa" delay={0.6} />
      </div>
      
      {/* Mini chart de crecimiento */}
      <div className="mt-4 relative z-10">
        <GrowthChart />
      </div>
    </motion.div>
  );
};
