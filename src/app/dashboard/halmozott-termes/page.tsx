'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import CumulativeChart from "@/components/CumulativeChart";
import {
  loadHalmozottData,
  processCumulativeData,
  groupHalmozottByBreeder,
  filterDataByAccessLevel,
  getLocationDisplayName,
  getAvailableLocations,
  BREEDER_COLORS,
  type HalmozottLocationData
} from "@/utils/halmozottDataProcessor";

export default function HalmozottTermesDashboard() {
  const { isAuthenticated, accessLevel, logout } = useAuth();
  const router = useRouter();
  const [halmozottData, setHalmozottData] = useState<HalmozottLocationData>({});
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Ha nincs autentikálva vagy nincs total hozzáférés, irányítson vissza
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    } else if (accessLevel !== 'total') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, accessLevel, router]);

  // Load data
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const data = await loadHalmozottData();
        setHalmozottData(data);

        // Set default location to first available
        const locations = getAvailableLocations(data);
        if (locations.length > 0 && !selectedLocation) {
          setSelectedLocation(locations[0]);
        }
      } catch (error) {
        console.error('Error loading halmozott data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (isAuthenticated && accessLevel === 'total') {
      fetchData();
    }
  }, [isAuthenticated, accessLevel, selectedLocation]);

  // Ha nincs autentikálva vagy nincs total hozzáférés, ne jelenítse meg a tartalmat
  if (!isAuthenticated || accessLevel !== 'total') {
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

  const availableLocations = getAvailableLocations(halmozottData);

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-[1920px] mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-between items-center mb-4">
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

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            🍅 Univer 2025 Dashboard
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-muted-foreground">
            Halmozott Termés Diagram
          </p>
          {accessLevel !== 'total' && (
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              Megjelenített nézet: {accessLevel === 'unigen' ? 'Unigen Seeds' : accessLevel === 'nunhems' ? 'BASF-Nunhems' : 'Waller + Heinz'}
            </p>
          )}
        </div>

        {/* Navigation Tabs - Only visible for total access */}
        {accessLevel === 'total' && (
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
              </div>
            </div>
          </div>
        )}

        {/* Location Selector */}
        <div className="flex justify-center mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-1">
              {availableLocations.map((location) => (
                <button
                  key={location}
                  onClick={() => setSelectedLocation(location)}
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg text-gray-600 dark:text-gray-300">Adatok betöltése...</span>
          </div>
        )}

        {/* Charts */}
        {!isLoading && selectedLocation && (
          <div className="space-y-8">
            {Object.entries(filteredData).map(([breederName, varieties]) => {
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
            🍅 Paradicsom fajtakísérlet - 2025 © Minden jog fenntartva
          </p>
        </div>
      </div>
    </div>
  );
}