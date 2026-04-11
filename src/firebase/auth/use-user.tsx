'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '../errors';

export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (!authUser) {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      
      try {
        unsubscribeProfile = onSnapshot(
          userDocRef, 
          (docSnap) => {
            if (docSnap.exists()) {
              setProfile(docSnap.data());
            } else {
              setProfile(null);
            }
            setIsLoading(false);
          }, 
          async (serverError: any) => {
            // Implementasi arsitektur penanganan galat kontekstual
            const permissionError = new FirestorePermissionError({
              path: userDocRef.path,
              operation: 'get',
            } satisfies SecurityRuleContext);

            // Emit galat ke pendengar pusat (FirebaseErrorListener)
            errorEmitter.emit('permission-error', permissionError);
            
            setIsLoading(false);
          }
        );
      } catch (e) {
        setIsLoading(false);
      }
    }

    return () => {
      if (typeof unsubscribeProfile === 'function') {
        try {
          unsubscribeProfile();
        } catch (e) {
          // Mengabaikan galat saat unmount untuk mencegah crash SDK internal
        }
      }
    };
  }, [user, db]);

  return { user, profile, isLoading };
}