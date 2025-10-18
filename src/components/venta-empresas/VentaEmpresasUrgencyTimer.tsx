import React, { useState, useEffect } from 'react';
import { Clock, Zap } from 'lucide-react';

const VentaEmpresasUrgencyTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Get or set countdown end time in localStorage
    const storageKey = 'valoracion-countdown-end';
    let countdownEnd = localStorage.getItem(storageKey);
    
    if (!countdownEnd) {
      // Set countdown to 24 hours from now
      const endTime = new Date().getTime() + (24 * 60 * 60 * 1000);
      localStorage.setItem(storageKey, endTime.toString());
      countdownEnd = endTime.toString();
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = parseInt(countdownEnd!);
      const distance = end - now;

      if (distance < 0) {
        // Reset countdown for next 24 hours
        const newEnd = new Date().getTime() + (24 * 60 * 60 * 1000);
        localStorage.setItem(storageKey, newEnd.toString());
        countdownEnd = newEnd.toString();
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto flex items-center justify-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 animate-pulse" />
          <span className="font-bold">OFERTA LIMITADA:</span>
        </div>
        
        <span className="hidden sm:inline">
          Valoración GRATUITA termina en:
        </span>
        
        <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm">
          <Clock className="h-5 w-5" />
          <div className="flex gap-2 font-mono font-bold text-lg">
            <div className="flex flex-col items-center">
              <span>{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-xs font-normal">horas</span>
            </div>
            <span>:</span>
            <div className="flex flex-col items-center">
              <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-xs font-normal">min</span>
            </div>
            <span>:</span>
            <div className="flex flex-col items-center">
              <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="text-xs font-normal">seg</span>
            </div>
          </div>
        </div>
        
        <span className="text-sm hidden lg:inline">
          ¡No pierdas esta oportunidad!
        </span>
      </div>
    </div>
  );
};

export default VentaEmpresasUrgencyTimer;
