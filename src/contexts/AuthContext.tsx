'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

  useEffect(() => {
    // Check if user is already authenticated on mount
    const savedAccessLevel = localStorage.getItem('univer_dashboard_access_level');
    if (savedAccessLevel && Object.values(PASSWORD_MAP).includes(savedAccessLevel as any)) {
      setAccessLevel(savedAccessLevel as AccessLevel);
      setIsAuthenticated(true);
    }
  }, []);

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

  const logout = () => {
    setAccessLevel(null);
    setIsAuthenticated(false);
    localStorage.removeItem('univer_dashboard_access_level');
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
