'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';

export type AccessLevel = 'total' | 'unigen' | 'nunhems' | 'waller_heinz' | null;

interface AuthContextType {
  accessLevel: AccessLevel;
  setAccessLevel: (level: AccessLevel) => void;
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PASSWORD_MAP = {
  'univer_2025_total': 'total',
  'unigen_2025': 'unigen',
  'nunhems_2025': 'nunhems',
  'waller_heinz_2025': 'waller_heinz'
} as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // 10 perc = 600000 ms
  const INACTIVITY_TIMEOUT = 10 * 60 * 1000;

  const logout = useCallback(() => {
    setAccessLevel(null);
    setIsAuthenticated(false);
    localStorage.removeItem('univer_dashboard_access_level');

    // Timeout törlése kijelentkezéskor
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const resetTimeout = useCallback(() => {
    lastActivityRef.current = Date.now();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isAuthenticated) {
      timeoutRef.current = setTimeout(() => {
        logout();
      }, INACTIVITY_TIMEOUT);
    }
  }, [isAuthenticated, INACTIVITY_TIMEOUT, logout]);

  const handleUserActivity = useCallback(() => {
    if (isAuthenticated) {
      resetTimeout();
    }
  }, [isAuthenticated, resetTimeout]);

  useEffect(() => {
    // Check if user is already authenticated on mount
    const savedAccessLevel = localStorage.getItem('univer_dashboard_access_level');
    if (savedAccessLevel && Object.values(PASSWORD_MAP).includes(savedAccessLevel as any)) {
      setAccessLevel(savedAccessLevel as AccessLevel);
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // Aktivitás események listenerek hozzáadása
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

      events.forEach(event => {
        document.addEventListener(event, handleUserActivity, true);
      });

      // Timeout beállítása
      resetTimeout();

      return () => {
        // Cleanup
        events.forEach(event => {
          document.removeEventListener(event, handleUserActivity, true);
        });

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [isAuthenticated, handleUserActivity, resetTimeout]);

  const login = (password: string): boolean => {
    const level = PASSWORD_MAP[password as keyof typeof PASSWORD_MAP];
    if (level) {
      setAccessLevel(level);
      setIsAuthenticated(true);
      localStorage.setItem('univer_dashboard_access_level', level);
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{
      accessLevel,
      setAccessLevel,
      isAuthenticated,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
