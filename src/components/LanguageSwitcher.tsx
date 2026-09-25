'use client';

import { useId, type JSX } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGES, translations, type Language } from '@/i18n/translations';

/** Magyar zászló (3:2). Inline SVG: a Windows nem rajzolja ki a zászló-emojikat. */
function HungarianFlag() {
  return (
    <svg viewBox="0 0 6 4" className="h-full w-full" aria-hidden>
      <rect width="6" height="4" fill="#436f4d" />
      <rect width="6" height="2.667" fill="#ffffff" />
      <rect width="6" height="1.333" fill="#cd2a3e" />
    </svg>
  );
}

/** Egyesült Királyság zászlaja (Union Jack), 3:2 kivágásban. */
function BritishFlag() {
  const id = useId();
  return (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <clipPath id={`${id}-s`}>
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id={`${id}-t`}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath={`url(#${id}-s)`}>
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#ffffff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id}-t)`} stroke="#c8102e" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#ffffff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6" />
      </g>
    </svg>
  );
}

const FLAGS: Record<Language, () => JSX.Element> = { hu: HungarianFlag, en: BritishFlag };
const CODES: Record<Language, string> = { hu: 'HU', en: 'EN' };

/**
 * Nyelvválasztó: két elemű szegmentált vezérlő zászlóval és nyelvkóddal.
 * Egy kattintással vált, és mindig látszik, melyik nyelv aktív. A témaváltóval
 * és a kijelentkezéssel azonos magasságú, hogy egy klasztert alkossanak.
 */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      role="radiogroup"
      aria-label={t.meta.switcherLabel}
      className={`flex min-h-11 items-center gap-1 rounded-lg bg-gray-200 p-1 dark:bg-gray-700 ${className}`}
    >
      {LANGUAGES.map(value => {
        const Flag = FLAGS[value];
        const isActive = value === language;
        // Minden nyelvet a saját nyelvén nevezünk meg
        const own = translations[value].meta;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={own.languageName}
            title={own.switchTo}
            lang={value}
            onClick={() => setLanguage(value)}
            className={`flex min-h-9 items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 ${
              isActive
                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-300 dark:bg-gray-900 dark:text-white dark:ring-gray-600'
                : 'text-gray-600 opacity-70 hover:opacity-100 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            <span className="block h-3.5 w-5 flex-shrink-0 overflow-hidden rounded-[3px] ring-1 ring-black/15 dark:ring-white/20">
              <Flag />
            </span>
            <span className="hidden sm:inline">{CODES[value]}</span>
          </button>
        );
      })}
    </div>
  );
}
