'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";

export default function HalmozottTermesDashboard() {
  const { isAuthenticated, accessLevel, logout } = useAuth();
  const router = useRouter();

  // Ha nincs autentikálva vagy nincs total hozzáférés, irányítson vissza
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    } else if (accessLevel !== 'total') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, accessLevel, router]);

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

        {/* Main Content Area */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-red-500 rounded-full mb-8 shadow-lg">
              <span className="text-4xl">📈</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Halmozott Termés Diagram
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Ez az oldal jelenleg fejlesztés alatt áll. Itt fognak megjelenni a halmozott termés adatok és diagramok.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Hamarosan elérhető</span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                A halmozott termés adatok feldolgozása és megjelenítése folyamatban van.
              </p>
            </div>
          </div>
        </div>

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