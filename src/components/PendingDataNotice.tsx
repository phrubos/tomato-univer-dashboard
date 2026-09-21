'use client';

import { useSeason } from '@/contexts/SeasonContext';
import { SEASON_YEARS } from '@/utils/dataProcessor';

interface PendingDataNoticeProps {
  title: string;
  description: string;
}

/**
 * Üres állapot olyan nézethez, ahol a mérés még folyamatban van.
 * A szaggatott keret és a milliméterpapír-háttér a kitöltetlen mintalapot idézi.
 */
export default function PendingDataNotice({ title, description }: PendingDataNoticeProps) {
  const { year, setYear } = useSeason();
  const previousYear = [...SEASON_YEARS].reverse().find(value => value !== year);

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-white/60 px-6 py-14 text-center dark:border-border dark:bg-card/40">
      {/* Milliméterpapír-textúra */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.15]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          color: '#94a3b8',
          maskImage: 'radial-gradient(ellipse at center, black 10%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 10%, transparent 72%)'
        }}
      />

      <div className="relative mx-auto flex max-w-xl flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm dark:border-border dark:bg-card">
          <svg
            className="h-6 w-6 text-gray-400 dark:text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M9 3h6m-5 0v5.5L5.5 17A2.5 2.5 0 007.7 21h8.6a2.5 2.5 0 002.2-4L14 8.5V3"
            />
            <path strokeLinecap="round" strokeWidth={1.8} d="M7.5 15.5h9" />
          </svg>
        </div>

        <div className="space-y-2">
          <h3 className="text-balance text-xl font-semibold text-foreground sm:text-2xl">{title}</h3>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
          <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
          Adatra vár
        </span>

        {previousYear !== undefined && (
          <button
            type="button"
            onClick={() => setYear(previousYear)}
            className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:shadow-md active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>
              <span className="font-mono tabular-nums">{previousYear}</span>-os adatok megtekintése
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
