'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useSeason } from '@/contexts/SeasonContext';
import type { SeasonYear } from '@/utils/dataProcessor';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';

const TABS = [
  { href: '/dashboard/halmozott-termes', key: 'cumulative' },
  { href: '/dashboard/brix-diagram', key: 'brix' },
  { href: '/dashboard', key: 'retention' }
] as const;

interface DashboardHeaderProps {
  /** A cím alatti egysoros leírás. */
  subtitle: string;
  /** A vezérlősáv jobb szélén megjelenő rövid szedési információ. */
  info: string;
  /** A korlátozott hozzáféréssel látható nemesítőházak neve. */
  visibleBreeders?: string;
  /** Kijelentkezés gomb kezelője. */
  onLogout: () => void;
}

/**
 * A dashboard közös fejléce: cím, majd egyetlen vezérlősáv, amely a szezonválasztót,
 * a nézetváltó füleket és a szedési információt egy sorban fogja össze.
 */
export default function DashboardHeader({
  subtitle,
  info,
  visibleBreeders,
  onLogout
}: DashboardHeaderProps) {
  const { year, setYear, seasonYears } = useSeason();
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            🍅 Univer {year} Dashboard
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-gray-600 dark:text-muted-foreground">
            {subtitle}
          </p>
          {visibleBreeders && (
            <p className="mt-1 text-sm font-medium text-gray-600 dark:text-muted-foreground">
              {t.header.visibleBreeders} {visibleBreeders}
            </p>
          )}
        </div>

        {/* A munkamenet-vezérlők (nyelv, téma, kijelentkezés) egy klaszterben, azonos formanyelven */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            type="button"
            onClick={onLogout}
            className="flex min-h-11 items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition-colors duration-200 cursor-pointer hover:bg-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t.header.logout}
          </button>
        </div>
      </div>

      {/* Vezérlősáv: szezon, nézetek és szedési információ egy sorban */}
      <div className="flex flex-wrap items-center gap-y-2 rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm dark:border-border/60 dark:bg-card">
        <div className="mr-3 flex items-center gap-2 border-r border-gray-200 pr-3 dark:border-muted">
          <span className="pl-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-muted-foreground">
            {t.header.season}
          </span>
          {/* Süllyesztett sáv, kiemelt aktív chip – adatszín nélkül is egyértelmű */}
          <div
            role="radiogroup"
            aria-label={t.header.seasonGroup}
            className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-900"
          >
            {seasonYears.map((value: SeasonYear) => {
              const isActive = value === year;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setYear(value)}
                  className={`flex min-h-9 items-center rounded-md px-3.5 py-1.5 font-mono text-sm tabular-nums transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 ${
                    isActive
                      ? 'bg-white font-semibold text-gray-900 shadow-md ring-1 ring-gray-300 dark:bg-muted dark:text-foreground dark:ring-border'
                      : 'text-gray-500 hover:text-gray-900 dark:text-muted-foreground dark:hover:text-foreground'
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>

        <nav className="flex flex-wrap gap-1" aria-label={t.header.views}>
          {TABS.map(tab => {
            const isActive = pathname === tab.href;
            return (
              <button
                key={tab.href}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => !isActive && router.push(tab.href)}
                className={`min-h-11 rounded-lg px-4 py-2 text-sm transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 ${
                  isActive
                    ? 'bg-gradient-to-r from-green-500 to-green-600 font-semibold text-slate-900 shadow-sm'
                    : 'font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                }`}
              >
                {t.header.tabs[tab.key]}
              </button>
            );
          })}
        </nav>

        <p className="ml-auto flex items-center gap-2 py-2 pl-5 pr-3 text-xs text-gray-600 dark:text-muted-foreground">
          <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" d="M12 11v5" />
            <path strokeLinecap="round" d="M12 7.5h.01" />
          </svg>
          {info}
        </p>
      </div>
    </header>
  );
}
