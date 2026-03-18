// Firebase module exports
export { db, isFirebaseConfigured, getFirestoreClient } from './client';
export {
  fetchScenarios,
  saveScenarioToCloud,
  deleteScenarioFromCloud,
  syncLocalToCloud,
  searchScenariosByClient,
  isCloudAvailable,
} from './scenarioService';
export type { SyncResult } from './scenarioService';
export { migrateLocalStorageToFirestore } from './migrateLocalData';
