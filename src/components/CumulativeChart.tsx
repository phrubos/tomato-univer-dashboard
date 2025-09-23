import React, { useEffect, useMemo, useId } from 'react';
import Highcharts from 'highcharts';
import { CumulativeData } from '@/utils/halmozottDataProcessor';
import { useTheme } from './ThemeProvider';

interface CumulativeChartProps {
  varieties: CumulativeData[];
  breederName: string;
  locationName: string;
}

const CumulativeChart: React.FC<CumulativeChartProps> = ({
  varieties,
  breederName,
  locationName
}) => {
  const chartId = useId();
  const containerId = `cumulative-chart-${chartId}`;
  const { theme } = useTheme();

  // Theme colors matching BreederChart
  const themeColors = useMemo(() => {
    if (theme === 'dark') {
      return {
        background: 'transparent',
        titleColor: '#f8fafc',
        subtitleColor: '#94a3b8',
        labelColor: '#cbd5e1',
        lineColor: '#334155',
        gridColor: '#1e293b',
        tooltipBg: 'rgba(30, 41, 59, 0.95)',
        tooltipBorder: '#475569',
        tooltipText: '#f8fafc'
      };
    } else {
      return {
        background: 'transparent',
        titleColor: '#0f172a',
        subtitleColor: '#64748b',
        labelColor: '#475569',
        lineColor: '#e2e8f0',
        gridColor: '#f1f5f9',
        tooltipBg: 'rgba(255, 255, 255, 0.95)',
        tooltipBorder: '#e2e8f0',
        tooltipText: '#0f172a'
      };
    }
  }, [theme]);

  const chartOptions = useMemo(() => {
    // Sort varieties by variety name for consistent display
    const sortedVarieties = [...varieties].sort((a, b) => a.variety.localeCompare(b.variety));

    const categories = sortedVarieties.map(v => v.variety);

    const erettData = sortedVarieties.map(v => v.érett || 0);
    const sargaData = sortedVarieties.map(v => v.sárga || 0);
    const zoldData = sortedVarieties.map(v => v.zöld || 0);
    const romloData = sortedVarieties.map(v => v.romló || 0);


    return {
      chart: {
        type: 'bar',
        backgroundColor: themeColors.background,
        height: Math.max(400, categories.length * 25 + 150),
        style: {
          fontFamily: 'var(--font-geist-sans)'
        },
        animation: false
      },
      title: {
        text: `${locationName}`,
        style: {
          fontSize: '18px',
          fontWeight: '600',
          color: themeColors.titleColor
        }
      },
      subtitle: {
        text: `${breederName} - ${varieties.length} fajta`,
        style: {
          fontSize: '14px',
          color: themeColors.subtitleColor
        }
      },
      xAxis: {
        categories: categories,
        title: {
          text: null
        },
        labels: {
          style: {
            fontSize: '12px',
            color: themeColors.labelColor
          }
        },
        lineColor: themeColors.lineColor,
        tickColor: themeColors.lineColor
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Termés mennyisége (t/ha)',
          style: {
            fontSize: '12px',
            color: themeColors.titleColor,
            fontWeight: '500'
          }
        },
        labels: {
          style: {
            fontSize: '11px',
            color: themeColors.labelColor
          }
        },
        gridLineColor: themeColors.gridColor,
        lineColor: themeColors.lineColor
      },
      legend: {
        reversed: true,
        align: 'center' as const,
        verticalAlign: 'bottom' as const,
        itemStyle: {
          fontSize: '12px',
          fontWeight: '500',
          color: themeColors.labelColor
        },
        itemHoverStyle: {
          color: themeColors.titleColor
        },
        symbolHeight: 12,
        symbolWidth: 12,
        symbolRadius: 2
      },
      plotOptions: {
        series: {
          stacking: 'normal' as const,
          borderWidth: 0,
          pointPadding: 0.1,
          groupPadding: 0.1,
          borderRadius: 2
        },
        bar: {
          dataLabels: {
            enabled: false
          }
        }
      },
      series: [
        {
          type: 'bar' as const,
          name: 'Romló',
          data: romloData,
          color: '#6B7280'
        },
        {
          type: 'bar' as const,
          name: 'Zöld',
          data: zoldData,
          color: '#10B981'
        },
        {
          type: 'bar' as const,
          name: 'Sárga',
          data: sargaData,
          color: '#F59E0B'
        },
        {
          type: 'bar' as const,
          name: 'Érett',
          data: erettData,
          color: '#DC2626'
        }
      ],
      tooltip: {
        shared: true,
        useHTML: true,
        backgroundColor: themeColors.tooltipBg,
        borderColor: themeColors.tooltipBorder,
        borderRadius: 8,
        borderWidth: 1,
        shadow: {
          color: 'rgba(0, 0, 0, 0.1)',
          offsetX: 0,
          offsetY: 2,
          opacity: 0.3,
          width: 4
        },
        style: {
          fontSize: '12px',
          fontFamily: 'var(--font-geist-sans)',
          color: themeColors.tooltipText
        },
        formatter: function() {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const point = (this as any).point || (this as any).points[0].point;
          const variety = sortedVarieties.find(v => v.variety === point.category);

          if (!variety) return '';

          const total = variety.total;

          const textClass = theme === 'dark' ? 'text-slate-100' : 'text-gray-900';
          const borderClass = theme === 'dark' ? 'border-slate-600' : 'border-gray-200';

          return `
            <div class="p-3">
              <div class="font-semibold ${textClass} mb-2">${variety.variety}</div>
              <div class="space-y-1 text-sm">
                <div class="flex justify-between items-center">
                  <span class="flex items-center">
                    <span class="w-3 h-3 bg-red-600 rounded-sm mr-2"></span>
                    Érett:
                  </span>
                  <span class="font-medium">${variety.érett.toFixed(1)} t/ha</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="flex items-center">
                    <span class="w-3 h-3 bg-amber-500 rounded-sm mr-2"></span>
                    Sárga:
                  </span>
                  <span class="font-medium">${variety.sárga.toFixed(1)} t/ha</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="flex items-center">
                    <span class="w-3 h-3 bg-emerald-500 rounded-sm mr-2"></span>
                    Zöld:
                  </span>
                  <span class="font-medium">${variety.zöld.toFixed(1)} t/ha</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="flex items-center">
                    <span class="w-3 h-3 bg-gray-500 rounded-sm mr-2"></span>
                    Romló:
                  </span>
                  <span class="font-medium">${variety.romló.toFixed(1)} t/ha</span>
                </div>
                <div class="border-t ${borderClass} pt-2 mt-2">
                  <div class="flex justify-between items-center font-semibold">
                    <span>Összesen:</span>
                    <span>${total.toFixed(1)} t/ha</span>
                  </div>
                </div>
              </div>
            </div>
          `;
        }
      },
      credits: {
        enabled: false
      },
      accessibility: {
        enabled: false
      }
    };
  }, [varieties, breederName, locationName, themeColors, theme]);

  useEffect(() => {
    if (varieties.length === 0) return;

    const container = document.getElementById(containerId);
    if (!container) return;

    const chart = Highcharts.chart(containerId, chartOptions);

    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  }, [containerId, chartOptions, varieties.length, theme]);

  if (varieties.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">Nincs adat ehhez a nemesítőházhoz</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div id={containerId} className="w-full" />
    </div>
  );
};

export default CumulativeChart;