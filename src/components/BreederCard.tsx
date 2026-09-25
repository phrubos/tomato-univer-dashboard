'use client';

import { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import BreederChart, { type MetricKind } from '@/components/BreederChart';
import type { ProcessedData } from '@/utils/dataProcessor';
import { useLanguage } from '@/contexts/LanguageContext';

interface BreederCardProps {
  /** A kártyafejlécben megjelenő nemesítőház-név. */
  title: string;
  /** A nemesítőház színe (L50 nézetben a sorozat saját színe). */
  color: string;
  /** A mért jellemző megjelenített neve, pl. „Érett bogyó mennyisége”. */
  metric: string;
  /** A mért jellemző típusa: ettől függ a tengely, a tizedesjegyek és az értékelés iránya. */
  kind: MetricKind;
  /** A kísérlet megnevezése a fejléc közepén, pl. „2 és 4 soros kísérletek”. */
  experiment: string;
  varieties: ProcessedData[];
  allVarietiesData: ProcessedData[];
  showOnlyLakitelek: boolean;
  /** A Brix-diagramoknak nincs teljes képernyős nézete. */
  expandable?: boolean;
}

const ACTION_CLASS =
  'flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors duration-200 cursor-pointer hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 dark:border-border dark:text-muted-foreground dark:hover:bg-muted/40 dark:hover:text-foreground';

/**
 * Egy nemesítőház diagramja kártyában. A kártyafejléc viszi a nevet, a
 * fajtaszámot, a kísérlet megnevezését és a teljes képernyős nézetet.
 */
export default function BreederCard({
  title,
  color,
  metric,
  kind,
  experiment,
  varieties,
  allVarietiesData,
  showOnlyLakitelek,
  expandable = true
}: BreederCardProps) {
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <section className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-border dark:bg-card">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="h-4 w-4 flex-shrink-0 rounded-full ring-1 ring-gray-900/20 dark:ring-white/25"
            style={{ backgroundColor: color }}
          />
          <div>
            <h3 className="text-lg font-semibold text-foreground sm:text-xl">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-muted-foreground">
              {t.breederCard.varietyCount(varieties.length)}
            </p>
          </div>
        </div>

        <p className="mx-auto rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-muted dark:text-foreground">
          {experiment}
        </p>

        {expandable && (
          <button
            type="button"
            onClick={() => setIsFullScreenOpen(true)}
            aria-label={t.common.fullScreen}
            title={t.common.fullScreen}
            className={ACTION_CLASS}
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <BreederChart
        title={metric}
        kind={kind}
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
