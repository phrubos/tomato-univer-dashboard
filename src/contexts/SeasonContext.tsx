'use client';

import { createContext, Fragment, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { DEFAULT_YEAR, getSeasonYearsForAccess, SEASON_YEARS, type SeasonYear } from '@/utils/dataProcessor';
import { useChartPanel } from '@/contexts/ChartPanelContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface SeasonContextType {
  year: SeasonYear;
  setYear: (year: SeasonYear) => void;
  /** A belépett felhasználó számára elérhető szezonok (ahol van adata). */
  seasonYears: SeasonYear[];
}

const SeasonContext = createContext<SeasonContextType | null>(null);

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [requestedYear, updateYear] = useState<SeasonYear>(DEFAULT_YEAR);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const { closePanel } = useChartPanel();
  const { accessLevel } = useAuth();
  const { t } = useLanguage();

  // Korlátozott hozzáférésnél csak azok a szezonok választhatók, amelyekben a
  // nemesítőháznak van adata (pl. a Syngenta 2026-tól szerepel önállóan).
  const seasonYears = useMemo(() => {
    const years = accessLevel ? getSeasonYearsForAccess(accessLevel) : [];
    return years.length > 0 ? years : SEASON_YEARS;
  }, [accessLevel]);
  const year = seasonYears.includes(requestedYear) ? requestedYear : seasonYears[seasonYears.length - 1];

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
    if (!seasonYears.includes(nextYear)) return;
    closePanel();
    updateYear(nextYear);
  };

  if (!ready) return <div role="status" className="p-8 text-center text-foreground">{t.common.loadingSeason}</div>;
  return (
    <SeasonContext.Provider value={{ year, setYear, seasonYears }}>
      <Fragment key={year}>{children}</Fragment>
    </SeasonContext.Provider>
  );
}

export function useSeason() {
  const context = useContext(SeasonContext);
  if (!context) throw new Error('useSeason requires SeasonProvider');
  return context;
}
