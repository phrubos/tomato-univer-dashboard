'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import { useSeason } from "@/contexts/SeasonContext";
import { useLanguage } from "@/contexts/LanguageContext";
import CumulativeChart from "@/components/CumulativeChart";
import DashboardShell from "@/components/DashboardShell";
import {
  compareBreeders,
  getBreederColor,
  getBreeders,
  getHarvestPeriod
} from "@/utils/dataProcessor";
import {
  loadHalmozottData,
  processCumulativeData,
  groupHalmozottByBreeder,
  filterDataByAccessLevel,
  getLocationDisplayName,
  getAvailableLocationsForAccessLevel
} from "@/utils/halmozottDataProcessor";

export default function HalmozottTermesDashboard() {
  const { isAuthenticated, accessLevel, logout } = useAuth();
  const { year } = useSeason();
  const { t } = useLanguage();
  const router = useRouter();

  // A halmozott adatok a seasons.json-ból jönnek, szinkron módon
  const halmozottData = loadHalmozottData(year);
  const availableLocations = getAvailableLocationsForAccessLevel(halmozottData, accessLevel);
  const locationName = (location: string) => getLocationDisplayName(location, t.cumulativeSites);

  const [selectedLocation, setSelectedLocation] = useState<string>(() => availableLocations[0] ?? '');
  // A korábban nézett, de ebben a szezonban nem szereplő helyszín kulcsa (nyelvváltáskor is újrafordul)
  const [missingLocation, setMissingLocation] = useState<string | null>(null);

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
      setMissingLocation(stored);
    }
    // Csak a nézet megnyitásakor fut le, a szezonváltás újra mountolja az oldalt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectLocation = (location: string) => {
    setSelectedLocation(location);
    setMissingLocation(null);
    try {
      sessionStorage.setItem('univer-location', location);
    } catch {}
  };

  // Ha nincs autentikálva, ne jelenítse meg a tartalmat
  if (!isAuthenticated) {
    return null;
  }

  // A vezérlősávba kerülő rövid szedési információ
  const period = getHarvestPeriod(year, accessLevel);
  const harvestInfo = period ? t.harvest.period(period.first, period.last) : t.harvest.fallback;
  const visibleBreeders = getBreeders(year, accessLevel).map(breeder => breeder.name).join(', ') || '–';

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Process data for current location
  const currentLocationData = selectedLocation && halmozottData[selectedLocation] ? halmozottData[selectedLocation] : [];
  const cumulativeData = processCumulativeData(currentLocationData);
  const groupedByBreeder = groupHalmozottByBreeder(cumulativeData, selectedLocation);
  const filteredData = filterDataByAccessLevel(groupedByBreeder, accessLevel);

  // Csak azok a nemesítőházak, amelyeknek van adatuk ebben a szezonban és nézetben
  const orderedBreeders = Object.keys(filteredData).sort(compareBreeders);

  return (
    <DashboardShell
      subtitle={t.cumulative.subtitle}
      info={harvestInfo}
      visibleBreeders={accessLevel !== 'total' ? visibleBreeders : undefined}
      onLogout={handleLogout}
    >
        {/* Location Selector */}
        <div className="flex mb-6">
          {/* Süllyesztett sáv, kiemelt aktív chip – a szezonválasztóval azonos kezelés */}
          <div className="rounded-xl border border-gray-200 bg-gray-100 p-1 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex flex-wrap gap-1">
              {availableLocations.map((location) => (
                <button
                  key={location}
                  onClick={() => selectLocation(location)}
                  aria-pressed={selectedLocation === location}
                  className={`min-h-11 px-4 py-2 text-sm rounded-lg transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 ${
                    selectedLocation === location
                      ? 'bg-white font-semibold text-gray-900 shadow-md ring-1 ring-gray-300 dark:bg-muted dark:text-foreground dark:ring-border'
                      : 'font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-gray-800'
                  }`}
                >
                  {locationName(location)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Szezonváltás miatti helyszínváltás jelzése */}
        {missingLocation && availableLocations.length > 0 && (
          <div className="flex mb-6">
            <p
              role="status"
              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-800/30 dark:bg-amber-950/20 dark:text-amber-300"
            >
              {t.cumulative.locationNotice(locationName(missingLocation), year, locationName(availableLocations[0]))}
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

              const breederColor = getBreederColor(breederName);

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
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t.cumulative.varietySummary(Math.ceil(varieties.length / 2), locationName(selectedLocation))}
                      </p>
                      <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800/30">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-0.5 bg-red-600 rounded-full shadow-sm"></div>
                          <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                        </div>
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                          {t.cumulative.meanRipe} <span className="font-bold">{averageErett.toFixed(1)} {t.common.unitTha}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <CumulativeChart
                    varieties={varieties}
                    breederName={breederName}
                    locationName={locationName(selectedLocation)}
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
                    {t.cumulative.noData}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t.cumulative.noDataForSite}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

    </DashboardShell>
  );
}
