'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BreederCard from "@/components/BreederCard";
import DashboardShell from "@/components/DashboardShell";
import PendingDataNotice from "@/components/PendingDataNotice";
import {
  processBrixData,
  groupDataByBreeder,
  getBreeders,
  getL50Breeder,
  isMeasuredValue,
  loadBrixL50Data,
  processBrixL50DataForChart,
  getHarvestPeriod
} from "@/utils/dataProcessor";
import { useAuth } from "@/contexts/AuthContext";
import { useSeason } from "@/contexts/SeasonContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function BrixDiagram() {
  const { isAuthenticated, accessLevel, logout } = useAuth();
  const { year } = useSeason();
  const { t } = useLanguage();
  const router = useRouter();

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


  // Egy nemesítőház kísérletei: a 2 és 4 soros, alatta külön a Lakitelek 50 töves
  const getExperimentsForBreeder = (breederName: string) => {
    // Az L50 táblában a nemesítőház más néven szerepelhet (pl. WALLER + Heinz -> Prestomech + Heinz)
    const l50Name = getL50Breeder(breederName);

    return [
      {
        data: brixGrouped[breederName] ?? [],
        isL50: false,
        title: breederName,
        experiment: t.breederCard.experiments.base
      },
      {
        data: brixL50Grouped[l50Name] ?? [],
        isL50: true,
        title: l50Name,
        experiment: t.breederCard.experiments.l50
      }
    ].filter(entry => entry.data.length > 0);
  };

  const filteredBreeders = getBreeders(year, accessLevel);

  // A vezérlősávba kerülő rövid mérési információ
  const period = getHarvestPeriod(year, accessLevel);
  const harvestInfo = period ? t.harvest.period(period.first, period.last) : t.harvest.brixFallback;
  const visibleBreeders = filteredBreeders.map(breeder => breeder.name).join(', ') || '–';

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <DashboardShell
      subtitle={t.brix.subtitle}
      info={harvestInfo}
      visibleBreeders={accessLevel !== 'total' ? visibleBreeders : undefined}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">{t.brix.heading}</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-muted-foreground">
            {t.brix.description}
          </p>
        </div>

        {!hasBrixMeasurements ? (
          <PendingDataNotice
            title={t.brix.pendingTitle(year)}
            description={t.brix.pendingDescription}
          />
        ) : (
          <div className="space-y-6">
            {filteredBreeders.flatMap(breeder => getExperimentsForBreeder(breeder.name).map(breederData => {
              // Az 50 töves chart is a nemesítőház saját színét kapja
              const color = breeder.color;
              return (
                <BreederCard
                  key={`brix-${breeder.name}-${breederData.isL50 ? 'l50' : 'base'}`}
                  title={breederData.title}
                  color={color}
                  metric="Brix %"
                  kind="brix"
                  experiment={breederData.experiment}
                  varieties={breederData.data}
                  allVarietiesData={breederData.isL50 ? [...brixData, ...brixL50Processed] : brixData}
                  showOnlyLakitelek={breederData.isL50}
                  expandable={false}
                />
              );
            }))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
