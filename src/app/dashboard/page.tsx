'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BreederCard from "@/components/BreederCard";
import DashboardShell from "@/components/DashboardShell";
import {
  processChartData,
  groupDataByBreeder,
  getBreeders,
  getL50Breeder,
  loadL50Data,
  processL50DataForChart,
  getHarvestPeriod
} from "@/utils/dataProcessor";
import { useAuth } from "@/contexts/AuthContext";
import { useSeason } from "@/contexts/SeasonContext";

export default function Dashboard() {
  const { isAuthenticated, accessLevel, logout } = useAuth();
  const { year } = useSeason();
  const router = useRouter();

  // Adatok feldolgozása a kiválasztott szezonra
  const erettData = processChartData('érett', year);
  const romloData = processChartData('romló', year);

  const erettGrouped = groupDataByBreeder(erettData);
  const romloGrouped = groupDataByBreeder(romloData);

  // L50 adatok – a seasons.json-ból, szinkron módon
  const l50Data = loadL50Data(year);
  const l50ErettData = processL50DataForChart(l50Data, 'érett');
  const l50RomloData = processL50DataForChart(l50Data, 'romló');

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


  // Egy nemesítőház kísérletei: a 2 és 4 soros, alatta külön a Lakitelek 50 töves
  const getExperimentsForBreeder = (breederName: string, chartType: 'érett' | 'romló') => {
    // Az L50 táblában a nemesítőház más néven szerepelhet (pl. WALLER + Heinz -> Prestomech + Heinz)
    const l50Name = getL50Breeder(breederName);
    const l50Grouped = chartType === 'érett' ? l50ErettGrouped : l50RomloGrouped;

    return [
      {
        data: (chartType === 'érett' ? erettGrouped : romloGrouped)[breederName] ?? [],
        isL50: false,
        title: breederName,
        experiment: '2 és 4 soros kísérletek'
      },
      {
        data: l50Grouped[l50Name] ?? [],
        isL50: true,
        title: l50Name,
        experiment: 'Lakitelek 50 töves kísérlet'
      }
    ].filter(entry => entry.data.length > 0);
  };

  const filteredBreeders = getBreeders(year, accessLevel);

  // A vezérlősávba kerülő rövid szedési információ
  const harvestInfo = getHarvestPeriod(year, 'I. és II. szedés · 8 nap eltéréssel · aug. 14 – szept. 4.');
  const visibleBreeders = filteredBreeders.map(breeder => breeder.name).join(', ') || '–';

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // A két oszlop szerkezete azonos, csak a vizsgált jellemző más
  const renderColumn = (
    chartType: 'érett' | 'romló',
    heading: string,
    description: string,
    baseData: typeof erettData,
    l50Data: typeof l50ErettData
  ) => {
    const cards = filteredBreeders.flatMap(breeder =>
      getExperimentsForBreeder(breeder.name, chartType).map(breederData => ({ breeder, breederData }))
    );

    return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground sm:text-2xl">{heading}</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-6">
        {cards.map(({ breeder, breederData }) => {
          const color = breederData.isL50 ? '#1e40af' : breeder.color;
          return (
            <BreederCard
              key={`${chartType}-${breeder.name}-${breederData.isL50 ? 'l50' : 'base'}`}
              title={breederData.title}
              color={color}
              metric={heading.replace(' (t/ha)', '')}
              experiment={breederData.experiment}
              varieties={breederData.data}
              allVarietiesData={breederData.isL50 ? [...baseData, ...l50Data] : baseData}
              showOnlyLakitelek={breederData.isL50}
            />
          );
        })}
      </div>
    </div>
    );
  };

  return (
    <DashboardShell
      subtitle="Tövön tarthatóság elemzés nemesítőházak szerint"
      info={harvestInfo}
      visibleBreeders={accessLevel !== 'total' ? visibleBreeders : undefined}
      onLogout={handleLogout}
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {renderColumn(
          'érett',
          'Érett bogyó mennyisége (t/ha)',
          'Az ép, érett bogyó mennyisége az I. és II. szedés során',
          erettData,
          l50ErettData
        )}
        {renderColumn(
          'romló',
          'Romló bogyó mennyisége (t/ha)',
          'A romló bogyó mennyisége az I. és II. szedés során',
          romloData,
          l50RomloData
        )}
      </div>
    </DashboardShell>
  );
}
