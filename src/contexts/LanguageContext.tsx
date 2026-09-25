'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { DEFAULT_LANGUAGE, LANGUAGES, translations, type Dictionary, type Language } from '@/i18n/translations';

const STORAGE_KEY = 'univer-language';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Dictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * A felület nyelve. Alapértelmezés a magyar; a választás a böngészőben megmarad,
 * és a <html lang> attribútumot is követi (felolvasóprogramok, elválasztás).
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {}
    if (LANGUAGES.includes(saved as Language)) setLanguageState(saved as Language);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}
