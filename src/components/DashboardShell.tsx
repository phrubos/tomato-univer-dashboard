'use client';

import type { ReactNode } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import { useSeason } from '@/contexts/SeasonContext';

interface DashboardShellProps {
  /** A cím alatti egysoros leírás. */
  subtitle: string;
  /** A vezérlősáv jobb szélén megjelenő rövid szedési információ. */
  info: string;
  /** A korlátozott hozzáféréssel látható nemesítőházak neve. */
  visibleBreeders?: string;
  onLogout: () => void;
  children: ReactNode;
}

/**
 * A dashboard közös héja. Mindhárom nézet ezt használja, ezért a cím, a
 * vezérlősáv és a tartalom bal éle nézetváltáskor sem mozdul el.
 */
export default function DashboardShell({
  subtitle,
  info,
  visibleBreeders,
  onLogout,
  children
}: DashboardShellProps) {
  const { year } = useSeason();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-[1600px] px-6 py-6 lg:px-8">
        <DashboardHeader
          subtitle={subtitle}
          info={info}
          visibleBreeders={visibleBreeders}
          onLogout={onLogout}
        />

        <main className="mt-8 space-y-8">{children}</main>

        <footer className="mt-12 border-t border-gray-200 pt-8 text-center dark:border-border">
          <p className="text-sm text-gray-600 dark:text-muted-foreground">
            🍅 Paradicsom fajtakísérlet – {year} © Minden jog fenntartva
          </p>
        </footer>
      </div>
    </div>
  );
}
