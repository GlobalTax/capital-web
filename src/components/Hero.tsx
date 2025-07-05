"use client";

import NumberFlow from "@number-flow/react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, RefreshCcw } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import ErrorBoundary from '@/components/ErrorBoundary';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const Hero = () => {
  const { isOnline } = useNetworkStatus();
  const [showMonthlyStats, setShowMonthlyStats] = useState(false);
  const [stats, setStats] = useState({
    monthly: {
      TotalRevenue: 0,
      TotalOperations: 0,
      ClientSatisfaction: 0,
      YearsExperience: 0,
      MarketShare: 0,
    },
    yearly: {
      TotalRevenue: 0,
      TotalOperations: 0,
      ClientSatisfaction: 0,
      YearsExperience: 0,
      MarketShare: 0,
    },
  });

  const ref = useRef(null);
  const isInView = useInView(ref);

  const finalStats = useMemo(
    () => ({
      monthly: {
        TotalRevenue: 45,
        TotalOperations: 2,
        ClientSatisfaction: 98,
        YearsExperience: 16,
        MarketShare: 25,
      },
      yearly: {
        TotalRevenue: 380,
        TotalOperations: 25,
        ClientSatisfaction: 96,
        YearsExperience: 16,
        MarketShare: 45,
      },
    }),
    [],
  );

  useEffect(() => {
    if (isInView) {
      setStats(finalStats);
    }
  }, [isInView, finalStats]);

  return (
    <ErrorBoundary fallback={<div className="min-h-[65vh] flex items-center justify-center bg-background"><p>Error cargando la sección principal</p></div>}>
      <section className="py-32 bg-background">
        <div className="container flex justify-center">
          <div className="flex w-full flex-col justify-between gap-4 lg:flex-row">
            <div className="w-full lg:w-1/3">
              <div className="inline-flex items-center px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium mb-8">
                Líderes en M&A desde 2008
              </div>
              
              <h1 className="w-full font-bold text-5xl font-medium tracking-tighter md:text-6xl text-foreground">
                No solo hablamos, entregamos resultados
              </h1>
              
              <p className="my-4 text-lg tracking-tight text-muted-foreground">
                Maximizamos el valor de tu empresa con estrategias probadas y un enfoque personalizado 
                que garantiza los mejores resultados en cada transacción M&A.
              </p>
              
              <Button
                variant="secondary"
                className="group text-md mt-10 flex w-fit items-center justify-center gap-2 rounded-full px-6 py-3 tracking-tight shadow-none"
              >
                <span>Solicita Consultoría Gratuita</span>
                <ArrowRight className="size-4 -rotate-45 transition-all ease-out group-hover:ml-3 group-hover:rotate-0" />
              </Button>
              
              <div className="mt-10 lg:w-[115%]">
                <Graph />
              </div>
            </div>
            
            <div ref={ref} className="flex w-full flex-col items-end lg:w-1/2">
              <h1 className="font-bold text-6xl leading-tight lg:text-8xl text-foreground">
                <NumberFlow
                  value={
                    showMonthlyStats
                      ? stats.monthly.TotalRevenue
                      : stats.yearly.TotalRevenue
                  }
                  suffix="M€"
                  className="font-bold"
                />
              </h1>
              
              <div className="mb-6 flex flex-col items-center justify-center gap-6 lg:flex-row lg:gap-17">
                <p className="text-muted-foreground">Valor gestionado este año</p>
                <Button
                  variant="secondary"
                  className="group text-md flex w-fit items-center justify-center gap-2 rounded-full px-6 py-3 tracking-tight shadow-none transition-all duration-300 ease-out active:scale-95"
                  onClick={() => setShowMonthlyStats(!showMonthlyStats)}
                >
                  <span>Ver Stats {showMonthlyStats ? 'Anuales' : 'Mensuales'}</span>
                  <RefreshCcw className="size-4 transition-all ease-out group-hover:rotate-180" />
                </Button>
              </div>
              
              <div className="mt-auto mb-10 grid w-full grid-cols-2 gap-14">
                <div className="text-left">
                  <h2 className="text-4xl font-medium lg:text-6xl text-foreground">
                    <NumberFlow
                      value={
                        showMonthlyStats
                          ? stats.monthly.TotalOperations
                          : stats.yearly.TotalOperations
                      }
                      suffix="+"
                    />
                  </h2>
                  <p className="text-muted-foreground"> Operaciones Completadas </p>
                </div>
                
                <div className="text-right">
                  <h2 className="text-4xl font-medium lg:text-6xl text-foreground">
                    <NumberFlow
                      value={
                        showMonthlyStats
                          ? stats.monthly.ClientSatisfaction
                          : stats.yearly.ClientSatisfaction
                      }
                      suffix="%"
                    />
                  </h2>
                  <p className="text-muted-foreground"> Satisfacción Cliente </p>
                </div>
                
                <div className="text-left">
                  <h2 className="text-4xl font-medium lg:text-6xl text-foreground">
                    <NumberFlow
                      value={
                        showMonthlyStats
                          ? stats.monthly.YearsExperience
                          : stats.yearly.YearsExperience
                      }
                    />
                  </h2>
                  <p className="text-muted-foreground"> Años de Experiencia </p>
                </div>
                
                <div className="text-right">
                  <h2 className="text-4xl font-medium lg:text-6xl text-foreground">
                    <NumberFlow
                      value={
                        showMonthlyStats
                          ? stats.monthly.MarketShare
                          : stats.yearly.MarketShare
                      }
                      suffix="%"
                    />
                  </h2>
                  <p className="text-muted-foreground"> Cuota de Mercado </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
};

function Graph() {
  return (
    <div className="wrapper">
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 644 388"
        initial={{
          clipPath: "inset(0px 100% 0px 0px)",
        }}
        animate={{
          clipPath: "inset(0px 0% 0px 0px)",
        }}
        transition={{
          duration: 1,
          type: "spring",
          damping: 18,
        }}
      >
        <g clipPath="url(#grad)">
          <path
            d="M1 118.5C1 118.5 83.308 102.999 114.735 89.4998C146.162 76.0008 189.504 87.7868 235.952 77.4998C273.548 69.1718 294.469 62.4938 329.733 46.9998C409.879 11.7848 452.946 30.9998 483.874 22.4998C514.802 13.9998 635.97 0.84884 644 1.49984"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
          <path
            d="M113.912 89.4888C82.437 102.988 1 118.487 1 118.487V438.477H644V1.49977C635.957 0.849773 514.601 13.9988 483.625 22.4978C452.649 30.9958 409.515 11.7838 329.245 46.9938C293.926 62.4868 272.973 69.1638 235.318 77.4908C188.798 87.7768 145.388 75.9908 113.912 89.4888Z"
            fill="url(#grad)"
          />
        </g>
        <defs>
          <linearGradient
            id="grad"
            x1="321.5"
            y1="0.476773"
            x2="321.5"
            y2="387.477"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="hsl(var(--primary))" stopOpacity="0.4" />
            <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
      </motion.svg>
    </div>
  );
}

export default Hero;