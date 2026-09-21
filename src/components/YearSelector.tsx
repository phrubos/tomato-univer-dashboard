'use client';

import { useSeason } from '@/contexts/SeasonContext';
import { SEASON_YEARS, type SeasonYear } from '@/utils/dataProcessor';

/**
 * Szezonváltó: szegmentált kapcsoló a kísérleti évek között.
 * A kiválasztott év emelt lapon ül, mellette a betakarítást jelző pont.
 */
export default function YearSelector() {
  const { year, setYear } = useSeason();

  return (
    <div className="flex justify-center">
      <div className="inline-flex items-center gap-3 rounded-full border border-gray-200 bg-white/80 px-3 py-2 shadow-sm backdrop-blur-sm dark:border-border dark:bg-card/70">
        <span className="pl-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-muted-foreground">
          Szezon
        </span>

        <div
          role="radiogroup"
          aria-label="Vizsgált év"
          className="relative flex items-center gap-1 rounded-full bg-gray-100 p-1 dark:bg-muted/40"
        >
          {SEASON_YEARS.map((value: SeasonYear) => {
            const isActive = value === year;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setYear(value)}
                className={`relative flex min-h-9 items-center gap-2 rounded-full px-4 py-1.5 font-mono text-sm font-semibold tabular-nums transition-all duration-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-md dark:bg-card dark:text-foreground'
                    : 'text-gray-500 hover:text-gray-900 dark:text-muted-foreground dark:hover:text-foreground'
                }`}
              >
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                    isActive ? 'scale-100 bg-red-500' : 'scale-0 bg-transparent'
                  }`}
                />
                {value}
              </button>
            );
          })}
        </div>

        <span className="sr-only" role="status" aria-live="polite">
          {year}-os szezon adatai láthatók
        </span>
      </div>
    </div>
  );
}
