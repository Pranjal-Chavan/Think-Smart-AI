
'use client';

import { ReactNode, useState, useEffect } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from '.';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

type Props = {
  children: ReactNode;
};

type FirebaseInstances = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

export function FirebaseClientProvider({ children }: Props) {
  const [instances, setInstances] = useState<FirebaseInstances | null>(null);

  useEffect(() => {
    // Initialize Firebase on the client side
    const firebaseInstances = initializeFirebase();
    setInstances(firebaseInstances);
  }, []);


  if (!instances) {
    // You can return a loader here if you want
    return null;
  }

  return (
    <FirebaseProvider app={instances.app} auth={instances.auth} firestore={instances.firestore}>
      {children}
    </FirebaseProvider>
  );
}
