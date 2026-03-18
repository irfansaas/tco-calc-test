'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  SavedScenario,
  getSavedScenarios,
  saveScenario as saveToLocal,
  deleteScenario as deleteFromLocal,
  SaveResult,
} from '@/lib/scenarioStorage';
import {
  fetchScenarios,
  saveScenarioToCloud,
  deleteScenarioFromCloud,
  syncLocalToCloud,
  isCloudAvailable,
} from '@/lib/firebase/scenarioService';

interface UseScenarioOptions {
  enableCloudSync?: boolean;
  autoSyncOnMount?: boolean;
}

interface UseScenariosReturn {
  scenarios: SavedScenario[];
  isLoading: boolean;
  isSyncing: boolean;
  cloudEnabled: boolean;
  error: string | null;
  saveScenario: (scenario: Omit<SavedScenario, 'id' | 'createdAt'>) => Promise<SaveResult>;
  deleteScenario: (id: string) => Promise<void>;
  refreshScenarios: () => void;
  syncToCloud: () => Promise<void>;
}

export function useScenarios(options: UseScenarioOptions = {}): UseScenariosReturn {
  const { enableCloudSync = true, autoSyncOnMount = true } = options;

  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasSyncedRef = useRef(false);

  const cloudEnabled = enableCloudSync && isCloudAvailable();

  // Load scenarios from local storage
  const loadLocalScenarios = useCallback(() => {
    const localScenarios = getSavedScenarios();
    setScenarios(localScenarios);
    return localScenarios;
  }, []);

  // Fetch from cloud and merge with local
  const syncFromCloud = useCallback(async () => {
    if (!cloudEnabled) return;

    setIsSyncing(true);
    setError(null);

    try {
      const result = await fetchScenarios();
      if (result.success && result.scenarios) {
        // Merge cloud and local scenarios, preferring cloud version for duplicates
        const localScenarios = getSavedScenarios();
        const cloudIds = new Set(result.scenarios.map(s => s.id));

        // Get local-only scenarios (not in cloud yet)
        const localOnly = localScenarios.filter(s => !cloudIds.has(s.id));

        // Combine: cloud scenarios + local-only scenarios
        const mergedScenarios = [...result.scenarios, ...localOnly].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setScenarios(mergedScenarios);

        // If there are local-only scenarios, sync them to cloud
        if (localOnly.length > 0) {
          await syncLocalToCloud(localOnly);
        }
      } else if (result.error) {
        setError(result.error);
        // Fall back to local scenarios on error
        loadLocalScenarios();
      }
    } catch (err) {
      console.error('Sync error:', err);
      setError('Failed to sync with cloud');
      loadLocalScenarios();
    } finally {
      setIsSyncing(false);
    }
  }, [cloudEnabled, loadLocalScenarios]);

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    loadLocalScenarios();
    setIsLoading(false);

    // Auto-sync on mount if enabled and not already synced
    if (autoSyncOnMount && cloudEnabled && !hasSyncedRef.current) {
      hasSyncedRef.current = true;
      syncFromCloud();
    }
  }, [loadLocalScenarios, autoSyncOnMount, cloudEnabled, syncFromCloud]);

  // Save scenario (local first, then cloud)
  const saveScenario = useCallback(
    async (scenarioData: Omit<SavedScenario, 'id' | 'createdAt'>): Promise<SaveResult> => {
      // Save to local storage first
      const result = saveToLocal(scenarioData);

      if (!result.success) {
        return result;
      }

      // Update state immediately
      setScenarios(getSavedScenarios());

      // Sync to cloud in background
      if (cloudEnabled && result.scenario) {
        saveScenarioToCloud(result.scenario).catch(err => {
          console.error('Cloud save failed:', err);
          // Don't fail the operation, local save succeeded
        });
      }

      return result;
    },
    [cloudEnabled]
  );

  // Delete scenario (local first, then cloud)
  const deleteScenario = useCallback(
    async (id: string): Promise<void> => {
      // Delete from local storage first
      deleteFromLocal(id);

      // Update state immediately
      setScenarios(getSavedScenarios());

      // Delete from cloud in background
      if (cloudEnabled) {
        deleteScenarioFromCloud(id).catch(err => {
          console.error('Cloud delete failed:', err);
          // Don't fail the operation, local delete succeeded
        });
      }
    },
    [cloudEnabled]
  );

  // Manual refresh
  const refreshScenarios = useCallback(() => {
    loadLocalScenarios();
    if (cloudEnabled) {
      syncFromCloud();
    }
  }, [loadLocalScenarios, cloudEnabled, syncFromCloud]);

  // Manual sync to cloud
  const syncToCloud = useCallback(async () => {
    if (!cloudEnabled) {
      setError('Cloud sync is not enabled');
      return;
    }

    setIsSyncing(true);
    setError(null);

    try {
      const localScenarios = getSavedScenarios();
      const result = await syncLocalToCloud(localScenarios);

      if (!result.success) {
        setError(result.error || 'Sync failed');
      }
    } catch (err) {
      console.error('Sync error:', err);
      setError('Failed to sync with cloud');
    } finally {
      setIsSyncing(false);
    }
  }, [cloudEnabled]);

  return {
    scenarios,
    isLoading,
    isSyncing,
    cloudEnabled,
    error,
    saveScenario,
    deleteScenario,
    refreshScenarios,
    syncToCloud,
  };
}
