'use client';

import React, { useEffect, useMemo, useId, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { ProcessedData } from '@/utils/dataProcessor';
import { useTheme } from './ThemeProvider';
import { useChartPanel } from '@/contexts/ChartPanelContext';
import FullScreenChartModal from './FullScreenChartModal';
import { Maximize2 } from 'lucide-react';

interface BreederChartProps {
  title: string;
  varieties: ProcessedData[];
  breederColor: string;
  breederName: string;
  allVarietiesData?: ProcessedData[]; // Az összes fajta adatai a tooltip-hez
}

// Információs panel komponens a BreederChart-hoz
const BreederDataInfoPanel: React.FC<{
  selectedData: any | null;
  hoverData: any | null;
  varieties: ProcessedData[];
  theme: string;
  onClose: () => void;
}> = ({ selectedData, hoverData, varieties, theme, onClose }) => {
  // Ha van hover adat, azt mutatjuk, egyébként a kiválasztott adatot
  const displayData = hoverData || selectedData;

  if (!displayData) {
    return null;
  }

  // Statisztikák számítása (0 értékeket kihagyva)
  const nonZeroValues = displayData.allLocationData.filter((d: any) => d.value > 0).map((d: any) => d.value);
  const avgValue = nonZeroValues.length > 0 ? nonZeroValues.reduce((sum: number, val: number) => sum + val, 0) / nonZeroValues.length : 0;

  // Helyszín nevek mapping
  const locationNames: { [key: string]: string } = {
    'M-I': 'Mezőberény I.',
    'M-II': 'Mezőberény II.',
    'Cs-I': 'Csabacsűd I.',
    'Cs-II': 'Csabacsűd II.',
    'L-I': 'Lakitelek I.',
    'L-II': 'Lakitelek II.'
  };

  return (
    <div className="w-full max-w-sm bg-white/95 dark:bg-card/95 backdrop-blur-sm border border-gray-200 dark:border-border rounded-lg p-4 transition-all duration-300 shadow-lg">
      {/* Fejléc - kompakt + bezárás gomb */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center flex-1 min-w-0">
          <div
            className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
            style={{ backgroundColor: displayData.seriesColor }}
          ></div>
          <h3 className="text-sm font-semibold text-foreground truncate">{displayData.variety}</h3>
        </div>
        <button
          onClick={onClose}
          className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-muted rounded-full transition-colors duration-200 flex-shrink-0"
          title="Bezárás"
        >
          <svg className="w-4 h-4 text-gray-500 dark:text-muted-foreground hover:text-gray-700 dark:hover:text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Helyszín adatok - kompakt lista */}
      <div className="space-y-1 mb-3">
        {displayData.allLocationData.map((data: any, index: number) => {
          if (data.value === 0) return null; // 0 értékeket kihagyjuk

          const isCurrentPoint = data.location === displayData.location;
          return (
            <div
              key={index}
              className={`flex justify-between items-center py-1 px-2 rounded text-xs ${
                isCurrentPoint
                  ? 'bg-primary/20 border border-primary/30 font-medium'
                  : 'bg-gray-100 dark:bg-muted/30'
              }`}
            >
              <span className={isCurrentPoint ? 'text-foreground' : 'text-gray-600 dark:text-muted-foreground'}>
                {locationNames[data.location] || data.location}
              </span>
              <span className={isCurrentPoint ? 'text-foreground font-semibold' : 'text-foreground'}>
                {data.value.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Átlag - csak ha van nem-nulla érték */}
      {avgValue > 0 && (
        <div className="border-t border-gray-200 dark:border-border pt-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600 dark:text-muted-foreground">Átlag:</span>
            <span className="font-semibold text-foreground">{avgValue.toFixed(1)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const BreederChart: React.FC<BreederChartProps> = ({
  title,
  varieties,
  breederColor,
  breederName,
  allVarietiesData = []
}) => {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const { setActiveChart, closePanel, isChartActive, selectedData } = useChartPanel();

  // Egyedi azonosító generálása minden chart példányhoz
  const chartId = useId();

  // Ref a chart példányhoz
  const chartInstanceRef = React.useRef<Highcharts.Chart | null>(null);

  // Hover adat state - lokálisan kezeljük
  const [hoverData, setHoverData] = React.useState<any | null>(null);

  // Full-screen modal state
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);

  // Ref-ek a Highcharts eseménykezelőkhöz
  const setHoverDataRef = React.useRef(setHoverData);
  const isChartActiveRef = React.useRef(isChartActive);
  const chartIdRef = React.useRef(chartId);

  // Ref-ek frissítése
  React.useEffect(() => {
    setHoverDataRef.current = setHoverData;
    isChartActiveRef.current = isChartActive;
    chartIdRef.current = chartId;
  }, [setHoverData, isChartActive, chartId]);

  // Modulok betöltése komponens betöltéskor (egyszerűsített)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Egyszerűen beállítjuk a Highcharts alapbeállításokat
      // Az export funkciók automatikusan működnek
      console.log('Highcharts initialized with export support');
    }
  }, []);

  // Dinamikus színek a téma alapján - külön színek sötét és világos módhoz
  const themeColors = useMemo(() => {
    if (theme === 'dark') {
      // SÖTÉT MÓD - Világos színek sötét háttéren
      return {
        background: 'transparent',
        titleColor: '#f8fafc',           // Tiszta fehér címek
        subtitleColor: '#cbd5e1',        // Világos szürke alcímek
        labelColor: '#94a3b8',           // Közepes világos szürke labelek
        gridLineColor: '#475569',        // Sötét szürke vonalak
        lineColor: '#475569',            // Sötét szürke tengelyek
        crosshairColor: 'rgba(248, 250, 252, 0.4)', // Világos crosshair
        plotBandColor: 'rgba(248, 250, 252, 0.08)',
        plotBandColorAlt: 'rgba(248, 250, 252, 0.15)',
        tooltipBg: 'rgba(15, 23, 42, 0.95)',        // Sötét tooltip háttér
        tooltipBorder: '#475569',                    // Sötét keret
        tooltipText: '#f8fafc',                      // Világos tooltip szöveg
        exportButtonBg: 'rgba(51, 65, 85, 0.9)',
        exportButtonHover: 'rgba(71, 85, 105, 0.95)',
        exportButtonStroke: '#f8fafc'
      };
    } else {
      // VILÁGOS MÓD - Sötét színek világos háttéren
      return {
        background: 'transparent',
        titleColor: '#0f172a',           // Mély sötét címek
        subtitleColor: '#334155',        // Sötét szürke alcímek
        labelColor: '#64748b',           // Közepes sötét szürke labelek
        gridLineColor: '#e2e8f0',        // Világos szürke vonalak
        lineColor: '#e2e8f0',            // Világos szürke tengelyek
        crosshairColor: 'rgba(15, 23, 42, 0.4)',    // Sötét crosshair
        plotBandColor: 'rgba(15, 23, 42, 0.06)',
        plotBandColorAlt: 'rgba(15, 23, 42, 0.12)',
        tooltipBg: 'rgba(255, 255, 255, 0.95)',     // Világos tooltip háttér
        tooltipBorder: '#e2e8f0',                    // Világos keret
        tooltipText: '#0f172a',                      // Sötét tooltip szöveg
        exportButtonBg: 'rgba(248, 250, 252, 0.9)',
        exportButtonHover: 'rgba(226, 232, 240, 0.95)',
        exportButtonStroke: '#0f172a'
      };
    }
  }, [theme]);
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
    color: colors[index],
    events: {
      legendItemClick: function() {
        // Megakadályozzuk az alapértelmezett legend click viselkedést
        return false;
      }
    }
  }));

  const options: Highcharts.Options = {
    chart: {
      type: 'column',
      backgroundColor: themeColors.background,
      style: {
        fontFamily: 'var(--font-geist-sans)'
      },
      animation: false
    },
    title: {
      text: `${breederName}`,
      style: {
        color: themeColors.titleColor,
        fontSize: '18px',
        fontWeight: '600'
      }
    },
    subtitle: {
      text: title,
      style: {
        color: themeColors.subtitleColor,
        fontSize: '14px'
      }
    },
    xAxis: {
      categories: categories,
      labels: {
        style: {
          color: themeColors.labelColor
        }
      },
      lineColor: themeColors.lineColor,
      tickColor: themeColors.lineColor,
      crosshair: {
        width: 1,
        color: themeColors.crosshairColor,
        dashStyle: 'Solid' as const
      },
      plotBands: [
        {
          from: -0.5,
          to: 1.5,
          color: themeColors.plotBandColor,
          label: {
            text: 'Mezőberény',
            style: {
              color: themeColors.labelColor,
              fontSize: '12px'
            },
            align: 'center'
          }
        },
        {
          from: 1.5,
          to: 3.5,
          color: themeColors.plotBandColorAlt,
          label: {
            text: 'Csabacsűd',
            style: {
              color: themeColors.labelColor,
              fontSize: '12px'
            },
            align: 'center'
          }
        },
        {
          from: 3.5,
          to: 5.5,
          color: themeColors.plotBandColor,
          label: {
            text: 'Lakitelek',
            style: {
              color: themeColors.labelColor,
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
          color: themeColors.labelColor
        }
      },
      labels: {
        style: {
          color: themeColors.labelColor
        }
      },
      gridLineColor: themeColors.gridLineColor
    },
    legend: {
      enabled: true,
      useHTML: true,
      itemStyle: {
        color: themeColors.labelColor,
        cursor: 'pointer',
        fontWeight: 'normal',
        textOverflow: 'ellipsis'
      },
      itemHoverStyle: {
        color: '#ffffff',
        fontWeight: 'bold'
      },
      itemHiddenStyle: {
        color: themeColors.gridLineColor
      },
      labelFormatter: function(this: any) {
        return `<span class="legend-item" style="padding: 2px 5px; border-radius: 3px; transition: all 0.2s ease; display: inline-block;">${this.name}</span>`;
      }
    },
    plotOptions: {
      column: {
        animation: false,
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
            borderColor: themeColors.titleColor,
            borderWidth: 2
          },
          inactive: {
            opacity: 0.3
          }
        },
        cursor: 'pointer',
        point: {
          events: {
            click: function(this: Highcharts.Point) {
              const point = this as any;
              const series = point.series;
              const categories = ['M-I', 'M-II', 'Cs-I', 'Cs-II', 'L-I', 'L-II'];

              // Összegyűjtjük az adott fajta összes helyszínének adatait
              const allLocationData = categories.map(location => {
                const locationIndex = categories.indexOf(location);
                const value = series.data[locationIndex] ? series.data[locationIndex].y : 0;
                return {
                  location,
                  value
                };
              });

              // Globális state frissítése
              setActiveChart(chartId, {
                variety: series.name,
                location: point.category,
                value: point.y,
                seriesColor: series.color,
                allLocationData
              });
            },
            mouseOver: function() {
              const chart = this.series.chart;
              const point = this;
              const varietyName = point.series.name;

              // Ha a panel már nyitva van, akkor frissítjük a hover adatokat
              if (isChartActiveRef.current(chartIdRef.current)) {
                const categories = ['M-I', 'M-II', 'Cs-I', 'Cs-II', 'L-I', 'L-II'];
                const series = point.series;
                const allLocationData = categories.map(location => {
                  const locationIndex = categories.indexOf(location);
                  const value = series.data[locationIndex] ? series.data[locationIndex].y : 0;
                  return {
                    location,
                    value: value || 0
                  };
                });

                // Hover adat frissítése
                setHoverDataRef.current({
                  variety: series.name,
                  location: String(point.category || ''),
                  value: Number(point.y || 0),
                  seriesColor: String(series.color || '#000000'),
                  allLocationData
                });
              }

              // Legend highlighting - series.legendItem használata
              const highlightLegend = () => {
                chart.series.forEach((s: any) => {
                  if (s.name === varietyName && s.legendItem) {
                    // Aktív fajta kiemelése
                    if (s.legendItem.css) {
                      s.legendItem.css({
                        'font-weight': 'bold',
                        'fill': '#ffffff',
                        'opacity': 1
                      });
                    }

                    // Kék háttér hozzáadása
                    if (!s.legendItem.highlightRect && s.legendItem.element) {
                      const bbox = s.legendItem.element.getBBox();
                      s.legendItem.highlightRect = chart.renderer.rect(
                        bbox.x - 2,
                        bbox.y - 1,
                        bbox.width + 4,
                        bbox.height + 2,
                        2
                      ).attr({
                        fill: '#007acc',
                        'stroke-width': 0
                      }).add(s.legendItem.element.parentNode);

                      // Háttér mögé tesszük a szöveget
                      if (s.legendItem.element.parentNode) {
                        s.legendItem.element.parentNode.insertBefore(
                          s.legendItem.highlightRect.element,
                          s.legendItem.element
                        );
                      }
                    }
                  } else if (s.legendItem) {
                    // Többi fajta elhalványítása
                    if (s.legendItem.css) {
                      s.legendItem.css({
                        'opacity': 0.5
                      });
                    }
                  }
                });
              };

              // Azonnali próbálkozás
              highlightLegend();

              // Második próbálkozás egy kis késleltetéssel
              setTimeout(highlightLegend, 50);

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

              // Hover adat törlése
              setHoverDataRef.current(null);

              // Legend highlighting visszaállítása
              chart.series.forEach((s: any) => {
                if (s.legendItem) {
                  // Eredeti színek visszaállítása
                  if (s.legendItem.css) {
                    s.legendItem.css({
                      'font-weight': 'normal',
                      'fill': themeColors.labelColor,
                      'opacity': 1
                    });
                  }

                  // Háttér rect eltávolítása
                  if ((s.legendItem as any).highlightRect) {
                    (s.legendItem as any).highlightRect.destroy();
                    delete (s.legendItem as any).highlightRect;
                  }
                }
              });

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
            fill: themeColors.exportButtonBg,
            stroke: themeColors.exportButtonStroke,
            r: 4,
            states: {
              hover: {
                fill: themeColors.exportButtonHover,
                stroke: themeColors.exportButtonStroke
              },
              select: {
                fill: themeColors.exportButtonHover,
                stroke: themeColors.exportButtonStroke
              }
            }
          } as any,
          menuItems: [
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
      enabled: false
    }
  };

  // Ellenőrizzük, hogy ez a chart aktív-e
  const isThisChartActive = isChartActive(chartId);
  const currentSelectedData = isThisChartActive ? selectedData : null;

  return (
    <div className="w-full">
      <div className={`flex gap-4 ${currentSelectedData ? 'flex-col xl:flex-row' : ''}`}>
        <div className={`${currentSelectedData ? 'flex-1 min-w-0' : 'w-full'} h-96 relative transition-all duration-300`}>
          {/* Full-screen button */}
          <button
            onClick={() => setIsFullScreenOpen(true)}
            className="absolute top-2 right-2 z-10 bg-white/80 dark:bg-card/80 hover:bg-white dark:hover:bg-card border border-gray-200 dark:border-border hover:border-primary/50 text-foreground p-2 rounded-lg transition-all duration-200 shadow-lg backdrop-blur-sm"
            title="Teljes képernyős nézet"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          <div ref={chartRef} className="w-full h-96">
            <HighchartsReact
              highcharts={Highcharts}
              options={options}
              callback={(chart: Highcharts.Chart) => {
                chartInstanceRef.current = chart;

                // Legend hover functionality - panel frissítéssel
                setTimeout(() => {
                  chart.series.forEach((series: any) => {
                    if (series.legendItem && series.legendItem.element) {
                      const legendElement = series.legendItem.element;

                      // jQuery-szerű hover, de vanilla JS-sel
                      legendElement.addEventListener('mouseenter', () => {
                        const varietyName = series.name;

                        // Ha a panel már nyitva van, akkor frissítjük a hover adatokat
                        if (isChartActiveRef.current(chartIdRef.current)) {
                          const categories = ['M-I', 'M-II', 'Cs-I', 'Cs-II', 'L-I', 'L-II'];
                          const allLocationData = categories.map(location => {
                            const locationIndex = categories.indexOf(location);
                            const value = series.data[locationIndex] ? series.data[locationIndex].y : 0;
                            return {
                              location,
                              value: value || 0
                            };
                          });

                          // Hover adat frissítése a legend hover alapján
                          setHoverDataRef.current({
                            variety: series.name,
                            location: '', // Üres, mert nem konkrét oszlop
                            value: 0,
                            seriesColor: String(series.color || '#000000'),
                            allLocationData
                          });
                        }

                        // Oszlopok kiemelése
                        chart.series.forEach((s: any) => {
                          if (s.name === varietyName) {
                            s.points.forEach((p: any) => {
                              p.update({
                                color: Highcharts.color(s.color).brighten(0.2).get(),
                                borderColor: '#ffffff',
                                borderWidth: 2
                              }, false);
                            });
                            s.update({ opacity: 1 }, false);
                          } else {
                            s.update({ opacity: 0.3 }, false);
                            s.points.forEach((p: any) => {
                              p.update({ opacity: 0.3 }, false);
                            });
                          }
                        });
                        chart.redraw();
                      });

                      legendElement.addEventListener('mouseleave', () => {
                        // Ha a panel nyitva van, töröljük a hover adatokat
                        if (isChartActiveRef.current(chartIdRef.current)) {
                          setHoverDataRef.current(null);
                        }

                        // Visszaállítás
                        chart.series.forEach((s: any) => {
                          s.update({ opacity: 1 }, false);
                          s.points.forEach((p: any) => {
                            p.update({
                              color: s.color,
                              borderColor: undefined,
                              borderWidth: 0,
                              opacity: 1
                            }, false);
                          });
                        });
                        chart.redraw();
                      });
                    }
                  });
                }, 100);
              }}
            />
          </div>
        </div>
        {currentSelectedData && (
          <div className="xl:flex-shrink-0 xl:w-52">
            <BreederDataInfoPanel
              selectedData={currentSelectedData}
              hoverData={hoverData}
              varieties={varieties}
              theme={theme}
              onClose={closePanel}
            />
          </div>
        )}
      </div>

      {/* Full-screen modal */}
      <FullScreenChartModal
        isOpen={isFullScreenOpen}
        onClose={() => setIsFullScreenOpen(false)}
        title={title}
        varieties={varieties}
        breederColor={breederColor}
        breederName={breederName}
        chartOptions={options}
      />
    </div>
  );
};

export default BreederChart;
