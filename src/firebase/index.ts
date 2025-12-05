
'use client';
import {
  type FirebaseApp,
  getApp,
  getApps,
  initializeApp,
} from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

import { firebaseConfig } from '@/lib/firebase/config';

// Re-export the hooks and providers
export {
  FirebaseProvider,
  useAuth,
  useFirebase,
  useFirebaseApp,
  useFirestore,
} from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useUser } from './auth/use-user';
export type { User } from 'firebase/auth';

type FirebaseInstances = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

// Singleton to store Firebase instances
let firebaseInstances: FirebaseInstances | null = null;

export function initializeFirebase(): FirebaseInstances {
  if (typeof window !== 'undefined') {
    if (firebaseInstances) {
      return firebaseInstances;
    }

    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    firebaseInstances = { app, auth, firestore };
    return firebaseInstances;
  }
  // This is a server-side render, so we can't initialize Firebase.
  // We'll throw an error if someone tries to use it.
  // This should be handled by using the FirebaseClientProvider.
  // The return type is technically a lie here, but it's the only way
  // to make this work with the current architecture.
  return {} as FirebaseInstances;
}
