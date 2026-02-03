'use client';

import { useAuth as useFirebaseAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const auth = useFirebaseAuth();
  const { user, profile, isLoading } = useUser();
  const router = useRouter();

  const login = async (email: string, pass: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      return result.user;
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  // Combine Firebase user with Firestore profile data
  const userData = user ? {
    id: user.uid,
    name: profile?.name || user.displayName || 'User',
    username: user.email || '',
    role: profile?.role || 'village_staff',
    avatarUrl: profile?.avatarUrl || `https://picsum.photos/seed/${user.uid}/200/200`
  } : null;

  return { 
    user: userData, 
    login, 
    logout, 
    isLoading 
  };
};
