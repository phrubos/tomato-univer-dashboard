'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BreederChart from "@/components/BreederChart";
import { processChartData, groupDataByBreeder, BREEDERS, getBreederColor } from "@/utils/dataProcessor";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { isAuthenticated, accessLevel, logout } = useAuth();
  const router = useRouter();

  // Adatok feldolgozása
  const erettData = processChartData('érett');
  const romloData = processChartData('romló');

  const erettGrouped = groupDataByBreeder(erettData);
  const romloGrouped = groupDataByBreeder(romloData);

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
        return BREEDERS.filter(breeder => breeder.name === 'Waller + Heinz');
      default:
        return [];
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
              Megjelenített nézet: {accessLevel === 'unigen' ? 'Unigen Seeds' : accessLevel === 'nunhems' ? 'BASF-Nunhems' : 'Waller + Heinz'}
            </p>
          )}
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
                Az ép, érett bogyó mennyisége I. és II. szedés során
              </p>
            </div>

            <div className="space-y-6">
              {filteredBreeders.map((breeder) => {
                const varieties = erettGrouped[breeder.name] || [];
                if (varieties.length === 0) return null;

                return (
                  <div key={`erett-${breeder.name}`} className="w-full bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg p-6 shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-3 text-foreground">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: breeder.color }}
                        />
                        {breeder.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-muted-foreground">
                        {varieties.length} fajta adatai
                      </p>
                    </div>
                    <BreederChart
                      title="Érett bogyó mennyisége"
                      varieties={varieties}
                      breederColor={breeder.color}
                      breederName={breeder.name}
                      allVarietiesData={erettData}
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
                A romló bogyó mennyisége I. és II. szedés során
              </p>
            </div>

            <div className="space-y-6">
              {filteredBreeders.map((breeder) => {
                const varieties = romloGrouped[breeder.name] || [];
                if (varieties.length === 0) return null;

                return (
                  <div key={`romlo-${breeder.name}`} className="w-full bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg p-6 shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-3 text-foreground">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: breeder.color }}
                        />
                        {breeder.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-muted-foreground">
                        {varieties.length} fajta adatai
                      </p>
                    </div>
                    <BreederChart
                      title="Romló bogyó mennyisége"
                      varieties={varieties}
                      breederColor={breeder.color}
                      breederName={breeder.name}
                      allVarietiesData={romloData}
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
