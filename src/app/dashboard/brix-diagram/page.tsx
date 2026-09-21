'use client';

import { useEffect, useState } from 'react';
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

  // A vezérlősávba kerülő rövid mérési információ
  const harvestInfo = year === 2025
    ? 'I. és II. szedés Brix %-a · aug. 14 – szept. 4.'
    : 'I. és II. szedés Brix %-a';
  const visibleBreeders = filteredBreeders.map(breeder => breeder.name).join(', ') || '–';

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <DashboardShell
      subtitle="Brix % elemzés nemesítőházak szerint"
      info={harvestInfo}
      visibleBreeders={accessLevel !== 'total' ? visibleBreeders : undefined}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Brix % értékek</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-muted-foreground">
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
            {filteredBreeders.map(breeder => {
              const breederData = getDataForBreeder(breeder.name);
              if (breederData.data.length === 0) return null;

              const color = breederData.isL50 ? '#1e40af' : breeder.color;
              return (
                <BreederCard
                  key={`brix-${breeder.name}`}
                  title={breederData.title}
                  color={color}
                  metric="Brix %"
                  varieties={breederData.data}
                  allVarietiesData={breederData.isL50 ? [...brixData, ...brixL50Processed] : brixData}
                  showOnlyLakitelek={breederData.isL50}
                  l50={breederData.hasL50Available
                    ? { active: breederData.isL50, onToggle: () => toggleL50(breeder.name) }
                    : undefined}
                  expandable={false}
                />
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
