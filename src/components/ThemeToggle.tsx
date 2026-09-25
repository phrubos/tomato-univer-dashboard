'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Témaváltó. Semleges felületű ikongomb, hogy a kijelentkezéssel egy klasztert
 * alkosson – a zöld a felületen az aktív nézetet jelenti, nem a megjelenést.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const label = theme === 'dark' ? t.theme.toLight : t.theme.toDark;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-gray-200 text-gray-700 transition-colors duration-200 cursor-pointer hover:bg-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 ${className}`}
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
