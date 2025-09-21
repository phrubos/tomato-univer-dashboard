'use client';

import BreederChart from "@/components/BreederChart";
import { processChartData, groupDataByBreeder, BREEDERS, getBreederColor } from "@/utils/dataProcessor";

export default function Home() {
  // Adatok feldolgozása
  const erettData = processChartData('érett');
  const romloData = processChartData('romló');

  const erettGrouped = groupDataByBreeder(erettData);
  const romloGrouped = groupDataByBreeder(romloData);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-[1920px] mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">
            🍅 Univer 2025 Dashboard
          </h1>
          <p className="text-lg">
            Tövön tarthatóság elemzés nemesítőházak szerint
          </p>
        </div>

        {/* Bal-jobb oldali elrendezés */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bal oldal - Érett bogyó mennyisége szekció */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">
                Érett bogyó mennyisége (t/ha)
              </h2>
              <p>
                Az ép, érett bogyó mennyisége I. és II. szedés során
              </p>
            </div>

            <div className="space-y-6">
              {BREEDERS.map((breeder) => {
                const varieties = erettGrouped[breeder.name] || [];
                if (varieties.length === 0) return null;

                return (
                  <div key={`erett-${breeder.name}`} className="w-full bg-card border border-border rounded-lg p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: breeder.color }}
                        />
                        {breeder.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
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
              <h2 className="text-3xl font-bold mb-2">
                Romló bogyó mennyisége (t/ha)
              </h2>
              <p>
                A romló bogyó mennyisége I. és II. szedés során
              </p>
            </div>

            <div className="space-y-6">
              {BREEDERS.map((breeder) => {
                const varieties = romloGrouped[breeder.name] || [];
                if (varieties.length === 0) return null;

                return (
                  <div key={`romlo-${breeder.name}`} className="w-full bg-card border border-border rounded-lg p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: breeder.color }}
                        />
                        {breeder.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
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
        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            🍅 Paradicsom fajtakísérlet - 2025 © Minden jog fenntartva
          </p>
        </div>
      </div>
    </div>
  );
}
