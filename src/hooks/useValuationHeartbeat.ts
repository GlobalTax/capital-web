import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HeartbeatOptions {
  uniqueToken: string | null;
  currentStep: number;
  timeSpent: number;
  startTime: Date | null;
  isActive: boolean;
}

export const useValuationHeartbeat = ({ 
  uniqueToken, 
  currentStep, 
  timeSpent, 
  startTime,
  isActive 
}: HeartbeatOptions) => {
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<Date>(new Date());

  // Send heartbeat to server with timeout protection
  const sendHeartbeat = useCallback(async () => {
    if (!uniqueToken || !isActive) return;

    try {
      const timeSpentSeconds = startTime 
        ? Math.floor((Date.now() - startTime.getTime()) / 1000)
        : timeSpent;

      // Add timeout to prevent hanging requests
      const heartbeatPromise = supabase.functions.invoke('update-valuation', {
        body: {
          uniqueToken,
          data: {
            currentStep,
            timeSpentSeconds,
            lastModifiedField: 'heartbeat'
          }
        }
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Heartbeat timeout')), 8000)
      );

      await Promise.race([heartbeatPromise, timeoutPromise]);

      lastActivityRef.current = new Date();
      console.log('Heartbeat sent successfully');
    } catch (error) {
      // Don't spam console with heartbeat errors
      if (error instanceof Error && !error.message.includes('timeout')) {
        console.error('Error sending heartbeat:', error.message);
      }
    }
  }, [uniqueToken, currentStep, timeSpent, startTime, isActive]);

  // Track user activity (mouse, keyboard, scroll)
  const updateActivity = useCallback(() => {
    lastActivityRef.current = new Date();
  }, []);

  // Setup heartbeat interval
  useEffect(() => {
    if (!uniqueToken || !isActive) {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      return;
    }

    // Further optimized heartbeat - reduced frequency and smarter logic
    heartbeatRef.current = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivityRef.current.getTime();
      // Only send heartbeat if user was active in the last 5 minutes and not on final step
      if (timeSinceActivity < 5 * 60 * 1000 && currentStep < 4) {
        sendHeartbeat();
      }
    }, 10 * 60 * 1000); // Send every 10 minutes (further reduced)

    // Send initial heartbeat
    sendHeartbeat();

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };
  }, [uniqueToken, isActive, sendHeartbeat]);

  // Setup activity listeners
  useEffect(() => {
    if (!isActive) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [isActive, updateActivity]);

  return {
    sendHeartbeat,
    lastActivity: lastActivityRef.current
  };
};