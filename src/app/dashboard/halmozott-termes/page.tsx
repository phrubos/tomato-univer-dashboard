'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import { useSeason } from "@/contexts/SeasonContext";
import CumulativeChart from "@/components/CumulativeChart";
import YearSelector from "@/components/YearSelector";
import { getBreeders } from "@/utils/dataProcessor";
import {
  loadHalmozottData,
  processCumulativeData,
  groupHalmozottByBreeder,
  filterDataByAccessLevel,
  getLocationDisplayName,
  getAvailableLocationsForAccessLevel,
  BREEDER_COLORS
} from "@/utils/halmozottDataProcessor";

// A diagramok sorrendje; az itt nem szereplő nemesítőházak a lista végére kerülnek
const BREEDER_ORDER = [
  'Unigen Seeds',
  'BASF-Nunhems',
  'WALLER + Heinz',
  'Prestomech + Heinz',
  'Syngenta+Heinz',
  'Heinz'
];

export default function HalmozottTermesDashboard() {
  const { isAuthenticated, accessLevel, logout } = useAuth();
  const { year } = useSeason();
  const router = useRouter();

  // A halmozott adatok a seasons.json-ból jönnek, szinkron módon
  const halmozottData = loadHalmozottData(year);
  const availableLocations = getAvailableLocationsForAccessLevel(halmozottData, accessLevel);

  const [selectedLocation, setSelectedLocation] = useState<string>(() => availableLocations[0] ?? '');
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  // Ha nincs autentikálva, irányítson vissza
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Szezonváltás után a korábban nézett helyszínt próbáljuk visszaállítani.
  // Ha az adott évben nincs ilyen helyszín (pl. 2026-ban Mezőberény), jelezzük a váltást.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = sessionStorage.getItem('univer-location');
    } catch {}
    if (!stored || stored === selectedLocation || availableLocations.length === 0) return;

    if (availableLocations.includes(stored)) {
      setSelectedLocation(stored);
    } else {
      setLocationNotice(
        `A(z) ${getLocationDisplayName(stored)} helyszín a ${year}-os szezonban nem szerepel, ` +
        `ezért a(z) ${getLocationDisplayName(availableLocations[0])} nézet látható.`
      );
    }
    // Csak a nézet megnyitásakor fut le, a szezonváltás újra mountolja az oldalt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectLocation = (location: string) => {
    setSelectedLocation(location);
    setLocationNotice(null);
    try {
      sessionStorage.setItem('univer-location', location);
    } catch {}
  };

  // Ha nincs autentikálva, ne jelenítse meg a tartalmat
  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navigateToErettRomlo = () => {
    router.push('/dashboard');
  };

  // Process data for current location
  const currentLocationData = selectedLocation && halmozottData[selectedLocation] ? halmozottData[selectedLocation] : [];
  const cumulativeData = processCumulativeData(currentLocationData);
  const groupedByBreeder = groupHalmozottByBreeder(cumulativeData, selectedLocation);
  const filteredData = filterDataByAccessLevel(groupedByBreeder, accessLevel);

  // Csak azok a nemesítőházak, amelyeknek van adatuk ebben a szezonban és nézetben
  const orderedBreeders = Object.keys(filteredData).sort((a, b) => {
    const indexA = BREEDER_ORDER.indexOf(a);
    const indexB = BREEDER_ORDER.indexOf(b);
    return (indexA === -1 ? BREEDER_ORDER.length : indexA) - (indexB === -1 ? BREEDER_ORDER.length : indexB);
  });

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
            Halmozott Termés Diagram
          </p>
          {accessLevel !== 'total' && (
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              Megjelenített nézet: {getBreeders(year, accessLevel).map(breeder => breeder.name).join(', ') || '–'}
            </p>
          )}
        </div>

        <YearSelector />

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex space-x-1">
              <button
                onClick={navigateToErettRomlo}
                className="px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              >
                📊 Tövön Tarthatóság Diagram
              </button>
              <button
                className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm"
              >
                📈 Halmozott Termés Diagram
              </button>
              <button
                onClick={() => router.push('/dashboard/brix-diagram')}
                className="px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
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
                <p className="font-medium mb-1">Szedési információk:</p>
                <p>
                  <span className="font-semibold">I. és II.:</span> első és második szedés.
                  {year === 2025 && ' A szedések augusztus 14. és szeptember 4. között történtek.'}
                  {' '}Ugyanazon fajta két szedési időpontja között mindig 8 nap telt el.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Selector */}
        <div className="flex justify-center mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-1">
              {availableLocations.map((location) => (
                <button
                  key={location}
                  onClick={() => selectLocation(location)}
                  aria-pressed={selectedLocation === location}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    selectedLocation === location
                      ? 'text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {getLocationDisplayName(location)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Szezonváltás miatti helyszínváltás jelzése */}
        {locationNotice && (
          <div className="flex justify-center mb-6">
            <p
              role="status"
              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-800/30 dark:bg-amber-950/20 dark:text-amber-300"
            >
              {locationNotice}
            </p>
          </div>
        )}

        {/* Charts */}
        {selectedLocation && (
          <div className="space-y-8">
            {orderedBreeders.map((breederName) => {
              const varieties = filteredData[breederName] || [];
              if (varieties.length === 0) return null;

              // Calculate average maturity value for this breeder
              const totalErett = varieties.reduce((sum, v) => sum + (v.érett || 0), 0);
              const averageErett = totalErett / varieties.length;

              const breederColor = BREEDER_COLORS[breederName as keyof typeof BREEDER_COLORS] || '#6B7280';

              return (
                <div key={breederName} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold flex items-center gap-3 text-gray-900 dark:text-white">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: breederColor }}
                      />
                      {breederName}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {Math.ceil(varieties.length / 2)} fajta • {getLocationDisplayName(selectedLocation)}
                      </p>
                      <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800/30">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-0.5 bg-red-600 rounded-full shadow-sm"></div>
                          <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                        </div>
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                          Átlagos érett érték: <span className="font-bold">{averageErett.toFixed(1)} t/ha</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <CumulativeChart
                    varieties={varieties}
                    breederName={breederName}
                    locationName={getLocationDisplayName(selectedLocation)}
                  />
                </div>
              );
            })}

            {/* No data message */}
            {Object.keys(filteredData).length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Nincs adat
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Ehhez a helyszínhez nem található adat.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            🍅 Paradicsom fajtakísérlet - {year} © Minden jog fenntartva
          </p>
        </div>
      </div>
    </div>
  );
}