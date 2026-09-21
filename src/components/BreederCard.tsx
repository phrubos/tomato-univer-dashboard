'use client';

import { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import BreederChart from '@/components/BreederChart';
import type { ProcessedData } from '@/utils/dataProcessor';

interface BreederCardProps {
  /** A kártyafejlécben megjelenő nemesítőház-név. */
  title: string;
  /** A nemesítőház színe (L50 nézetben a sorozat saját színe). */
  color: string;
  /** A mért jellemző, pl. „Érett bogyó mennyisége”. */
  metric: string;
  varieties: ProcessedData[];
  allVarietiesData: ProcessedData[];
  showOnlyLakitelek: boolean;
  /** Lakitelek 50 töves váltó, ha van hozzá adat. */
  l50?: { active: boolean; onToggle: () => void };
  /** A Brix-diagramoknak nincs teljes képernyős nézete. */
  expandable?: boolean;
}

const ACTION_CLASS =
  'flex min-h-11 items-center justify-center rounded-lg border px-3 text-xs font-medium transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600';

const ACTION_IDLE =
  'border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:border-border dark:text-muted-foreground dark:hover:bg-muted/40 dark:hover:text-foreground';

const ACTION_ACTIVE =
  'border-transparent bg-gray-200 text-gray-900 dark:bg-muted dark:text-foreground';

/**
 * Egy nemesítőház diagramja kártyában. A kártyafejléc viszi a nevet, a
 * fajtaszámot és az összes akciót – egy sorban, egy formanyelven.
 */
export default function BreederCard({
  title,
  color,
  metric,
  varieties,
  allVarietiesData,
  showOnlyLakitelek,
  l50,
  expandable = true
}: BreederCardProps) {
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);

  return (
    <section className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-border dark:bg-card">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="h-4 w-4 flex-shrink-0 rounded-full ring-1 ring-gray-900/20 dark:ring-white/25"
            style={{ backgroundColor: color }}
          />
          <div>
            <h3 className="text-lg font-semibold text-foreground sm:text-xl">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-muted-foreground">
              {varieties.length} fajta adatai{showOnlyLakitelek ? ' • Lakitelek 50 töves' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {l50 && (
            <button
              type="button"
              onClick={l50.onToggle}
              aria-pressed={l50.active}
              className={`${ACTION_CLASS} ${l50.active ? ACTION_ACTIVE : ACTION_IDLE}`}
            >
              {l50.active ? '← Vissza' : 'Lakitelek 50 töves'}
            </button>
          )}
          {expandable && (
            <button
              type="button"
              onClick={() => setIsFullScreenOpen(true)}
              aria-label="Teljes képernyős nézet"
              title="Teljes képernyős nézet"
              className={`${ACTION_CLASS} ${ACTION_IDLE} min-w-11 px-0`}
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <BreederChart
        title={metric}
        varieties={varieties}
        breederColor={color}
        breederName={title}
        allVarietiesData={allVarietiesData}
        showOnlyLakitelek={showOnlyLakitelek}
        isFullScreenOpen={expandable && isFullScreenOpen}
        onCloseFullScreen={() => setIsFullScreenOpen(false)}
      />
    </section>
  );
}
