'use client';

import { createContext, Fragment, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { DEFAULT_YEAR, SEASON_YEARS, type SeasonYear } from '@/utils/dataProcessor';
import { useChartPanel } from '@/contexts/ChartPanelContext';

const SeasonContext = createContext<{ year: SeasonYear; setYear: (year: SeasonYear) => void } | null>(null);

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [year, updateYear] = useState<SeasonYear>(DEFAULT_YEAR);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const { closePanel } = useChartPanel();

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('year');
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem('univer-season');
    } catch {}
    const candidate = Number(requested ?? saved);
    updateYear(SEASON_YEARS.includes(candidate as SeasonYear) ? candidate as SeasonYear : DEFAULT_YEAR);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const url = new URL(window.location.href);
    url.searchParams.set('year', String(year));
    window.history.replaceState(window.history.state, '', url);
    try {
      sessionStorage.setItem('univer-season', String(year));
    } catch {}
  }, [year, pathname, ready]);

  useEffect(() => {
    const restore = () => {
      const candidate = Number(new URLSearchParams(window.location.search).get('year'));
      if (SEASON_YEARS.includes(candidate as SeasonYear)) updateYear(candidate as SeasonYear);
    };
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);

  const setYear = (nextYear: SeasonYear) => {
    if (!SEASON_YEARS.includes(nextYear)) return;
    closePanel();
    updateYear(nextYear);
  };

  if (!ready) return <div role="status" className="p-8 text-center text-foreground">Szezon betöltése…</div>;
  return <SeasonContext.Provider value={{ year, setYear }}><Fragment key={year}>{children}</Fragment></SeasonContext.Provider>;
}

export function useSeason() {
  const context = useContext(SeasonContext);
  if (!context) throw new Error('useSeason requires SeasonProvider');
  return context;
}
