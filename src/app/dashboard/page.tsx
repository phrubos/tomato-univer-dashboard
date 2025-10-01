'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BreederChart from "@/components/BreederChart";
import {
  processChartData,
  groupDataByBreeder,
  BREEDERS,
  loadL50Data,
  groupL50DataByBreeder,
  processL50DataForChart,
  type L50Data
} from "@/utils/dataProcessor";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { isAuthenticated, accessLevel, logout } = useAuth();
  const router = useRouter();
  const [l50Data, setL50Data] = useState<L50Data[]>([]);
  const [isLoadingL50, setIsLoadingL50] = useState(true);
  const [showL50ForBasf, setShowL50ForBasf] = useState(false);
  const [showL50ForWaller, setShowL50ForWaller] = useState(false);

  // Adatok feldolgozása
  const erettData = processChartData('érett');
  const romloData = processChartData('romló');

  const erettGrouped = groupDataByBreeder(erettData);
  const romloGrouped = groupDataByBreeder(romloData);

  // L50 adatok betöltése
  useEffect(() => {
    async function fetchL50Data() {
      try {
        const data = await loadL50Data();
        setL50Data(data);
      } catch (error) {
        console.error('Error loading L50 data:', error);
      } finally {
        setIsLoadingL50(false);
      }
    }

    if (isAuthenticated) {
      fetchL50Data();
    }
  }, [isAuthenticated]);

  // L50 adatok feldolgozása
  const l50ErettData = l50Data.length > 0 ? processL50DataForChart(l50Data, 'érett') : [];
  const l50RomloData = l50Data.length > 0 ? processL50DataForChart(l50Data, 'romló') : [];

  const l50ErettGrouped = groupDataByBreeder(l50ErettData);
  const l50RomloGrouped = groupDataByBreeder(l50RomloData);

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

  // Nemesítőházak szűrése access level alapján
  const getFilteredBreeders = () => {
    if (!accessLevel || accessLevel === 'total') {
      return BREEDERS;
    }

    switch (accessLevel) {
      case 'unigen':
        return BREEDERS.filter(breeder => breeder.name === 'Unigen Seeds');
      case 'nunhems':
        return BREEDERS.filter(breeder => breeder.name === 'BASF-Nunhems');
      case 'waller_heinz':
        return BREEDERS.filter(breeder => breeder.name === 'WALLER + Heinz');
      default:
        return [];
    }
  };

  // Adatok kiválasztása a toggle state alapján
  const getDataForBreeder = (breederName: string, chartType: 'érett' | 'romló') => {
    if (breederName === 'BASF-Nunhems') {
      if (showL50ForBasf) {
        const l50Data = chartType === 'érett' ? l50ErettGrouped['BASF-Nunhems'] || [] : l50RomloGrouped['BASF-Nunhems'] || [];
        return {
          data: l50Data,
          isL50: true,
          title: 'BASF-Nunhems',
          hasL50Available: l50Data.length > 0
        };
      } else {
        const originalData = chartType === 'érett' ? erettGrouped[breederName] || [] : romloGrouped[breederName] || [];
        const l50Data = chartType === 'érett' ? l50ErettGrouped['BASF-Nunhems'] || [] : l50RomloGrouped['BASF-Nunhems'] || [];
        return {
          data: originalData,
          isL50: false,
          title: breederName,
          hasL50Available: l50Data.length > 0
        };
      }
    } else if (breederName === 'WALLER + Heinz') {
      if (showL50ForWaller) {
        // Csak az L50 adatokat használjuk, nem kombináljuk az eredeti adatokkal
        const l50Data = chartType === 'érett' ? l50ErettGrouped['Prestomech + Heinz'] || [] : l50RomloGrouped['Prestomech + Heinz'] || [];

        return {
          data: l50Data,
          isL50: true,
          title: 'Prestomech + Heinz',
          hasL50Available: l50Data.length > 0
        };
      } else {
        const originalData = chartType === 'érett' ? erettGrouped[breederName] || [] : romloGrouped[breederName] || [];
        const l50Data = chartType === 'érett' ? l50ErettGrouped['Prestomech + Heinz'] || [] : l50RomloGrouped['Prestomech + Heinz'] || [];
        return {
          data: originalData,
          isL50: false,
          title: breederName,
          hasL50Available: l50Data.length > 0
        };
      }
    } else {
      const originalData = chartType === 'érett' ? erettGrouped[breederName] || [] : romloGrouped[breederName] || [];
      return {
        data: originalData,
        isL50: false,
        title: breederName,
        hasL50Available: false
      };
    }
  };

  const filteredBreeders = getFilteredBreeders();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

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
            Tövön tarthatóság elemzés nemesítőházak szerint
          </p>
          {accessLevel !== 'total' && (
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              Megjelenített nézet: {accessLevel === 'unigen' ? 'Unigen Seeds' : accessLevel === 'nunhems' ? 'BASF-Nunhems' : 'WALLER + Heinz'}
            </p>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex space-x-1">
              <button
                className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm"
              >
                📊 Tövön Tarthatóság Diagram
              </button>
              <button
                onClick={() => router.push('/dashboard/halmozott-termes')}
                className="px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              >
                📈 Halmozott Termés Diagram
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
                <p><span className="font-semibold">I. és II.:</span> első és második szedés. A szedések augusztus 14. és szeptember 4. között történtek. Ugyanazon fajta két szedési időpontja között mindig 8 nap telt el.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bal-jobb oldali elrendezés */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bal oldal - Érett bogyó mennyisége szekció */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">
                Érett bogyó mennyisége (t/ha)
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-muted-foreground">
                Az ép, érett bogyó mennyisége az I. és II. szedés során
              </p>
            </div>

            <div className="space-y-6">
              {filteredBreeders.map((breeder) => {
                const breederData = getDataForBreeder(breeder.name, 'érett');
                const varieties = breederData.data;

                if (varieties.length === 0) return null;

                return (
                  <div key={`erett-${breeder.name}`} className="w-full bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg p-6 shadow-sm">
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: breederData.isL50 && breeder.name === 'WALLER + Heinz' ? '#1e40af' : breeder.color }}
                          />
                          <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                            {breederData.title}
                          </h3>
                        </div>

                        {/* Toggle gomb csak akkor jelenik meg, ha van L50 adat */}
                        {breederData.hasL50Available && !isLoadingL50 && (
                          <button
                            onClick={() => {
                              if (breeder.name === 'BASF-Nunhems') {
                                setShowL50ForBasf(!showL50ForBasf);
                              } else if (breeder.name === 'WALLER + Heinz') {
                                setShowL50ForWaller(!showL50ForWaller);
                              }
                            }}
                            className="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200"
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
                      title="Érett bogyó mennyisége"
                      varieties={varieties}
                      breederColor={breederData.isL50 && breeder.name === 'WALLER + Heinz' ? '#1e40af' : breeder.color}
                      breederName={breederData.title}
                      allVarietiesData={breederData.isL50 ? [...erettData, ...l50ErettData] : erettData}
                      showOnlyLakitelek={breederData.isL50}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Jobb oldal - Romló bogyó mennyisége szekció */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">
                Romló bogyó mennyisége (t/ha)
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-muted-foreground">
                A romló bogyó mennyisége az I. és II. szedés során
              </p>
            </div>

            <div className="space-y-6">
              {filteredBreeders.map((breeder) => {
                const breederData = getDataForBreeder(breeder.name, 'romló');
                const varieties = breederData.data;

                if (varieties.length === 0) return null;

                return (
                  <div key={`romlo-${breeder.name}`} className="w-full bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg p-6 shadow-sm">
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: breederData.isL50 && breeder.name === 'WALLER + Heinz' ? '#1e40af' : breeder.color }}
                          />
                          <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                            {breederData.title}
                          </h3>
                        </div>

                        {/* Toggle gomb csak akkor jelenik meg, ha van L50 adat */}
                        {breederData.hasL50Available && !isLoadingL50 && (
                          <button
                            onClick={() => {
                              if (breeder.name === 'BASF-Nunhems') {
                                setShowL50ForBasf(!showL50ForBasf);
                              } else if (breeder.name === 'WALLER + Heinz') {
                                setShowL50ForWaller(!showL50ForWaller);
                              }
                            }}
                            className="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200"
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
                      title="Romló bogyó mennyisége"
                      varieties={varieties}
                      breederColor={breederData.isL50 && breeder.name === 'WALLER + Heinz' ? '#1e40af' : breeder.color}
                      breederName={breederData.title}
                      allVarietiesData={breederData.isL50 ? [...romloData, ...l50RomloData] : romloData}
                      showOnlyLakitelek={breederData.isL50}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-border text-center">
          <p className="text-sm text-gray-600 dark:text-muted-foreground">
            🍅 Paradicsom fajtakísérlet - 2025 © Minden jog fenntartva
          </p>
        </div>
      </div>
    </div>
  );
}
