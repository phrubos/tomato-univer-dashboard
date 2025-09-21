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
}

const FullScreenChartModal: React.FC<FullScreenChartModalProps> = ({
  isOpen,
  onClose,
  title,
  varieties,
  breederColor,
  breederName,
  chartOptions
}) => {
  const { theme } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Hover data for enhanced information panel
  const [hoverData, setHoverData] = useState<any | null>(null);

  // Selected variety for persistent highlighting
  const [selectedVariety, setSelectedVariety] = useState<string | null>(null);

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

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chart Area */}
          <div className={`p-6 ${hoverData ? 'flex-1 min-h-0' : 'flex-1'}`}>
            <div ref={chartRef} className="w-full h-full min-h-[300px]">
              <HighchartsReact
                highcharts={Highcharts}
                options={{
                  ...chartOptions,
                  chart: {
                    ...chartOptions.chart,
                    height: null, // Let it fill the container
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
                            const point = this as any;
                            const series = point.series;
                            const categories = ['M-I', 'M-II', 'Cs-I', 'Cs-II', 'L-I', 'L-II'];

                            // Collect all location data for this variety
                            const allLocationData = categories.map(location => {
                              const locationIndex = categories.indexOf(location);
                              const value = series.data[locationIndex] ? series.data[locationIndex].y : 0;
                              return {
                                location,
                                value: value || 0
                              };
                            });

                            // Set hover data for the comparison panel
                            setHoverData({
                              variety: series.name,
                              location: String(point.category || ''),
                              value: Number(point.y || 0),
                              seriesColor: String(series.color || '#000000'),
                              allLocationData
                            });
                          },
                          click: function(this: Highcharts.Point) {
                            const point = this as any;
                            const series = point.series;
                            const varietyName = series.name;

                            // Toggle selection: if already selected, deselect; otherwise select
                            if (selectedVariety === varietyName) {
                              setSelectedVariety(null);
                            } else {
                              setSelectedVariety(varietyName);
                            }
                          },
                          mouseOut: function() {
                            // Keep the panel open for better UX - only clear on chart leave
                          }
                        }
                      }
                    }
                  },
                  series: chartOptions.series?.map((series: any) => ({
                    ...series,
                    color: selectedVariety && selectedVariety !== series.name
                      ? (theme === 'dark' ? '#374151' : '#d1d5db') // Dimmed color for non-selected
                      : series.color, // Original color for selected or when none selected
                    opacity: selectedVariety && selectedVariety !== series.name ? 0.3 : 1
                  }))
                }}
              />
            </div>
          </div>

          {/* Enhanced Variety Comparison Panel */}
          {hoverData && (
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-border bg-white/95 dark:bg-background/95 backdrop-blur-sm">
              <div className="max-h-[40vh] overflow-y-auto">
                <VarietyComparisonPanel
                  selectedVariety={hoverData.variety}
                  hoverData={hoverData}
                  allVarieties={varieties}
                  breederColor={breederColor}
                />
              </div>
            </div>
          )}
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
