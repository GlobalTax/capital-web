// ============= LOCAL STORAGE BACKUP HOOK =============
// Provides fallback persistence when Supabase is unavailable

import { useState, useCallback, useEffect, useRef } from 'react';
import { ExtendedCompanyData } from '../types/unified.types';

const STORAGE_KEY = 'valuation_backup';
const SYNC_QUEUE_KEY = 'valuation_sync_queue';
const MAX_BACKUPS = 10;

interface BackupEntry {
  id: string;
  timestamp: string;
  companyData: Partial<ExtendedCompanyData>;
  currentStep: number;
  source: string;
  synced: boolean;
  syncAttempts: number;
  lastError?: string;
}

interface SyncQueueItem {
  id: string;
  action: 'create' | 'update';
  data: any;
  timestamp: string;
  attempts: number;
}

export const useLocalStorageBackup = (source: string = 'unknown') => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate unique backup ID
  const generateBackupId = useCallback(() => {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Get all backups from localStorage
  const getBackups = useCallback((): BackupEntry[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[BACKUP] Error reading backups:', error);
      return [];
    }
  }, []);

  // Save backup to localStorage
  const saveBackup = useCallback((
    companyData: Partial<ExtendedCompanyData>,
    currentStep: number,
    existingId?: string
  ): string => {
    try {
      const backups = getBackups();
      const backupId = existingId || generateBackupId();
      
      const existingIndex = backups.findIndex(b => b.id === backupId);
      
      const entry: BackupEntry = {
        id: backupId,
        timestamp: new Date().toISOString(),
        companyData,
        currentStep,
        source,
        synced: false,
        syncAttempts: 0
      };

      if (existingIndex >= 0) {
        // Update existing backup
        backups[existingIndex] = {
          ...backups[existingIndex],
          ...entry,
          syncAttempts: backups[existingIndex].syncAttempts
        };
      } else {
        // Add new backup
        backups.unshift(entry);
        
        // Trim old backups
        while (backups.length > MAX_BACKUPS) {
          backups.pop();
        }
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(backups));
      console.log('[BACKUP] Data saved locally:', backupId);
      
      return backupId;
    } catch (error) {
      console.error('[BACKUP] Error saving backup:', error);
      return '';
    }
  }, [getBackups, generateBackupId, source]);

  // Mark backup as synced
  const markAsSynced = useCallback((backupId: string) => {
    try {
      const backups = getBackups();
      const index = backups.findIndex(b => b.id === backupId);
      
      if (index >= 0) {
        backups[index].synced = true;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(backups));
        console.log('[BACKUP] Marked as synced:', backupId);
      }
    } catch (error) {
      console.error('[BACKUP] Error marking as synced:', error);
    }
  }, [getBackups]);

  // Mark backup with error
  const markWithError = useCallback((backupId: string, error: string) => {
    try {
      const backups = getBackups();
      const index = backups.findIndex(b => b.id === backupId);
      
      if (index >= 0) {
        backups[index].syncAttempts += 1;
        backups[index].lastError = error;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(backups));
      }
    } catch (err) {
      console.error('[BACKUP] Error updating backup status:', err);
    }
  }, [getBackups]);

  // Get unsynced backups
  const getUnsyncedBackups = useCallback((): BackupEntry[] => {
    return getBackups().filter(b => !b.synced && b.syncAttempts < 5);
  }, [getBackups]);

  // Get latest backup
  const getLatestBackup = useCallback((): BackupEntry | null => {
    const backups = getBackups();
    return backups.length > 0 ? backups[0] : null;
  }, [getBackups]);

  // Clear synced backups (cleanup)
  const clearSyncedBackups = useCallback(() => {
    try {
      const backups = getBackups();
      const unsyncedOnly = backups.filter(b => !b.synced);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unsyncedOnly));
      console.log('[BACKUP] Cleared synced backups');
    } catch (error) {
      console.error('[BACKUP] Error clearing backups:', error);
    }
  }, [getBackups]);

  // Add to sync queue for retry
  const addToSyncQueue = useCallback((action: 'create' | 'update', data: any) => {
    try {
      const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]') as SyncQueueItem[];
      queue.push({
        id: generateBackupId(),
        action,
        data,
        timestamp: new Date().toISOString(),
        attempts: 0
      });
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      setPendingCount(queue.length);
    } catch (error) {
      console.error('[BACKUP] Error adding to sync queue:', error);
    }
  }, [generateBackupId]);

  // Get sync queue
  const getSyncQueue = useCallback((): SyncQueueItem[] => {
    try {
      return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    } catch {
      return [];
    }
  }, []);

  // Remove from sync queue
  const removeFromSyncQueue = useCallback((id: string) => {
    try {
      const queue = getSyncQueue().filter(item => item.id !== id);
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      setPendingCount(queue.length);
    } catch (error) {
      console.error('[BACKUP] Error removing from queue:', error);
    }
  }, [getSyncQueue]);

  // Update pending count on mount
  useEffect(() => {
    const unsynced = getUnsyncedBackups();
    const queue = getSyncQueue();
    setPendingCount(unsynced.length + queue.length);
  }, [getUnsyncedBackups, getSyncQueue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  return {
    saveBackup,
    markAsSynced,
    markWithError,
    getBackups,
    getUnsyncedBackups,
    getLatestBackup,
    clearSyncedBackups,
    addToSyncQueue,
    getSyncQueue,
    removeFromSyncQueue,
    isSyncing,
    pendingCount
  };
};
