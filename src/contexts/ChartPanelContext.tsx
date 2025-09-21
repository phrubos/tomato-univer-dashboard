'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SelectedBreederDataPoint {
  variety: string;
  location: string;
  value: number;
  seriesColor: string;
  allLocationData: { location: string; value: number }[];
}

interface ChartPanelContextType {
  activeChartId: string | null;
  selectedData: SelectedBreederDataPoint | null;
  setActiveChart: (chartId: string, data: SelectedBreederDataPoint) => void;
  closePanel: () => void;
  isChartActive: (chartId: string) => boolean;
}

const ChartPanelContext = createContext<ChartPanelContextType | undefined>(undefined);

export const ChartPanelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeChartId, setActiveChartId] = useState<string | null>(null);
  const [selectedData, setSelectedData] = useState<SelectedBreederDataPoint | null>(null);

  const setActiveChart = (chartId: string, data: SelectedBreederDataPoint) => {
    setActiveChartId(chartId);
    setSelectedData(data);
  };

  const closePanel = () => {
    setActiveChartId(null);
    setSelectedData(null);
  };

  const isChartActive = (chartId: string) => {
    return activeChartId === chartId;
  };

  return (
    <ChartPanelContext.Provider
      value={{
        activeChartId,
        selectedData,
        setActiveChart,
        closePanel,
        isChartActive,
      }}
    >
      {children}
    </ChartPanelContext.Provider>
  );
};

export const useChartPanel = () => {
  const context = useContext(ChartPanelContext);
  if (context === undefined) {
    throw new Error('useChartPanel must be used within a ChartPanelProvider');
  }
  return context;
};
