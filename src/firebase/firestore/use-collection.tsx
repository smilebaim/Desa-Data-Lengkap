'use client';

import { useEffect, useState } from 'react';
import { 
  onSnapshot, 
  Query, 
  QuerySnapshot, 
  DocumentData 
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '../errors';

export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);

    if (!query) {
      setData([]);
      setIsLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const items = snapshot.docs.map((doc) => ({
          ...(doc.data() as any),
          id: doc.id,
        })) as T[];
        setData(items);
        setIsLoading(false);
      },
      async (serverError: any) => {
        // Safe path extraction
        const path = (query as any)._query?.path?.segments?.join('/') || 'unknown';
        const permissionError = new FirestorePermissionError({
          path: path,
          operation: 'list',
        } satisfies SecurityRuleContext);
        
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setIsLoading(false);
      }
    );

    return () => {
      try {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      } catch (e) {
        // Safe cleanup for potential assertion errors during unmount
      }
    };
  }, [query]);

  return { data, isLoading, error };
}
