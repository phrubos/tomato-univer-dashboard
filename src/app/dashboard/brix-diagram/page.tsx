'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BreederChart from "@/components/BreederChart";
import YearSelector from "@/components/YearSelector";
import PendingDataNotice from "@/components/PendingDataNotice";
import {
  processBrixData,
  groupDataByBreeder,
  getBreeders,
  getL50Breeder,
  isMeasuredValue,
  loadBrixL50Data,
  processBrixL50DataForChart
} from "@/utils/dataProcessor";
import { useAuth } from "@/contexts/AuthContext";
import { useSeason } from "@/contexts/SeasonContext";

export default function BrixDiagram() {
  const { isAuthenticated, accessLevel, logout } = useAuth();
  const { year } = useSeason();
  const router = useRouter();

  // Melyik nemesítőházaknál van bekapcsolva a Lakitelek 50 töves nézet
  const [l50Breeders, setL50Breeders] = useState<string[]>([]);
  const toggleL50 = (breederName: string) =>
    setL50Breeders(current =>
      current.includes(breederName)
        ? current.filter(name => name !== breederName)
        : [...current, breederName]
    );

  // Brix adatok feldolgozása a kiválasztott szezonra
  const brixData = processBrixData(year);
  const brixGrouped = groupDataByBreeder(brixData);

  const brixL50Processed = processBrixL50DataForChart(loadBrixL50Data(year));
  const brixL50Grouped = groupDataByBreeder(brixL50Processed);

  // A szezonban mértek-e már egyáltalán Brix-értéket
  const hasBrixMeasurements = [...brixData, ...brixL50Processed].some(row =>
    Object.values(row.locations).some(isMeasuredValue)
  );

  // Ha nincs autentikálva, irányítson a landing page-re
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Ha nincs autentikálva, ne jelenítse meg a tartalmat
  if (!isAuthenticated) {
    return null;
  }


  // Adatok kiválasztása a toggle state alapján
  const getDataForBreeder = (breederName: string) => {
    // Az L50 táblában a nemesítőház más néven szerepelhet (pl. WALLER + Heinz -> Prestomech + Heinz)
    const l50Name = getL50Breeder(breederName);
    const l50Rows = brixL50Grouped[l50Name] ?? [];
    const showL50 = l50Breeders.includes(breederName) && l50Rows.length > 0;

    return {
      data: showL50 ? l50Rows : brixGrouped[breederName] ?? [],
      isL50: showL50,
      title: showL50 ? l50Name : breederName,
      hasL50Available: l50Rows.length > 0
    };
  };

  const filteredBreeders = getBreeders(year, accessLevel);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      {/* Kijelentkezés gomb - teljes szélesség, bal szélen */}
      <div className="mb-4">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Kijelentkezés
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            🍅 Univer {year} Dashboard
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-muted-foreground">
            Brix % elemzés nemesítőházak szerint
          </p>
          {accessLevel !== 'total' && (
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              Megjelenített nézet: {filteredBreeders.map(breeder => breeder.name).join(', ') || '–'}
            </p>
          )}
        </div>

        <YearSelector />

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex space-x-1">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              >
                📊 Tövön Tarthatóság Diagram
              </button>
              <button
                onClick={() => router.push('/dashboard/halmozott-termes')}
                className="px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              >
                📈 Halmozott Termés Diagram
              </button>
              <button
                className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm"
              >
                🔬 Brix % Diagram
              </button>
            </div>
          </div>
        </div>

        {/* Harvest Info Note */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-xl p-4 max-w-3xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">Brix % mérési információk:</p>
                <p>
                  <span className="font-semibold">I. és II.:</span> első és második szedés Brix % értékei.
                  {year === 2025 && ' A szedések augusztus 14. és szeptember 4. között történtek.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Brix % diagram szekció */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">
              Brix % értékek
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-muted-foreground">
              A bogyók cukortartalmának mérési eredményei az I. és II. szedés során
            </p>
          </div>

          {!hasBrixMeasurements ? (
            <PendingDataNotice
              title={`A ${year}-os szezon Brix-adatai még nem érkeztek meg`}
              description="A cukortartalom-mérés a szedések lezárása után készül el. Amint a laboreredmények beérkeznek, a diagramok automatikusan megjelennek itt."
            />
          ) : (
          <div className="space-y-6">
            {filteredBreeders.map((breeder) => {
              const breederData = getDataForBreeder(breeder.name);
              const varieties = breederData.data;

              if (varieties.length === 0) return null;

              return (
                <div key={`brix-${breeder.name}`} className="w-full bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg p-6 shadow-sm">
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: breederData.isL50 ? '#1e40af' : breeder.color }}
                        />
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                          {breederData.title}
                        </h3>
                      </div>

                      {/* Toggle gomb csak akkor jelenik meg, ha van L50 adat */}
                      {breederData.hasL50Available && (
                        <button
                          onClick={() => toggleL50(breeder.name)}
                          aria-pressed={breederData.isL50}
                          className="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
                        >
                          {breederData.isL50 ? '← Vissza' : '→ Lakitelek 50 töves'}
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">
                      {varieties.length} fajta adatai{breederData.isL50 ? ' • Lakitelek 50 töves' : ''}
                    </p>
                  </div>
                  <BreederChart
                    title="Brix %"
                    varieties={varieties}
                    breederColor={breederData.isL50 ? '#1e40af' : breeder.color}
                    breederName={breederData.title}
                    allVarietiesData={breederData.isL50 ? [...brixData, ...brixL50Processed] : brixData}
                    showOnlyLakitelek={breederData.isL50}
                  />
                </div>
              );
            })}
          </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-border text-center">
          <p className="text-sm text-gray-600 dark:text-muted-foreground">
            🍅 Paradicsom fajtakísérlet - {year} © Minden jog fenntartva
          </p>
        </div>
      </div>
    </div>
  );
}
