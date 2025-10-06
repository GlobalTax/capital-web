import { useState, useEffect } from 'react';

interface UseFirstVisitReturn {
  isFirstVisit: boolean;
  markAsVisited: () => void;
  isDisabled: boolean;
}

export const useFirstVisit = (key: string): UseFirstVisitReturn => {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    const shownKey = `${key}-shown`;
    const disabledKey = `${key}-disabled`;
    
    const hasBeenShown = localStorage.getItem(shownKey);
    const isDisabledByUser = localStorage.getItem(disabledKey);
    
    setIsDisabled(isDisabledByUser === 'true');
    setIsFirstVisit(!hasBeenShown && isDisabledByUser !== 'true');
  }, [key]);

  const markAsVisited = () => {
    localStorage.setItem(`${key}-shown`, 'true');
    setIsFirstVisit(false);
  };

  return { isFirstVisit, markAsVisited, isDisabled };
};
