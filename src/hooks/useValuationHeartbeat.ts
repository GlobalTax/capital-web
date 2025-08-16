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

  // Send heartbeat to server
  const sendHeartbeat = useCallback(async () => {
    if (!uniqueToken || !isActive) return;

    try {
      const timeSpentSeconds = startTime 
        ? Math.floor((Date.now() - startTime.getTime()) / 1000)
        : timeSpent;

      await supabase.functions.invoke('update-valuation', {
        body: {
          uniqueToken,
          data: {
            currentStep,
            timeSpentSeconds,
            lastModifiedField: 'heartbeat'
          }
        }
      });

      lastActivityRef.current = new Date();
      console.log('Heartbeat sent successfully');
    } catch (error) {
      console.error('Error sending heartbeat:', error);
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

    // Send heartbeat every 60 seconds
    heartbeatRef.current = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivityRef.current.getTime();
      
      // Only send heartbeat if user was active in the last 5 minutes
      if (timeSinceActivity < 5 * 60 * 1000) {
        sendHeartbeat();
      }
    }, 60 * 1000); // 60 seconds

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