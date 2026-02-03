'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // In development, this will also be caught by Next.js error overlay
      // if it's thrown. We emit it for central handling.
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: `You don't have permission to ${error.context.operation} at ${error.context.path}`,
      });
      
      // Re-throw to trigger Next.js error overlay in dev
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
