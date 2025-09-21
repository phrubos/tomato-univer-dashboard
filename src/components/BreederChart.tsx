'use client';

import React, { useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { ProcessedData } from '@/utils/dataProcessor';

interface BreederChartProps {
  title: string;
  varieties: ProcessedData[];
  breederColor: string;
  breederName: string;
  allVarietiesData?: ProcessedData[]; // Az összes fajta adatai a tooltip-hez
}

const BreederChart: React.FC<BreederChartProps> = ({
  title,
  varieties,
  breederColor,
  breederName,
  allVarietiesData = []
}) => {
  const chartRef = React.useRef<HTMLDivElement>(null);

  // Modulok betöltése komponens betöltéskor (egyszerűsített)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Egyszerűen beállítjuk a Highcharts alapbeállításokat
      // Az export funkciók automatikusan működnek
      console.log('Highcharts initialized with export support');
    }
  }, []);
  // Színárnyalatok generálása a fajtákhoz
  const generateColorShades = (baseColor: string, count: number): string[] => {
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      // Ha WALLER fajtáról van szó, akkor zöld színt használunk
      if (varieties[i]?.variety === 'WALLER') {
        colors.push('#16a34a'); // Zöld szín a WALLER fajtának
      } else {
        const factor = 0.3 + (i * 0.7) / Math.max(count - 1, 1);
        colors.push(adjustColorBrightness(baseColor, factor));
      }
    }
    return colors;
  };

  const adjustColorBrightness = (hex: string, factor: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const R = Math.round((num >> 16) * factor);
    const G = Math.round(((num >> 8) & 0x00FF) * factor);
    const B = Math.round((num & 0x0000FF) * factor);
    return '#' + ((R << 16) | (G << 8) | B).toString(16).padStart(6, '0');
  };

  const colors = generateColorShades(breederColor, varieties.length);

  // Adatok előkészítése Highcharts számára
  const categories = ['M-I', 'M-II', 'Cs-I', 'Cs-II', 'L-I', 'L-II'];
  
  const series = varieties.map((variety, index) => ({
    type: 'column' as const,
    name: variety.variety,
    data: categories.map(location =>
      variety.locations[location as keyof typeof variety.locations]
    ),
    color: colors[index]
  }));

  const options: Highcharts.Options = {
    chart: {
      type: 'column',
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'var(--font-geist-sans)'
      }
    },
    title: {
      text: `${breederName}`,
      style: {
        color: '#ffffff',
        fontSize: '18px',
        fontWeight: '600'
      }
    },
    subtitle: {
      text: title,
      style: {
        color: '#a1a1aa',
        fontSize: '14px'
      }
    },
    xAxis: {
      categories: categories,
      labels: {
        style: {
          color: '#a1a1aa'
        }
      },
      lineColor: '#3f3f46',
      tickColor: '#3f3f46',
      crosshair: {
        width: 1,
        color: 'rgba(255, 255, 255, 0.3)',
        dashStyle: 'Solid' as const
      },
      plotBands: [
        {
          from: -0.5,
          to: 1.5,
          color: 'rgba(255, 255, 255, 0.02)',
          label: {
            text: 'Mezőberény',
            style: {
              color: '#6b7280',
              fontSize: '12px'
            },
            align: 'center'
          }
        },
        {
          from: 1.5,
          to: 3.5,
          color: 'rgba(255, 255, 255, 0.05)',
          label: {
            text: 'Csabacsűd',
            style: {
              color: '#6b7280',
              fontSize: '12px'
            },
            align: 'center'
          }
        },
        {
          from: 3.5,
          to: 5.5,
          color: 'rgba(255, 255, 255, 0.02)',
          label: {
            text: 'Lakitelek',
            style: {
              color: '#6b7280',
              fontSize: '12px'
            },
            align: 'center'
          }
        }
      ]
    },
    yAxis: {
      title: {
        text: 't/ha',
        style: {
          color: '#a1a1aa'
        }
      },
      labels: {
        style: {
          color: '#a1a1aa'
        }
      },
      gridLineColor: '#3f3f46'
    },
    legend: {
      enabled: true,
      itemStyle: {
        color: '#a1a1aa'
      },
      itemHoverStyle: {
        color: '#ffffff'
      }
    },
    plotOptions: {
      column: {
        borderWidth: 0,
        borderRadius: 3,
        groupPadding: 0.1,
        pointPadding: 0.05,
        dataLabels: {
          enabled: false
        },
        states: {
          hover: {
            brightness: 0.2,
            borderColor: '#ffffff',
            borderWidth: 2
          },
          inactive: {
            opacity: 0.3
          }
        },
        cursor: 'pointer',
        point: {
          events: {
            mouseOver: function() {
              const chart = this.series.chart;
              const point = this;
              const varietyName = point.series.name;

              // Kiemeljük az összes ugyanolyan fajta oszlopot
              chart.series.forEach((series: any) => {
                if (series.name === varietyName) {
                  // Kiemeljük az aktív fajta oszlopait
                  series.points.forEach((p: any) => {
                    p.update({
                      color: Highcharts.color(series.color).brighten(0.2).get(),
                      borderColor: '#ffffff',
                      borderWidth: 2
                    }, false);
                  });
                  series.update({
                    opacity: 1
                  }, false);
                } else {
                  // Elhalványítjuk a többi fajtát
                  series.update({
                    opacity: 0.3
                  }, false);
                  series.points.forEach((p: any) => {
                    p.update({
                      opacity: 0.3
                    }, false);
                  });
                }
              });

              chart.redraw();
            },
            mouseOut: function() {
              const chart = this.series.chart;

              // Visszaállítjuk az eredeti állapotot
              chart.series.forEach((series: any) => {
                series.update({
                  opacity: 1
                }, false);
                series.points.forEach((p: any) => {
                  p.update({
                    color: series.color,
                    borderColor: undefined,
                    borderWidth: 0,
                    opacity: 1
                  }, false);
                });
              });

              chart.redraw();
            }
          }
        },
        stickyTracking: true
      },
      series: {
        states: {
          hover: {
            enabled: true
          },
          inactive: {
            opacity: 0.3
          }
        }
      }
    },
    series: series,
    credits: {
      enabled: false
    },
    exporting: {
      enabled: true,
      buttons: {
        contextButton: {
          enabled: true,
          theme: {
            fill: 'rgba(55, 65, 81, 0.9)',
            stroke: '#ffffff',
            r: 4,
            states: {
              hover: {
                fill: 'rgba(75, 85, 99, 0.95)',
                stroke: '#ffffff'
              },
              select: {
                fill: 'rgba(107, 114, 128, 0.95)',
                stroke: '#ffffff'
              }
            }
          } as any,
          menuItems: [
            'viewFullscreen',
            'separator',
            'downloadPNG',
            'downloadJPEG',
            'downloadSVG'
          ],
          x: -10,
          y: 10
        }
      }
    },
    navigation: {
      buttonOptions: {
        enabled: true
      }
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#374151',
      borderRadius: 8,
      style: {
        color: '#ffffff',
        fontSize: '12px'
      },
      useHTML: true,
      positioner: function(this: any, labelWidth: number, labelHeight: number, point: any) {
        const chart = this.chart;
        const plotLeft = chart.plotLeft;
        const plotTop = chart.plotTop;
        const plotHeight = chart.plotHeight;

        // Konténer határok lekérdezése
        const chartContainer = chart.container.parentElement;
        const containerRect = chartContainer.getBoundingClientRect();
        const containerHeight = containerRect.height;

        // Tooltip a diagram bal oldalán jelenik meg - még balabbra
        let x = plotLeft - labelWidth - 45; // Diagram bal szélétől 30px-re balra (nagyobb távolság)
        let y = plotTop + (plotHeight / 2) - (labelHeight / 2); // Középen függőlegesen

        // Biztosítjuk, hogy a tooltip ne menjen ki a konténerből
        x = Math.max(5, x); // Legalább 5px-re a bal széltől
        y = Math.max(5, Math.min(y, containerHeight - labelHeight - 5)); // Fentről/lentről ne lógjon ki

        return { x, y };
      },
      formatter: function(this: any) {
        const point = this.point;
        const series = this.series;
        const chart = this.series.chart;

        // Megkeressük az összes ugyanolyan fajta adatait
        let varietyData: any[] = [];
        let totalValue = 0;
        let validCount = 0;

        chart.series.forEach((s: any) => {
          if (s.name === series.name) {
            s.points.forEach((p: any) => {
              if (p.y !== null && p.y !== undefined && p.y > 0) {
                varietyData.push({
                  location: p.category,
                  value: p.y,
                  seriesName: s.name,
                  color: s.color
                });
                totalValue += p.y;
                validCount++;
              }
            });
          }
        });

        // Átlag számítása
        const averageValue = validCount > 0 ? totalValue / validCount : 0;

        // Tooltip HTML összeállítása - optimális szélesség
        let tooltipHtml = `<div style="width: 120px; max-height: 250px; display: flex; flex-direction: column;">`;

        // Fejléc - nagyobb betűk
        tooltipHtml += `<div style="flex-shrink: 0; font-weight: bold; margin-bottom: 4px; font-size: 12px; color: #ffffff; border-bottom: 1px solid #10b981; padding-bottom: 3px;">${series.name}</div>`;

        // Scroll-ozható tartalom - nagyobb betűk
        tooltipHtml += `<div style="flex: 1; overflow-y: auto; max-height: 150px; margin-bottom: 4px;">`;

        // Összes helyszín adatai - nagyobb betűk
        varietyData.forEach((data, index) => {
          const isCurrentPoint = data.location === point.category;
          const bgColor = isCurrentPoint ? 'rgba(16, 185, 129, 0.15)' : 'transparent';
          const textColor = isCurrentPoint ? '#10b981' : '#d1d5db';
          const valueColor = isCurrentPoint ? '#ffffff' : '#9ca3af';

          tooltipHtml += `<div style="display: flex; align-items: center; margin: 1px 0; padding: 2px 3px; border-radius: 2px; background: ${bgColor}; border-left: 1px solid ${isCurrentPoint ? '#10b981' : 'transparent'};">`;
          tooltipHtml += `<span style="width: 6px; height: 6px; background-color: ${data.color}; display: inline-block; margin-right: 4px; border-radius: 1px; flex-shrink: 0;"></span>`;
          tooltipHtml += `<span style="flex: 1; font-size: 11px; color: ${textColor}; font-weight: ${isCurrentPoint ? '600' : '400'};">${data.location}</span>`;
          tooltipHtml += `<span style="font-weight: bold; color: ${valueColor}; font-size: 11px; margin-left: 3px;">${data.value.toFixed(1)}</span>`;
          tooltipHtml += `</div>`;
        });

        tooltipHtml += `</div>`;

        // Összeg - nagyobb betűk
        tooltipHtml += `<div style="flex-shrink: 0; border-top: 1px solid rgba(255, 255, 255, 0.2); padding: 3px; background: rgba(16, 185, 129, 0.1); border-radius: 2px;">`;
        tooltipHtml += `<div style="display: flex; align-items: center; justify-content: space-between; font-weight: bold;">`;
        tooltipHtml += `<span style="font-size: 10px; color: #ffffff;">Átlag:</span>`;
        tooltipHtml += `<span style="font-size: 12px; color: #10b981; background: rgba(255, 255, 255, 0.1); padding: 1px 3px; border-radius: 2px;">${averageValue.toFixed(1)}</span>`;
        tooltipHtml += `</div>`;
        tooltipHtml += `</div>`;

        tooltipHtml += `</div>`;

        return tooltipHtml;
      }
    }
  };

  return (
    <div className="w-full h-96 relative">
      <button
        onClick={() => {
          if (chartRef.current) {
            if (chartRef.current.requestFullscreen) {
              chartRef.current.requestFullscreen();
            } else if ((chartRef.current as any).webkitRequestFullscreen) {
              (chartRef.current as any).webkitRequestFullscreen();
            } else if ((chartRef.current as any).mozRequestFullScreen) {
              (chartRef.current as any).mozRequestFullScreen();
            } else if ((chartRef.current as any).msRequestFullscreen) {
              (chartRef.current as any).msRequestFullscreen();
            }
          }
        }}
        className="absolute top-2 right-2 z-10 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-md transition-colors duration-200 shadow-lg"
        title="Teljes képernyő"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
      </button>
      <div ref={chartRef} className="w-full h-96">
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
        />
      </div>
    </div>
  );
};

export default BreederChart;
