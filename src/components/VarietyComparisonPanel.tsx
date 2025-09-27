'use client';

import React from 'react';
import { ProcessedData } from '@/utils/dataProcessor';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  MapPin,
  Zap,
  Activity
} from 'lucide-react';

interface HoverDataType {
  variety: string;
  location: string;
  value: number;
  seriesColor: string;
  allLocationData: Array<{ location: string; value: number }>;
}

interface VarietyComparisonPanelProps {
  selectedVariety: string;
  hoverData: HoverDataType | null;
  allVarieties: ProcessedData[];
  breederColor: string;
  isDecayData?: boolean; // Ha true, akkor fordított logika (alacsonyabb = jobb)
}

const VarietyComparisonPanel: React.FC<VarietyComparisonPanelProps> = ({
  selectedVariety,
  hoverData,
  allVarieties,
  breederColor,
  isDecayData = false
}) => {

  // Find the selected variety data
  const varietyData = allVarieties.find(v => v.variety === selectedVariety);
  if (!varietyData) return null;

  // Calculate statistics
  const locations = ['M-I', 'M-II', 'Cs-I', 'Cs-II', 'L-I', 'L-II'];
  const values = locations.map(loc => varietyData.locations[loc as keyof typeof varietyData.locations]);
  const nonZeroValues = values.filter(v => v > 0);

  // Calculate vine retention (fruit growth until 2nd harvest)
  const vineRetention = (() => {
    const firstHarvests = [varietyData.locations['M-I'], varietyData.locations['Cs-I'], varietyData.locations['L-I']];
    const secondHarvests = [varietyData.locations['M-II'], varietyData.locations['Cs-II'], varietyData.locations['L-II']];

    let totalDifference = 0;
    let locationCount = 0;

    for (let i = 0; i < 3; i++) {
      if (firstHarvests[i] > 0 && secondHarvests[i] > 0) {
        totalDifference += (secondHarvests[i] - firstHarvests[i]);
        locationCount++;
      }
    }

    return locationCount > 0 ? totalDifference / locationCount : 0;
  })();

  const stats = {
    average: nonZeroValues.length > 0 ? nonZeroValues.reduce((sum, val) => sum + val, 0) / nonZeroValues.length : 0,
    max: Math.max(...values),
    min: Math.min(...nonZeroValues),
    activeLocations: nonZeroValues.length,
    vineRetention: vineRetention
  };

  // Compare with other varieties
  const otherVarieties = allVarieties.filter(v => v.variety !== selectedVariety);
  const allAverages = allVarieties.map(v => {
    const vals = locations.map(loc => v.locations[loc as keyof typeof v.locations]).filter(val => val > 0);
    return vals.length > 0 ? vals.reduce((sum, val) => sum + val, 0) / vals.length : 0;
  });

  const ranking = allAverages.sort((a, b) => isDecayData ? a - b : b - a).indexOf(stats.average) + 1;

  // Calculate vine retention for all varieties and rank them
  const allVineRetentions = allVarieties.map(v => {
    const firstHarvests = [v.locations['M-I'], v.locations['Cs-I'], v.locations['L-I']];
    const secondHarvests = [v.locations['M-II'], v.locations['Cs-II'], v.locations['L-II']];

    let totalDifference = 0;
    let locationCount = 0;

    for (let i = 0; i < 3; i++) {
      if (firstHarvests[i] > 0 && secondHarvests[i] > 0) {
        totalDifference += (secondHarvests[i] - firstHarvests[i]);
        locationCount++;
      }
    }

    return locationCount > 0 ? totalDifference / locationCount : 0;
  });



  // Calculate vine retention percentage relative to maximum value
  const maxVineRetention = Math.max(...allVineRetentions);
  const minVineRetention = Math.min(...allVineRetentions);

  const vineRetentionPercentage = isDecayData
    ? // Romló bogyó adatok esetén: minél kisebb az érték, annál jobb
      maxVineRetention !== minVineRetention
        ? ((maxVineRetention - stats.vineRetention) / (maxVineRetention - minVineRetention)) * 100
        : 100
    : // Normál adatok esetén: minél nagyobb az érték, annál jobb
      maxVineRetention > 0
        ? (stats.vineRetention / maxVineRetention) * 100
        : 0;

  // Debug: Log vine retention values for analysis
  console.log('=== TÖVÖN TARTHATÓSÁG/ROMLÁSI TRENDEK DEBUG ===');
  console.log('Kiválasztott fajta:', selectedVariety);
  console.log('Romló bogyó mód:', isDecayData);
  console.log('Kiválasztott fajta értéke:', stats.vineRetention.toFixed(3));
  console.log('Maximum érték:', maxVineRetention.toFixed(3));
  console.log('Minimum érték:', minVineRetention.toFixed(3));
  console.log('Számított százalék:', vineRetentionPercentage.toFixed(1) + '%');
  console.log('Kategória:',
    vineRetentionPercentage > 66 ? 'JÓ' :
    vineRetentionPercentage >= 33 ? 'KÖZEPES' : 'GYENGE'
  );
  console.log('================================================');

  // Location names mapping
  const locationNames: { [key: string]: string } = {
    'M-I': 'Mezőberény-I',
    'M-II': 'Mezőberény-II',
    'Cs-I': 'Csabacsűd-I',
    'Cs-II': 'Csabacsűd-II',
    'L-I': 'Lakitelek-I',
    'L-II': 'Lakitelek-II'
  };


  return (
    <div
      className="h-full flex flex-col bg-gray-50 dark:bg-background"
      role="region"
      aria-label={`Fajta elemzés: ${selectedVariety}`}
    >
      {/* Sticky Header - mindig látható */}
      <div className="sticky top-0 z-50 bg-white dark:bg-black border-b border-gray-200 dark:border-border shadow-lg">
        <div className="p-4 sm:p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full ring-2 ring-background"
                style={{ backgroundColor: breederColor }}
              />
              <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                Fajta elemzés: {selectedVariety}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content - csak ez scrollozik */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6">
        <div className="max-w-6xl mx-auto space-y-6">

        {/* Main Statistics Grid */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4"
          role="group"
          aria-label="Fő teljesítmény mutatók"
        >

          <div
            className="bg-white/80 dark:bg-card/50 rounded-lg p-4 border border-gray-200 dark:border-border hover:bg-white dark:hover:bg-card/70 transition-colors shadow-sm"
            role="article"
            aria-label={`Átlag: ${stats.average.toFixed(1)} tonna per hektár`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span className="text-sm font-medium text-gray-600 dark:text-muted-foreground">{isDecayData ? 'Átlagos romló bogyó' : 'Átlagos érett bogyótömeg'}</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.average.toFixed(1)}</div>
            <div className="text-xs text-gray-500 dark:text-muted-foreground">t/ha</div>
          </div>

          <div
            className="bg-white/80 dark:bg-card/50 rounded-lg p-4 border border-gray-200 dark:border-border hover:bg-white dark:hover:bg-card/70 transition-colors shadow-sm"
            role="article"
            aria-label={`Helyezés: ${ranking}. hely`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-yellow-600 dark:text-yellow-400" aria-hidden="true" />
              <span className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Helyezés</span>
            </div>
            <div className="text-2xl font-bold text-foreground">#{ranking}</div>
            <div className="text-xs text-gray-500 dark:text-muted-foreground">{allVarieties.length} fajtából</div>
          </div>

          <div
            className="bg-white/80 dark:bg-card/50 rounded-lg p-4 border border-gray-200 dark:border-border hover:bg-white dark:hover:bg-card/70 transition-colors shadow-sm"
            role="article"
            aria-label={`${isDecayData ? 'Romlás mértéke' : 'Tövön tarthatóság'}: ${stats.vineRetention.toFixed(1)} tonna per hektár különbség`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-600 dark:text-green-400" aria-hidden="true" />
              <span className="text-sm font-medium text-gray-600 dark:text-muted-foreground">{isDecayData ? 'Romlás mértéke' : 'Tövön tarthatóság'}</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.vineRetention >= 0 ? '+' : ''}{stats.vineRetention.toFixed(1)}</div>
            <div className="text-xs text-gray-500 dark:text-muted-foreground">{isDecayData ? 't/ha átlagos változás a II. szedésig' : 't/ha átlagos növekedés a II. szedésig'}</div>
          </div>
        </div>

        {/* Location Performance */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Location Details */}
          <div className="bg-white/90 dark:bg-card/50 rounded-lg p-4 border border-gray-200 dark:border-border shadow-sm">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Helyszín teljesítmény
            </h4>
            <div className="space-y-3">
              {locations.map((location, index) => {
                const value = values[index];
                const isActive = value > 0;
                const isHovered = hoverData?.location === location;

                return (
                  <div
                    key={location}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                      isHovered
                        ? 'bg-primary/20 border border-primary/30'
                        : isActive
                          ? 'bg-gray-100 dark:bg-muted/30 hover:bg-gray-200 dark:hover:bg-muted/50 border border-transparent hover:border-gray-300 dark:hover:border-border'
                          : 'bg-gray-50 dark:bg-muted/10 opacity-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        isActive
                          ? 'bg-green-600 dark:bg-green-400'
                          : 'bg-gray-400 dark:bg-gray-600'
                      }`} />
                      <span className={`font-medium ${isActive ? 'text-foreground' : 'text-gray-500 dark:text-muted-foreground'}`}>
                        {locationNames[location]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${isActive ? 'text-foreground' : 'text-gray-500 dark:text-muted-foreground'}`}>
                        {value.toFixed(1)} t/ha
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comparison with Other Varieties */}
          <div className="bg-white/90 dark:bg-card/50 rounded-lg p-4 border border-gray-200 dark:border-border shadow-sm">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Összehasonlítás
            </h4>
            <div className="space-y-3">
              {otherVarieties.slice(0, 4).map((variety) => {
                const otherValues = locations.map(loc => variety.locations[loc as keyof typeof variety.locations]).filter(v => v > 0);
                const otherAvg = otherValues.length > 0 ? otherValues.reduce((sum, val) => sum + val, 0) / otherValues.length : 0;
                const difference = stats.average - otherAvg;
                const percentDiff = otherAvg > 0 ? (difference / otherAvg) * 100 : 0;

                return (
                  <div key={variety.variety} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-muted/20 hover:bg-gray-100 dark:hover:bg-muted/30 transition-colors border border-transparent hover:border-gray-300 dark:hover:border-border">
                    <span className="font-medium text-foreground">{variety.variety}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-muted-foreground">{otherAvg.toFixed(1)} t/ha</span>
                      <div className={`flex items-center gap-1 text-xs font-medium ${
                        difference > 0
                          ? 'text-green-600 dark:text-green-400'
                          : difference < 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-600 dark:text-muted-foreground'
                      }`}>
                        {difference > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : difference < 0 ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : null}
                        {Math.abs(percentDiff).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Visual Performance Chart */}
        <div className="mt-6 bg-white/90 dark:bg-card/50 rounded-lg p-4 border border-gray-200 dark:border-border shadow-sm">
          <h4 className="font-semibold text-foreground mb-4">Teljesítmény vizualizáció</h4>
          <div className="space-y-4">
            {/* Performance Bar Chart */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-muted-foreground">Helyszínenkénti teljesítmény</span>
                <span className="text-gray-600 dark:text-muted-foreground">Max: {stats.max.toFixed(1)} t/ha</span>
              </div>
              <div className="space-y-2">
                {locations.map((location, index) => {
                  const value = values[index];
                  const percentage = stats.max > 0 ? (value / stats.max) * 100 : 0;
                  // Ensure minimum width for non-zero values so they are always visible
                  const displayWidth = value > 0 ? Math.max(percentage, 15) : percentage;

                  return (
                    <div key={location} className="flex items-center gap-3">
                      <div className="w-20 text-xs text-gray-600 dark:text-muted-foreground">
                        {locationNames[location]}
                      </div>
                      <div className="flex-1 bg-gray-100 dark:bg-muted/30 rounded-full h-6 relative overflow-hidden border border-gray-200 dark:border-border">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-green-500 dark:from-blue-400 dark:to-green-400 rounded-full transition-all duration-500"
                          style={{ width: `${displayWidth}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white drop-shadow-sm">
                          {value.toFixed(1)}
                        </div>
                      </div>
                      <div className="w-12 text-xs text-gray-600 dark:text-muted-foreground text-right">
                        {percentage.toFixed(0)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance Radar */}
            <div className="grid lg:grid-cols-2 gap-4 mt-6">
              <div>
                <h5 className="font-medium text-foreground mb-3">Teljesítmény mutatók</h5>
                <div className="space-y-3">
                  {[
                    { label: isDecayData ? 'Átlagos romló bogyótömeg' : 'Átlagos érett bogyótömeg', value: stats.average, max: Math.max(...allAverages), unit: 't/ha' },
                    { label: isDecayData ? 'Romlás mértéke (átlagos változás a II. szedésig)' : 'Tövön tarthatóság (átlagos növekedés a II. szedésig)', value: stats.vineRetention, max: Math.max(...allVineRetentions), unit: 't/ha', allowNegative: true, isDecayMetric: isDecayData }
                  ].map((metric, index) => {
                    let percentage;
                    if (index === 0) {
                      // Átlagos érték (első mutató) - arányos skála: legnagyobb érték = 100%, többi arányosan
                      const maxValue = Math.max(...allAverages);
                      percentage = maxValue > 0
                        ? (stats.average / maxValue) * 100
                        : 100;
                    } else if (index === 1) {
                      // Tövön tarthatóság/Romlás mértéke - arányos skála: legnagyobb érték = 100%, többi arányosan
                      const maxValue = Math.max(...allVineRetentions);
                      percentage = maxValue > 0
                        ? (stats.vineRetention / maxValue) * 100
                        : 100;
                    } else {
                      percentage = Math.min((Math.abs(metric.value) / metric.max) * 100, 100);
                    }
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600 dark:text-muted-foreground">{metric.label}</span>
                          <span className="text-foreground font-medium">
                            {metric.allowNegative && metric.value >= 0 ? '+' : ''}{metric.value.toFixed(1)}{metric.unit}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-muted/30 rounded-full h-2 border border-gray-200 dark:border-border">
                          <div
                            className={`h-2 rounded-full transition-all duration-700 ${
                              metric.allowNegative && metric.value < 0
                                ? 'bg-red-500 dark:bg-red-400'
                                : 'bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 dark:from-red-400 dark:via-yellow-400 dark:to-green-400'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h5 className="font-medium text-foreground mb-3">Összehasonlító elemzés</h5>
                <div className="space-y-2">
                  {allVarieties.map((variety) => {
                    const varietyValues = locations.map(loc => variety.locations[loc as keyof typeof variety.locations]).filter(v => v > 0);
                    const varietyAvg = varietyValues.length > 0 ? varietyValues.reduce((sum, val) => sum + val, 0) / varietyValues.length : 0;
                    const isSelected = variety.variety === selectedVariety;
                    const percentage = Math.max(...allAverages) > 0 ? (varietyAvg / Math.max(...allAverages)) * 100 : 0;

                    return (
                      <div key={variety.variety} className={`flex items-center gap-2 p-2 rounded border transition-colors ${
                        isSelected
                          ? 'bg-primary/20 border-primary/30'
                          : 'bg-gray-50 dark:bg-muted/20 border-transparent hover:border-gray-300 dark:hover:border-border'
                      }`}>
                        <div className="w-16 text-xs text-gray-600 dark:text-muted-foreground truncate">
                          {variety.variety}
                        </div>
                        <div className="flex-1 bg-gray-100 dark:bg-muted/30 rounded-full h-3 border border-gray-200 dark:border-border">
                          <div
                            className="h-3 bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="w-12 text-xs text-foreground text-right">
                          {varietyAvg.toFixed(1)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white/90 dark:bg-card/50 rounded-lg p-4 border border-gray-200 dark:border-border shadow-sm">
          <h4 className="font-semibold text-foreground mb-3">Teljesítmény értékelés</h4>
          <div className="grid lg:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-foreground">Erősségek:</span>
              <ul className="mt-1 text-gray-600 dark:text-muted-foreground">
                {(isDecayData ? stats.average === Math.min(...allAverages) : stats.max === Math.max(...allAverages)) && <li>• Legjobb teljesítmény</li>}
                {vineRetentionPercentage > 66 && <li>• {isDecayData ? 'Jó romlási trendek' : 'Jó tövön tarthatóság'}</li>}
                {vineRetentionPercentage >= 33 && vineRetentionPercentage <= 66 && <li>• {isDecayData ? 'Közepes romlási trendek' : 'Közepes tövön tarthatóság'}</li>}
                {ranking <= Math.ceil(allVarieties.length / 4) && <li>• Átlagosnál jobb {isDecayData ? 'romló bogyó' : 'termés'} eredmény</li>}
              </ul>
            </div>
            <div>
              <span className="font-medium text-foreground">Fejlesztési területek:</span>
              <ul className="mt-1 text-gray-600 dark:text-muted-foreground">
                {vineRetentionPercentage < 33 && <li>• {isDecayData ? 'Gyenge romlási trendek' : 'Gyenge tövön tarthatóság'}</li>}
                {ranking > allAverages.length / 2 && <li>• Átlagosnál rosszabb {isDecayData ? 'romló bogyó' : 'termés'} eredmény</li>}
                {stats.min === 0 && <li>• Hiányzó helyszín adatok</li>}
              </ul>
            </div>
            <div>
              <span className="font-medium text-foreground">Ajánlás:</span>
              <p className="mt-1 text-gray-600 dark:text-muted-foreground">
                {isDecayData
                  ? (stats.average < Math.min(...allAverages) * 1.2
                      ? "Kiváló választás további termesztésre. Alacsony romló bogyó mennyiségű és megbízható fajta."
                      : vineRetentionPercentage > 66
                        ? "Jó romlási trendekkel rendelkező fajta közepes romló bogyó értékekkel. Megfontolható választás."
                        : vineRetentionPercentage >= 33
                          ? "Közepes romlási trendekkel rendelkező fajta. További megfigyelés szükséges."
                          : "Gyenge romlási trendek. További fejlesztés és optimalizálás szükséges."
                    )
                  : (stats.average > Math.max(...allAverages) * 0.8
                      ? "Kiváló választás további termesztésre. Magas hozamú és megbízható fajta."
                      : vineRetentionPercentage > 66
                        ? "Jó tövön tarthatóságú fajta közepes teljesítménnyel. Megfontolandó választás."
                        : vineRetentionPercentage >= 33
                          ? "Közepes tövön tarthatóságú fajta. További megfigyelés szükséges."
                          : "Gyenge tövön tarthatóság. További fejlesztés és optimalizálás szükséges."
                    )
                }
              </p>
            </div>
          </div>
        </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default VarietyComparisonPanel;
