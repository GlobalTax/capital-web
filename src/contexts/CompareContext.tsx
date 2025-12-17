import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  valuation_amount: number;
  valuation_currency?: string;
  revenue_amount?: number;
  ebitda_amount?: number;
  year: number;
  description: string;
  short_description?: string;
  is_featured: boolean;
  is_active: boolean;
  logo_url?: string;
  company_size?: string;
  company_size_employees?: string;
  highlights?: string[];
  deal_type?: string;
  geographic_location?: string;
  created_at?: string;
}

interface CompareContextType {
  compareList: Operation[];
  addToCompare: (operation: Operation) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
  canAddMore: boolean;
  isCompareModalOpen: boolean;
  openCompareModal: () => void;
  closeCompareModal: () => void;
}

const MAX_COMPARE_ITEMS = 4;

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareList, setCompareList] = useState<Operation[]>(() => {
    // Recuperar de sessionStorage al iniciar
    try {
      const saved = sessionStorage.getItem('compareOperations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Persistir en sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('compareOperations', JSON.stringify(compareList));
    } catch {
      // Ignorar errores de storage
    }
  }, [compareList]);

  const addToCompare = useCallback((operation: Operation) => {
    setCompareList(prev => {
      if (prev.length >= MAX_COMPARE_ITEMS) return prev;
      if (prev.some(op => op.id === operation.id)) return prev;
      return [...prev, operation];
    });
  }, []);

  const removeFromCompare = useCallback((id: string) => {
    setCompareList(prev => prev.filter(op => op.id !== id));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
    setIsCompareModalOpen(false);
  }, []);

  const isInCompare = useCallback((id: string) => {
    return compareList.some(op => op.id === id);
  }, [compareList]);

  const canAddMore = compareList.length < MAX_COMPARE_ITEMS;

  const openCompareModal = useCallback(() => setIsCompareModalOpen(true), []);
  const closeCompareModal = useCallback(() => setIsCompareModalOpen(false), []);

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        canAddMore,
        isCompareModalOpen,
        openCompareModal,
        closeCompareModal,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
