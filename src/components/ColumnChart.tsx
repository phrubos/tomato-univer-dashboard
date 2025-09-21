'use client';

import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

interface ColumnChartProps {
  title?: string;
  data?: Array<{ name: string; y: number }>;
}

const ColumnChart: React.FC<ColumnChartProps> = ({
  title = "Oszlop Diagram",
  data = [
    { name: 'Január', y: 29.9 },
    { name: 'Február', y: 71.5 },
    { name: 'Március', y: 106.4 },
    { name: 'Április', y: 129.2 },
    { name: 'Május', y: 144.0 },
    { name: 'Június', y: 176.0 }
  ]
}) => {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const options: Highcharts.Options = {
    chart: {
      type: 'column',
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'var(--font-geist-sans)'
      }
    },
    title: {
      text: title,
      style: {
        color: '#ffffff',
        fontSize: '20px',
        fontWeight: '600'
      }
    },
    xAxis: {
      type: 'category',
      labels: {
        style: {
          color: '#a1a1aa'
        }
      },
      lineColor: '#3f3f46',
      tickColor: '#3f3f46'
    },
    yAxis: {
      title: {
        text: 'Értékek',
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
      enabled: false
    },
    plotOptions: {
      column: {
        borderWidth: 0,
        borderRadius: 4,
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, '#8b5cf6'],
            [1, '#6366f1']
          ]
        },
        dataLabels: {
          enabled: true,
          style: {
            color: '#ffffff',
            textOutline: 'none'
          }
        }
      }
    },
    series: [{
      type: 'column',
      name: 'Adatok',
      data: data
    }],
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

export default ColumnChart;
