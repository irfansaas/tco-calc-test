'use client';

import { getFirestoreClient, isFirebaseConfigured } from './client';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import type { SavedScenario } from '../scenarioStorage';
import type { CalculatorOutput } from '../calculations';

// Firestore document type for tco_scenarios collection
interface TcoScenarioDoc {
  id: string;
  clientName: string;
  createdAt: string;
  userCount: number;
  concurrencyRate: number;
  mauRate: number;
  nerdioLicense: number;
  includeWindowsServer: boolean;
  includeNerdio: boolean;
  pricing: {
    citrixPerConcurrent: number;
    rdsCalPerUser: number;
    windowsSvrPerCore: number;
    avdComputePerUser: number;
    nerdioLicense: number;
  };
  result: CalculatorOutput;
}

const COLLECTION_NAME = 'tco_scenarios';

// Convert local SavedScenario to Firestore document format
function toFirestoreFormat(scenario: SavedScenario): TcoScenarioDoc {
  return {
    id: scenario.id,
    clientName: scenario.clientName,
    createdAt: scenario.createdAt,
    userCount: scenario.inputs.userCount,
    concurrencyRate: scenario.inputs.concurrencyRate,
    mauRate: scenario.inputs.mauRate,
    nerdioLicense: scenario.inputs.nerdioLicense,
    includeWindowsServer: scenario.inputs.includeWindowsServer,
    includeNerdio: scenario.inputs.includeNerdio,
    pricing: scenario.inputs.pricing,
    result: scenario.result,
  };
}

// Convert Firestore document to local SavedScenario format
function toLocalFormat(docData: TcoScenarioDoc): SavedScenario {
  return {
    id: docData.id,
    clientName: docData.clientName,
    createdAt: docData.createdAt,
    inputs: {
      userCount: docData.userCount,
      concurrencyRate: docData.concurrencyRate,
      mauRate: docData.mauRate,
      nerdioLicense: docData.nerdioLicense,
      includeWindowsServer: docData.includeWindowsServer,
      includeNerdio: docData.includeNerdio,
      pricing: docData.pricing,
    },
    result: docData.result as CalculatorOutput,
  };
}

export interface SyncResult {
  success: boolean;
  scenarios?: SavedScenario[];
  error?: string;
}

// Fetch all scenarios from Firestore
export async function fetchScenarios(): Promise<SyncResult> {
  const db = getFirestoreClient();
  if (!db) {
    return { success: false, error: 'Firebase not configured' };
  }

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const scenarios = snapshot.docs.map(doc =>
      toLocalFormat(doc.data() as TcoScenarioDoc)
    );
    return { success: true, scenarios };
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return { success: false, error: 'Failed to fetch scenarios' };
  }
}

// Save a scenario to Firestore
export async function saveScenarioToCloud(scenario: SavedScenario): Promise<SyncResult> {
  const db = getFirestoreClient();
  if (!db) {
    return { success: false, error: 'Firebase not configured' };
  }

  try {
    const firestoreData = toFirestoreFormat(scenario);
    await setDoc(doc(db, COLLECTION_NAME, scenario.id), firestoreData);
    return { success: true, scenarios: [scenario] };
  } catch (error) {
    console.error('Error saving scenario:', error);
    return { success: false, error: 'Failed to save scenario' };
  }
}

// Delete a scenario from Firestore
export async function deleteScenarioFromCloud(id: string): Promise<SyncResult> {
  const db = getFirestoreClient();
  if (!db) {
    return { success: false, error: 'Firebase not configured' };
  }

  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting scenario:', error);
    return { success: false, error: 'Failed to delete scenario' };
  }
}

// Sync local scenarios to cloud (bulk upload)
export async function syncLocalToCloud(scenarios: SavedScenario[]): Promise<SyncResult> {
  const db = getFirestoreClient();
  if (!db) {
    return { success: false, error: 'Firebase not configured' };
  }

  if (scenarios.length === 0) {
    return { success: true };
  }

  try {
    const batch = writeBatch(db);
    for (const scenario of scenarios) {
      const docRef = doc(db, COLLECTION_NAME, scenario.id);
      batch.set(docRef, toFirestoreFormat(scenario));
    }
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error syncing scenarios:', error);
    return { success: false, error: 'Failed to sync scenarios' };
  }
}

// Search scenarios by client name
export async function searchScenariosByClient(clientName: string): Promise<SyncResult> {
  const db = getFirestoreClient();
  if (!db) {
    return { success: false, error: 'Firebase not configured' };
  }

  try {
    // Firestore doesn't support case-insensitive substring search natively,
    // so we fetch all and filter client-side (same as the app's existing pattern)
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const allScenarios = snapshot.docs.map(doc =>
      toLocalFormat(doc.data() as TcoScenarioDoc)
    );
    const filtered = allScenarios.filter(s =>
      s.clientName.toLowerCase().includes(clientName.toLowerCase())
    );
    return { success: true, scenarios: filtered };
  } catch (error) {
    console.error('Error searching scenarios:', error);
    return { success: false, error: 'Failed to search scenarios' };
  }
}

// Check if Firebase cloud is available
export function isCloudAvailable(): boolean {
  return isFirebaseConfigured;
}
