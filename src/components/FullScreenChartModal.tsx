'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { ProcessedData } from '@/utils/dataProcessor';
import { useTheme } from './ThemeProvider';
import VarietyComparisonPanel from './VarietyComparisonPanel';
import { X } from 'lucide-react';

interface FullScreenChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  varieties: ProcessedData[];
  breederColor: string;
  breederName: string;
  chartOptions: Highcharts.Options;
  colors?: string[]; // Színek a legend gombokhoz
}

const FullScreenChartModal: React.FC<FullScreenChartModalProps> = ({
  isOpen,
  onClose,
  title,
  varieties,
  breederColor,
  breederName,
  chartOptions,
  colors = []
}) => {
  const { theme } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<Highcharts.Chart | null>(null);

  interface HoverDataType {
  variety: string;
  location: string;
  value: number;
  seriesColor: string;
  allLocationData: Array<{ location: string; value: number }>;
}

// Hover data for enhanced information panel
const [hoverData, setHoverData] = useState<HoverDataType | null>(null);

  // Selected variety for persistent highlighting
  const [selectedVariety, setSelectedVariety] = useState<string | null>(null);

  // Legend highlight functions
  const highlightBreed = (breedName: string) => {
    const chart = chartInstanceRef.current;
    if (!chart) return;

    // Theme alapján kiválasztjuk a border színt
    const borderColor = theme === 'dark' ? '#ffffff' : '#000000';

    chart.series.forEach((series: any) => {
      if (series && series.name === breedName) {
        // Kiemeljük az aktív fajta oszlopait
        if (series.points) {
          series.points.forEach((p: any) => {
            if (p && p.update && typeof p.update === 'function') {
              p.update({
                color: series.color ? Highcharts.color(series.color).brighten(0.2).get() : '#007acc',
                borderColor: borderColor,
                borderWidth: 2
              }, false);
            }
          });
        }
        if (series.update && typeof series.update === 'function') {
          series.update({
            opacity: 1
          }, false);
        }
      } else if (series) {
        // Elhalványítjuk a többi fajtát
        if (series.update && typeof series.update === 'function') {
          series.update({
            opacity: 0.6
          }, false);
        }
        if (series.points) {
          series.points.forEach((p: any) => {
            if (p && p.update && typeof p.update === 'function') {
              p.update({
                opacity: 0.6
              }, false);
            }
          });
        }
      }
    });
    chart.redraw();
  };

  const resetHighlight = () => {
    const chart = chartInstanceRef.current;
    if (!chart) return;

    chart.series.forEach((series: any) => {
      if (series && series.update && typeof series.update === 'function') {
        series.update({
          opacity: 1
        }, false);
      }
      if (series && series.points) {
        series.points.forEach((p: any) => {
          if (p && p.update && typeof p.update === 'function') {
            p.update({
              color: series.color || '#007acc',
              borderColor: undefined,
              borderWidth: 0,
              opacity: 1
            }, false);
          }
        });
      }
    });
    chart.redraw();
  };

  const handleLegendClick = (breedName: string) => {
    if (selectedVariety === breedName) {
      // Ha ugyanarra kattintunk újra, visszaállítjuk
      setSelectedVariety(null);
      resetHighlight();
      setHoverData(null); // Panel bezárása
    } else {
      // Új fajta kiválasztása
      // Először visszaállítjuk mindent eredeti állapotba
      resetHighlight();

      // Majd beállítjuk az új kiválasztást
      setSelectedVariety(breedName);
      highlightBreed(breedName);

      // Panel megnyitása az első helyszín adataival
      const categories = ['M-I', 'M-II', 'Cs-I', 'Cs-II', 'L-I', 'L-II'];
      const selectedVarietyData = varieties.find(v => v.variety === breedName);

      if (selectedVarietyData) {
        // Az első helyszín adatait használjuk (M-I)
        const firstLocation = categories[0];
        const firstLocationValue = selectedVarietyData.locations[firstLocation as keyof typeof selectedVarietyData.locations];

        // Összegyűjtjük az összes helyszín adatait
        const allLocationData = categories.map(location => ({
          location,
          value: selectedVarietyData.locations[location as keyof typeof selectedVarietyData.locations] || 0
        }));

        // Megnyitjuk a panelt
        setHoverData({
          variety: breedName,
          location: firstLocation,
          value: firstLocationValue,
          seriesColor: colors[varieties.findIndex(v => v.variety === breedName)] || breederColor,
          allLocationData
        });
      }
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Initialize default hover data when modal opens and reset when closes
  useEffect(() => {
    if (isOpen && varieties.length > 0) {
      const firstVariety = varieties[0];
      const categories = ['M-I', 'M-II', 'Cs-I', 'Cs-II', 'L-I', 'L-II'];
      const firstLocation = categories[0];
      const firstLocationValue = firstVariety.locations[firstLocation as keyof typeof firstVariety.locations];

      // Összegyűjtjük az összes helyszín adatait
      const allLocationData = categories.map(location => ({
        location,
        value: firstVariety.locations[location as keyof typeof firstVariety.locations] || 0
      }));

      // Beállítjuk az alapértelmezett hover adatot
      setHoverData({
        variety: firstVariety.variety,
        location: firstLocation,
        value: firstLocationValue,
        seriesColor: colors[0] || breederColor,
        allLocationData
      });
    } else if (!isOpen) {
      // Modal bezárásakor reseteljük a state-eket
      setHoverData(null);
      setSelectedVariety(null);
    }
  }, [isOpen, varieties, colors, breederColor]);



  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-full h-full bg-gray-50 dark:bg-background flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-border bg-white/90 dark:bg-card/50 backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: breederColor }}
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold text-foreground truncate">{breederName}</h2>
              <p className="text-sm text-gray-600 dark:text-muted-foreground truncate">{title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-muted rounded-lg transition-colors duration-200 text-gray-600 dark:text-muted-foreground hover:text-gray-800 dark:hover:text-foreground"
            title="Bezárás (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area - All scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-0">
            {/* Chart Area - now part of scrollable content */}
            <div className="p-6">
              <div ref={chartRef} className="w-full h-96">
                <HighchartsReact
                  highcharts={Highcharts}
                  callback={(chart: Highcharts.Chart) => {
                    chartInstanceRef.current = chart;
                  }}
                  options={{
                    ...chartOptions,
                    chart: {
                      ...chartOptions.chart,
                      height: 384, // Fixed height for consistent display
                      backgroundColor: 'transparent',
                      events: {
                        mouseLeave: function() {
                          // Clear hover data when mouse leaves the chart area
                          setHoverData(null);
                        }
                      }
                    },
                    title: {
                      ...chartOptions.title,
                      style: {
                        ...chartOptions.title?.style,
                        fontSize: '24px'
                      }
                    },
                    subtitle: {
                      ...chartOptions.subtitle,
                      style: {
                        ...chartOptions.subtitle?.style,
                        fontSize: '16px'
                      }
                    },
                    plotOptions: {
                      ...chartOptions.plotOptions,
                      column: {
                        ...chartOptions.plotOptions?.column,
                        point: {
                          events: {
                            mouseOver: function(this: Highcharts.Point) {
                              const point = this;
                              const series = point.series;
                              const chart = series.chart;
                              const varietyName = series.name;

                              // CSAK a kiemelési logika fut, hover adatok NINCS frissítve
                              if (!selectedVariety && chart && chart.series) {
                                // Theme alapján kiválasztjuk a border színt
                                const borderColor = theme === 'dark' ? '#ffffff' : '#000000';

                                chart.series.forEach((s: any) => {
                                  if (s && s.name === varietyName) {
                                    // Kiemeljük az aktív fajta oszlopait
                                    if (s.points) {
                                      s.points.forEach((p: any) => {
                                        if (p && p.update && typeof p.update === 'function') {
                                          p.update({
                                            color: Highcharts.color(s.color).brighten(0.2).get(),
                                            borderColor: borderColor,
                                            borderWidth: 2
                                          }, false);
                                        }
                                      });
                                    }
                                    if (s.update && typeof s.update === 'function') {
                                      s.update({
                                        opacity: 1
                                      }, false);
                                    }
                                  } else if (s) {
                                    // Elhalványítjuk a többi fajtát
                                    if (s.update && typeof s.update === 'function') {
                                      s.update({
                                        opacity: 0.6
                                      }, false);
                                    }
                                    if (s.points) {
                                      s.points.forEach((p: any) => {
                                        if (p && p.update && typeof p.update === 'function') {
                                          p.update({
                                            opacity: 0.6
                                          }, false);
                                        }
                                      });
                                    }
                                  }
                                });
                                chart.redraw();
                              }
                            },
                            click: function(this: Highcharts.Point) {
                              const point = this;
                              const series = point.series;
                              const chart = series.chart;
                              const clickedBreedName = series.name;
                              const categories = ['M-I', 'M-II', 'Cs-I', 'Cs-II', 'L-I', 'L-II'];

                              // Ha már van kiválasztott fajta, előbb visszaállítjuk mindent
                              if (selectedVariety) {
                                // Minden oszlop visszaállítása eredeti állapotba
                                chart.series.forEach((series: any) => {
                                  if (series && series.update && typeof series.update === 'function') {
                                    series.update({
                                      opacity: 1
                                    }, false);
                                  }
                                  if (series && series.points) {
                                    series.points.forEach((p: any) => {
                                      if (p && p.update && typeof p.update === 'function') {
                                        p.update({
                                          color: series.color,
                                          borderColor: undefined,
                                          borderWidth: 0,
                                          opacity: 1
                                        }, false);
                                      }
                                    });
                                  }
                                });
                                chart.redraw();
                              }

                              // Összegyűjtjük az adott fajta összes helyszínének adatait
                              const allLocationData = categories.map(location => {
                                const locationIndex = categories.indexOf(location);
                                const value = series.data[locationIndex] ? series.data[locationIndex].y : 0;
                                return {
                                  location,
                                  value
                                };
                              });

                              // Beállítjuk a kiválasztott fajtát
                              setSelectedVariety(clickedBreedName);

                              // Kiemeljük a kattintott fajta összes oszlopát
                              if (chart && chart.series) {
                                const borderColor = theme === 'dark' ? '#ffffff' : '#000000';

                                chart.series.forEach((s: any) => {
                                  if (s && s.name === clickedBreedName) {
                                    // Kiemeljük az aktív fajta oszlopait
                                    if (s.points) {
                                      s.points.forEach((p: any) => {
                                        if (p && p.update && typeof p.update === 'function') {
                                          p.update({
                                            color: Highcharts.color(s.color).brighten(0.2).get(),
                                            borderColor: borderColor,
                                            borderWidth: 2
                                          }, false);
                                        }
                                      });
                                    }
                                    if (s.update && typeof s.update === 'function') {
                                      s.update({
                                        opacity: 1
                                      }, false);
                                    }
                                  } else if (s) {
                                    // Elhalványítjuk a többi fajtát
                                    if (s.update && typeof s.update === 'function') {
                                      s.update({
                                        opacity: 0.6
                                      }, false);
                                    }
                                    if (s.points) {
                                      s.points.forEach((p: any) => {
                                        if (p && p.update && typeof p.update === 'function') {
                                          p.update({
                                            opacity: 0.6
                                          }, false);
                                        }
                                      });
                                    }
                                  }
                                });

                                chart.redraw();
                              }

                              // Panel megnyitása a kattintott pont adataival
                              setHoverData({
                                variety: series.name,
                                location: String(point.category || ''),
                                value: point.y || 0,
                                seriesColor: String(series.color || '#000000'),
                                allLocationData: allLocationData.map(item => ({
                                  location: item.location,
                                  value: item.value || 0
                                }))
                              });
                            },
                            mouseOut: function(this: Highcharts.Point) {
                              const chart = this.series.chart;

                              // Ha van kiválasztott fajta, azt megtartjuk, különben visszaállítjuk
                              if (selectedVariety && chart && chart.series) {
                                // Theme alapján kiválasztjuk a border színt
                                const borderColor = theme === 'dark' ? '#ffffff' : '#000000';

                                // Kiválasztott fajta állapotának visszaállítása
                                chart.series.forEach((series: any) => {
                                  if (series && series.name === selectedVariety) {
                                    if (series.points) {
                                      series.points.forEach((p: any) => {
                                        if (p && p.update && typeof p.update === 'function') {
                                          p.update({
                                            color: series.color ? Highcharts.color(series.color).brighten(0.2).get() : '#007acc',
                                            borderColor: borderColor,
                                            borderWidth: 2
                                          }, false);
                                        }
                                      });
                                    }
                                    if (series.update && typeof series.update === 'function') {
                                      series.update({ opacity: 1 }, false);
                                    }
                                  } else if (series) {
                                    if (series.update && typeof series.update === 'function') {
                                      series.update({ opacity: 0.6 }, false);
                                    }
                                    if (series.points) {
                                      series.points.forEach((p: any) => {
                                        if (p && p.update && typeof p.update === 'function') {
                                          p.update({ opacity: 0.6 }, false);
                                        }
                                      });
                                    }
                                  }
                                });
                              } else if (!selectedVariety && chart && chart.series) {
                                // Nincs kiválasztott fajta, mindent visszaállítunk
                                chart.series.forEach((series: any) => {
                                  if (series && series.update && typeof series.update === 'function') {
                                    series.update({
                                      opacity: 1
                                    }, false);
                                  }
                                  if (series && series.points) {
                                    series.points.forEach((p: any) => {
                                      if (p && p.update && typeof p.update === 'function') {
                                        p.update({
                                          color: series.color,
                                          borderColor: undefined,
                                          borderWidth: 0,
                                          opacity: 1
                                        }, false);
                                      }
                                    });
                                  }
                                });
                              }

                              chart.redraw();
                            }
                          }
                        }
                      }
                    },
                    series: chartOptions.series
                  }}
                />
              </div>

              {/* Egyedi Legend - a diagram alatt */}
              <div className="flex flex-wrap gap-2 justify-center px-6">
                {varieties.map((variety, index) => (
                  <button
                    key={variety.variety}
                    onClick={() => handleLegendClick(variety.variety)}
                    className={`flex items-center gap-2 px-3 py-2 rounded transition-all duration-200 ${
                      selectedVariety === variety.variety
                        ? 'bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-600'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: colors[index] || breederColor }}
                    ></div>
                    <span className={`text-sm ${
                      selectedVariety === variety.variety
                        ? 'font-semibold text-blue-800 dark:text-blue-200'
                        : 'text-foreground'
                    }`}>
                      {variety.variety}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Variety Comparison Panel - always visible when there's hoverData */}
            {hoverData && (
              <div className="bg-gray-50 dark:bg-background">
                <VarietyComparisonPanel
                  selectedVariety={hoverData.variety}
                  hoverData={hoverData}
                  allVarieties={varieties}
                  breederColor={breederColor}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render to portal
  return typeof window !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
};

export default FullScreenChartModal;
