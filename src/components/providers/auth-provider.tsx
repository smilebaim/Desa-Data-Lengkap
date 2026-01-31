'use client';

import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/lib/types';
import { users } from '@/lib/data';

export interface AuthContextType {
  user: User | null;
  login: (username: string, pass: string) => Promise<User | null>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FAKE_AUTH_DELAY = 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const loadUserFromStorage = useCallback(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Could not load user from local storage', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  useEffect(() => {
    if (!isLoading && !user && pathname !== '/login') {
        router.push('/login');
    }
  }, [isLoading, user, pathname, router]);


  const login = async (username: string, pass: string): Promise<User | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const foundUser = users.find((u) => u.username === username);
        // In a real app, you'd check the password hash
        if (foundUser) {
          setUser(foundUser);
          localStorage.setItem('user', JSON.stringify(foundUser));
          resolve(foundUser);
        } else {
          resolve(null);
        }
      }, FAKE_AUTH_DELAY);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/login');
  };

  const value = { user, login, logout, isLoading };

  if(isLoading) {
    return <div className="flex h-screen items-center justify-center bg-background"><div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div></div>
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
