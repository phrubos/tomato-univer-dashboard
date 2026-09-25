'use client';

import React from 'react';
import {
  getChartCategories,
  getLocationLabel,
  getPairedChanges,
  isMeasuredValue,
  type ProcessedData
} from '@/utils/dataProcessor';
import type { LocationDataPoint } from '@/contexts/ChartPanelContext';
import { useLanguage } from '@/contexts/LanguageContext';
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
  value: number | null;
  seriesColor: string;
  allLocationData: LocationDataPoint[];
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
  const { t } = useLanguage();
  const a = t.analysis;
  const unit = t.common.unitTha;

  // Find the selected variety data
  const varietyData = allVarieties.find(v => v.variety === selectedVariety);
  if (!varietyData) return null;

  // Az átlagolás csak a mért helyszínekre épül (a 0 valódi mérés, a null nem az)
  const average = (numbers: number[]) =>
    numbers.length > 0 ? numbers.reduce((sum, val) => sum + val, 0) / numbers.length : 0;

  // Calculate statistics
  const locations = getChartCategories(allVarieties);
  const measuredValues = locations
    .map(loc => varietyData.locations[loc])
    .filter(isMeasuredValue);

  // Tövön tarthatóság: a párosított I.–II. szedések átlagos különbsége
  const vineRetention = average(getPairedChanges(varietyData));

  const stats = {
    average: average(measuredValues),
    max: measuredValues.length > 0 ? Math.max(...measuredValues) : 0,
    min: measuredValues.length > 0 ? Math.min(...measuredValues) : 0,
    activeLocations: measuredValues.length,
    vineRetention: vineRetention
  };

  // Compare with other varieties
  const otherVarieties = allVarieties.filter(v => v.variety !== selectedVariety);
  const allAverages = allVarieties.map(v =>
    average(locations.map(loc => v.locations[loc]).filter(isMeasuredValue))
  );

  const ranking = allAverages.sort((a, b) => isDecayData ? a - b : b - a).indexOf(stats.average) + 1;

  // Calculate vine retention for all varieties and rank them
  const allVineRetentions = allVarieties.map(v => average(getPairedChanges(v)));

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

  const changeLabel = isDecayData ? a.decayRate : a.fieldStorage;

  const recommendation = isDecayData
    ? (stats.average < Math.min(...allAverages) * 1.2
        ? a.advice.decayExcellent
        : vineRetentionPercentage > 66
          ? a.advice.decayGood
          : vineRetentionPercentage >= 33
            ? a.advice.decayModerate
            : a.advice.decayWeak
      )
    : (stats.average > Math.max(...allAverages) * 0.8
        ? a.advice.ripeExcellent
        : vineRetentionPercentage > 66
          ? a.advice.ripeGood
          : vineRetentionPercentage >= 33
            ? a.advice.ripeModerate
            : a.advice.ripeWeak
      );

  return (
    <div
      className="h-full flex flex-col bg-gray-50 dark:bg-background"
      role="region"
      aria-label={a.title(selectedVariety)}
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
                {a.title(selectedVariety)}
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
          aria-label={a.kpiGroup}
        >

          <div
            className="bg-white/80 dark:bg-card/50 rounded-lg p-4 border border-gray-200 dark:border-border hover:bg-white dark:hover:bg-card/70 transition-colors shadow-sm"
            role="article"
            aria-label={a.meanAria(stats.average.toFixed(1))}
          >
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span className="text-sm font-medium text-gray-600 dark:text-muted-foreground">{isDecayData ? a.meanRotten : a.meanRipe}</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.average.toFixed(1)}</div>
            <div className="text-xs text-gray-500 dark:text-muted-foreground">{unit}</div>
          </div>

          <div
            className="bg-white/80 dark:bg-card/50 rounded-lg p-4 border border-gray-200 dark:border-border hover:bg-white dark:hover:bg-card/70 transition-colors shadow-sm"
            role="article"
            aria-label={a.rankAria(ranking)}
          >
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-yellow-600 dark:text-yellow-400" aria-hidden="true" />
              <span className="text-sm font-medium text-gray-600 dark:text-muted-foreground">{a.rank}</span>
            </div>
            <div className="text-2xl font-bold text-foreground">#{ranking}</div>
            <div className="text-xs text-gray-500 dark:text-muted-foreground">{a.rankOf(allVarieties.length)}</div>
          </div>

          <div
            className="bg-white/80 dark:bg-card/50 rounded-lg p-4 border border-gray-200 dark:border-border hover:bg-white dark:hover:bg-card/70 transition-colors shadow-sm"
            role="article"
            aria-label={a.changeAria(changeLabel, stats.vineRetention.toFixed(1))}
          >
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-600 dark:text-green-400" aria-hidden="true" />
              <span className="text-sm font-medium text-gray-600 dark:text-muted-foreground">{changeLabel}</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.vineRetention >= 0 ? '+' : ''}{stats.vineRetention.toFixed(1)}</div>
            <div className="text-xs text-gray-500 dark:text-muted-foreground">{isDecayData ? a.decayChange : a.ripeChange}</div>
          </div>
        </div>

        {/* Location Performance */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Location Details */}
          <div className="bg-white/90 dark:bg-card/50 rounded-lg p-4 border border-gray-200 dark:border-border shadow-sm">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {a.sitePerformance}
            </h4>
            <div className="space-y-3">
              {locations.map((location) => {
                const value = varietyData.locations[location];
                const status = varietyData.status?.[location] ?? 'available';
                const isActive = status === 'available' && isMeasuredValue(value);
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
                        {getLocationLabel(location, t.sites)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${isActive ? 'text-foreground' : 'italic text-gray-500 dark:text-muted-foreground'}`}>
                        {isActive ? `${(value as number).toFixed(1)} ${unit}` : t.status[status]}
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
              {a.comparison}
            </h4>
            <div className="space-y-3">
              {/* Egyetlen fajtát tartalmazó nézetben (pl. Syngenta) nincs mihez hasonlítani */}
              {otherVarieties.length === 0 && (
                <p className="rounded-lg border border-dashed border-gray-300 p-3 text-sm text-gray-600 dark:border-border dark:text-muted-foreground">
                  {a.noComparison}
                </p>
              )}
              {otherVarieties.slice(0, 4).map((variety) => {
                const otherAvg = average(locations.map(loc => variety.locations[loc]).filter(isMeasuredValue));
                const difference = stats.average - otherAvg;
                const percentDiff = otherAvg > 0 ? (difference / otherAvg) * 100 : 0;

                return (
                  <div key={variety.variety} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-muted/20 hover:bg-gray-100 dark:hover:bg-muted/30 transition-colors border border-transparent hover:border-gray-300 dark:hover:border-border">
                    <span className="font-medium text-foreground">{variety.variety}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-muted-foreground">{otherAvg.toFixed(1)} {unit}</span>
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
          <h4 className="font-semibold text-foreground mb-4">{a.overview}</h4>
          <div className="space-y-4">
            {/* Performance Bar Chart */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-muted-foreground">{a.bySite}</span>
                <span className="text-gray-600 dark:text-muted-foreground">{a.max} {stats.max.toFixed(1)} {unit}</span>
              </div>
              <div className="space-y-2">
                {locations.map((location) => {
                  const raw = varietyData.locations[location];
                  const status = varietyData.status?.[location] ?? 'available';
                  const isMeasured = status === 'available' && isMeasuredValue(raw);
                  const value = isMeasured ? (raw as number) : 0;
                  const percentage = stats.max > 0 ? (value / stats.max) * 100 : 0;
                  // Ensure minimum width for non-zero values so they are always visible
                  const displayWidth = value > 0 ? Math.max(percentage, 15) : percentage;

                  return (
                    <div key={location} className="flex items-center gap-3">
                      <div className="w-20 text-xs text-gray-600 dark:text-muted-foreground">
                        {getLocationLabel(location, t.sites)}
                      </div>
                      <div className={`flex-1 rounded-full h-6 relative overflow-hidden border ${
                        isMeasured
                          ? 'bg-gray-100 dark:bg-muted/30 border-gray-200 dark:border-border'
                          : 'bg-gray-50 dark:bg-muted/10 border-dashed border-gray-300 dark:border-border'
                      }`}>
                        {isMeasured && (
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${displayWidth}%`, backgroundColor: breederColor }}
                          />
                        )}
                        <div className={`absolute inset-0 flex items-center justify-center text-xs font-medium ${
                          isMeasured ? 'text-white drop-shadow-sm' : 'italic text-gray-500 dark:text-muted-foreground'
                        }`}>
                          {isMeasured ? value.toFixed(1) : t.status[status]}
                        </div>
                      </div>
                      <div className="w-12 text-xs text-gray-600 dark:text-muted-foreground text-right">
                        {isMeasured ? `${percentage.toFixed(0)}%` : '–'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance Radar */}
            <div className="grid lg:grid-cols-2 gap-4 mt-6">
              <div>
                <h5 className="font-medium text-foreground mb-3">{a.indicators}</h5>
                <div className="space-y-3">
                  {[
                    { label: isDecayData ? a.meanRottenMass : a.meanRipe, value: stats.average, max: Math.max(...allAverages), unit },
                    { label: isDecayData ? a.decayIndicator : a.retentionIndicator, value: stats.vineRetention, max: Math.max(...allVineRetentions), unit, allowNegative: true, isDecayMetric: isDecayData }
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
                            {metric.allowNegative && metric.value >= 0 ? '+' : ''}{metric.value.toFixed(1)} {metric.unit}
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
                <h5 className="font-medium text-foreground mb-3">{a.comparative}</h5>
                <div className="space-y-2">
                  {allVarieties.map((variety) => {
                    const varietyAvg = average(locations.map(loc => variety.locations[loc]).filter(isMeasuredValue));
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
          <h4 className="font-semibold text-foreground mb-3">{a.assessment}</h4>
          <div className="grid lg:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-foreground">{a.strengths}</span>
              <ul className="mt-1 text-gray-600 dark:text-muted-foreground">
                {(isDecayData ? stats.average === Math.min(...allAverages) : stats.max === Math.max(...allAverages)) && <li>• {a.best}</li>}
                {vineRetentionPercentage > 66 && <li>• {a.good(isDecayData)}</li>}
                {vineRetentionPercentage >= 33 && vineRetentionPercentage <= 66 && <li>• {a.moderate(isDecayData)}</li>}
                {ranking <= Math.ceil(allVarieties.length / 4) && <li>• {a.aboveAverage(isDecayData)}</li>}
              </ul>
            </div>
            <div>
              <span className="font-medium text-foreground">{a.improvements}</span>
              <ul className="mt-1 text-gray-600 dark:text-muted-foreground">
                {vineRetentionPercentage < 33 && <li>• {a.weak(isDecayData)}</li>}
                {ranking > allAverages.length / 2 && <li>• {a.belowAverage(isDecayData)}</li>}
                {stats.min === 0 && <li>• {a.missingSites}</li>}
              </ul>
            </div>
            <div>
              <span className="font-medium text-foreground">{a.recommendation}</span>
              <p className="mt-1 text-gray-600 dark:text-muted-foreground">
                {recommendation}
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
