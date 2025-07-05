"use client";

import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import ErrorBoundary from '@/components/ErrorBoundary';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const Hero = () => {
  const { isOnline } = useNetworkStatus();
  const ref = useRef(null);
  const IllustrationRef = useRef(null);
  const [selectedYear, setSelectedYear] = useState(2021);

  const Stats = {
    2021: {
      TotalOperations: 5,
      TotalValue: 45,
      ClientSatisfaction: 88,
      MarketShare: 15,
      PathHeight: 0,
    },
    2022: {
      TotalOperations: 12,
      TotalValue: 120,
      ClientSatisfaction: 92,
      MarketShare: 25,
      PathHeight: 55,
    },
    2023: {
      TotalOperations: 18,
      TotalValue: 240,
      MarketShare: 35,
      ClientSatisfaction: 94,
      PathHeight: 105,
    },
    2024: {
      TotalOperations: 25,
      TotalValue: 380,
      ClientSatisfaction: 96,
      MarketShare: 45,
      PathHeight: 160,
    },
  };

  const years = Object.keys(Stats).map(Number);

  return (
    <ErrorBoundary fallback={<div className="min-h-[65vh] flex items-center justify-center bg-background"><p>Error cargando la sección principal</p></div>}>
      <section className="py-32 bg-background">
        <div className="container flex flex-col md:flex-row">
          <div className="z-10 md:flex-1">
            <div className="inline-flex items-center px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium mb-8">
              Líderes en M&A desde 2008
            </div>
            
            <h1 className="font-bold max-w-xl text-5xl font-medium tracking-tighter md:text-6xl text-foreground">
              Asesórate para vender tu empresa con el máximo valor
            </h1>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Maximizamos el valor de tu empresa con estrategias probadas en más de 20 operaciones exitosas. 
              Nuestro enfoque personalizado garantiza los mejores resultados en cada transacción.
            </p>
            <div className="my-10 flex gap-4">
              <Button
                variant="secondary"
                className="group text-md flex w-fit items-center justify-center gap-2 rounded-full px-6 py-3 tracking-tight"
              >
                <span>Ver Casos de Éxito</span>
                <ArrowRight className="size-4 -rotate-45 transition-all ease-out group-hover:ml-3 group-hover:rotate-0" />
              </Button>
              <Button
                variant="default"
                className="group text-md flex w-fit items-center justify-center gap-2 rounded-full px-6 py-3 tracking-tight bg-[#ff6b00] hover:bg-[#e55a00]"
              >
                <span>Solicita Consultoría Gratuita</span>
                <ArrowRight className="size-4 -rotate-45 transition-all ease-out group-hover:ml-3 group-hover:rotate-0" />
              </Button>
            </div>
            <div
              ref={ref}
              className="mt-12 flex max-w-3xl flex-col items-end bg-background md:mt-32 xl:bg-transparent"
            >
              <div className="mt-auto mb-10 grid w-full grid-cols-2 gap-4 md:grid-cols-4">
                <div className="w-full text-left">
                  <h2 className="text-4xl font-medium lg:text-5xl text-foreground">
                    <NumberFlow
                      value={Stats[selectedYear as keyof typeof Stats].TotalOperations}
                      suffix="+"
                    />
                  </h2>
                  <p className="text-sm whitespace-pre text-muted-foreground">
                    Operaciones Cerradas
                  </p>
                </div>
                <div className="w-full text-left">
                  <h2 className="text-4xl font-medium lg:text-5xl text-foreground">
                    <NumberFlow
                      value={Stats[selectedYear as keyof typeof Stats].TotalValue}
                      suffix="M€"
                    />
                  </h2>
                  <p className="text-sm whitespace-pre text-muted-foreground">
                    Valor Agregado
                  </p>
                </div>
                <div className="w-full text-left">
                  <h2 className="text-4xl font-medium lg:text-5xl text-foreground">
                    <NumberFlow
                      value={Stats[selectedYear as keyof typeof Stats].ClientSatisfaction}
                      suffix="%"
                    />
                  </h2>
                  <p className="text-sm whitespace-pre text-muted-foreground">
                    Satisfacción Cliente
                  </p>
                </div>
                <div ref={IllustrationRef} className="w-full text-left">
                  <h2 className="text-4xl font-medium lg:text-5xl text-foreground">
                    <NumberFlow
                      value={Stats[selectedYear as keyof typeof Stats].MarketShare}
                      suffix="%"
                    />
                  </h2>
                  <p className="text-sm whitespace-pre text-muted-foreground">
                    Cuota de Mercado
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative flex w-fit flex-row flex-wrap gap-2 md:mt-42 md:flex-col">
            {years.map((year) => (
              <div key={year} className="group">
                <button
                  onClick={() => setSelectedYear(year)}
                  className={`relative rounded-full px-4 py-1 text-sm transition-all ease-out ${
                    selectedYear === year
                      ? "bg-primary text-primary-foreground md:-translate-x-8"
                      : "bg-muted/70 group-hover:-translate-x-4 group-hover:bg-muted"
                  }`}
                >
                  {year}
                </button>
              </div>
            ))}
            <LinkIllustration
              className="absolute bottom-9 -left-14 hidden -translate-x-full -translate-y-full text-[#ff6b00] md:block"
              PathHeight={Stats[selectedYear as keyof typeof Stats].PathHeight}
            />
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
};

const LinkIllustration = ({ className = "", PathHeight = 0 }) => {
  return (
    <svg
      width="280"
      height="124"
      viewBox="0 0 412 178"
      overflow="visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1 }}
        key={PathHeight}
        d={`M408.308 ${PathHeight}H294L114.965 274H1`}
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <motion.path
        d={`M408.308 ${PathHeight}H294L114.965 274H1`}
        stroke="black"
        strokeWidth="1.5"
        opacity="0.1"
      />
      <circle cx="408.309" cy={PathHeight} r="5" fill="currentColor" />
      <circle cx="2" cy="274" r="5" fill="currentColor" />
    </svg>
  );
};
export default Hero;