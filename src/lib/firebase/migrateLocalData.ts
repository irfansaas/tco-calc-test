'use client';

import { getSavedScenarios } from '../scenarioStorage';
import { syncLocalToCloud, isCloudAvailable } from './scenarioService';

const MIGRATION_KEY = 'tco_firebase_migration_done';

/**
 * Migrates existing localStorage scenarios to Firestore on first connection.
 * Runs once per browser — marks completion in localStorage.
 * Keeps localStorage data as fallback.
 */
export async function migrateLocalStorageToFirestore(): Promise<{
  migrated: boolean;
  count: number;
  error?: string;
}> {
  // Skip if already migrated or cloud not available
  if (typeof window === 'undefined') {
    return { migrated: false, count: 0 };
  }

  if (localStorage.getItem(MIGRATION_KEY) === 'true') {
    return { migrated: false, count: 0 };
  }

  if (!isCloudAvailable()) {
    return { migrated: false, count: 0 };
  }

  const scenarios = getSavedScenarios();
  if (scenarios.length === 0) {
    localStorage.setItem(MIGRATION_KEY, 'true');
    return { migrated: true, count: 0 };
  }

  try {
    const result = await syncLocalToCloud(scenarios);
    if (result.success) {
      localStorage.setItem(MIGRATION_KEY, 'true');
      return { migrated: true, count: scenarios.length };
    }
    return { migrated: false, count: 0, error: result.error };
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      migrated: false,
      count: 0,
      error: 'Failed to migrate local data to cloud',
    };
  }
}
