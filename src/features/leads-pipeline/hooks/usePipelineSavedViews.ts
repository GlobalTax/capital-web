import { useState, useCallback, useEffect } from 'react';
import { storage } from '@/utils/storageWithFallback';

const STORAGE_KEY = 'pipeline-saved-views';

export interface PipelineViewFilters {
  searchQuery: string;
  filterAssignee: string[] | string; // string[] preferred; string for backward compat
  filterChannels: string[];
  filterFormDisplays: string[];
  filterDateFrom: string | null; // ISO string for serialization
  filterDateTo: string | null;
  filterRevMin: number;
  filterRevMax: number;
  filterEbitdaMin: number;
  filterEbitdaMax: number;
  hiddenColumns?: string[]; // status_keys to hide
}

export interface PipelineSavedView {
  id: string;
  name: string;
  filters: PipelineViewFilters;
  createdAt: string;
}

export function usePipelineSavedViews() {
  const [savedViews, setSavedViews] = useState<PipelineSavedView[]>([]);

  // Load from storage on mount
  useEffect(() => {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (raw) setSavedViews(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const persist = useCallback((views: PipelineSavedView[]) => {
    setSavedViews(views);
    storage.setItem(STORAGE_KEY, JSON.stringify(views));
  }, []);

  const saveView = useCallback((name: string, filters: PipelineViewFilters) => {
    const newView: PipelineSavedView = {
      id: crypto.randomUUID(),
      name,
      filters,
      createdAt: new Date().toISOString(),
    };
    persist([...savedViews, newView]);
  }, [savedViews, persist]);

  const deleteView = useCallback((id: string) => {
    persist(savedViews.filter(v => v.id !== id));
  }, [savedViews, persist]);

  const renameView = useCallback((id: string, name: string) => {
    persist(savedViews.map(v => v.id === id ? { ...v, name } : v));
  }, [savedViews, persist]);

  return { savedViews, saveView, deleteView, renameView };
}
