import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

interface WishlistContextType {
  wishlist: Operation[];
  addToWishlist: (operation: Operation) => void;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
  isInWishlist: (id: string) => boolean;
  wishlistCount: number;
  isWishlistModalOpen: boolean;
  openWishlistModal: () => void;
  closeWishlistModal: () => void;
  isBulkInquiryOpen: boolean;
  openBulkInquiry: () => void;
  closeBulkInquiry: () => void;
}

const STORAGE_KEY = 'wishlist-operations';

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Operation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [isBulkInquiryOpen, setIsBulkInquiryOpen] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // Ignore storage errors
    }
  }, [wishlist]);

  // Sync with Supabase when user logs in
  useEffect(() => {
    const syncWithSupabase = async () => {
      if (!user) return;

      try {
        // Get saved operations from Supabase
        const { data: savedOps, error } = await supabase
          .from('saved_operations')
          .select('operation_id')
          .eq('user_id', user.id);

        if (error) throw error;

        const savedIds = new Set(savedOps?.map(op => op.operation_id) || []);
        
        // Merge: add local wishlist items to Supabase if not already there
        for (const op of wishlist) {
          if (!savedIds.has(op.id)) {
            await supabase
              .from('saved_operations')
              .insert({ user_id: user.id, operation_id: op.id })
              .select();
          }
        }

        // Fetch full operation data for all saved operations
        if (savedOps && savedOps.length > 0) {
          const { data: operations } = await supabase
            .from('company_operations')
            .select('*')
            .in('id', savedOps.map(op => op.operation_id))
            .eq('is_active', true);

          if (operations) {
            // Merge local and remote, avoiding duplicates
            const merged = [...wishlist];
            for (const op of operations) {
              if (!merged.some(w => w.id === op.id)) {
                merged.push(op as Operation);
              }
            }
            setWishlist(merged);
          }
        }
      } catch (error) {
        console.error('Error syncing wishlist with Supabase:', error);
      }
    };

    syncWithSupabase();
  }, [user]);

  const addToWishlist = useCallback(async (operation: Operation) => {
    setWishlist(prev => {
      if (prev.some(op => op.id === operation.id)) return prev;
      return [...prev, operation];
    });

    // Also save to Supabase if logged in
    if (user) {
      try {
        await supabase
          .from('saved_operations')
          .upsert({ user_id: user.id, operation_id: operation.id }, { onConflict: 'user_id,operation_id' });
      } catch (error) {
        console.error('Error saving to Supabase:', error);
      }
    }

    toast.success('Operación añadida a la cesta');
  }, [user]);

  const removeFromWishlist = useCallback(async (id: string) => {
    setWishlist(prev => prev.filter(op => op.id !== id));

    // Also remove from Supabase if logged in
    if (user) {
      try {
        await supabase
          .from('saved_operations')
          .delete()
          .eq('user_id', user.id)
          .eq('operation_id', id);
      } catch (error) {
        console.error('Error removing from Supabase:', error);
      }
    }

    toast.success('Operación eliminada de la cesta');
  }, [user]);

  const clearWishlist = useCallback(async () => {
    const previousWishlist = wishlist;
    setWishlist([]);
    setIsWishlistModalOpen(false);

    // Also clear from Supabase if logged in
    if (user && previousWishlist.length > 0) {
      try {
        await supabase
          .from('saved_operations')
          .delete()
          .eq('user_id', user.id)
          .in('operation_id', previousWishlist.map(op => op.id));
      } catch (error) {
        console.error('Error clearing from Supabase:', error);
      }
    }
  }, [user, wishlist]);

  const isInWishlist = useCallback((id: string) => {
    return wishlist.some(op => op.id === id);
  }, [wishlist]);

  const openWishlistModal = useCallback(() => setIsWishlistModalOpen(true), []);
  const closeWishlistModal = useCallback(() => setIsWishlistModalOpen(false), []);
  const openBulkInquiry = useCallback(() => {
    setIsWishlistModalOpen(false);
    setIsBulkInquiryOpen(true);
  }, []);
  const closeBulkInquiry = useCallback(() => setIsBulkInquiryOpen(false), []);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        wishlistCount: wishlist.length,
        isWishlistModalOpen,
        openWishlistModal,
        closeWishlistModal,
        isBulkInquiryOpen,
        openBulkInquiry,
        closeBulkInquiry,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
