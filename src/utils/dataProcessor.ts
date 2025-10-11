import rawData from '@/data/raw_excel_data.json';

export interface ChartDataPoint {
  name: string;
  y: number;
  color?: string;
}

export interface BreederGroup {
  name: string;
  color: string;
  varieties: string[];
}

export interface ProcessedData {
  variety: string;
  breeder: string;
  locations: {
    'M-I': number;
    'M-II': number;
    'Cs-I': number;
    'Cs-II': number;
    'L-I': number;
    'L-II': number;
  };
}

export interface L50Data {
  variety: string;
  breeder: string;
  romló_I: number;
  romló_II: number;
  érett_I: number;
  érett_II: number;
}

export interface BrixL50Data {
  variety: string;
  breeder: string;
  'L-50-I': number;
  'L-50-II': number;
}

// Nemesítőházak definíciója
export const BREEDERS: BreederGroup[] = [
  {
    name: 'Unigen Seeds',
    color: '#dc2626', // Piros
    varieties: ['UG11227*', 'UG8492', 'UG17219', 'UG1578', 'UG13577*']
  },
  {
    name: 'BASF-Nunhems',
    color: '#d97706', // Mustár narancssárga
    varieties: ['N00541*', 'N00530', 'N00544', 'N00539', 'N00339', 'N4510', 'N00540*']
  },
  {
    name: 'WALLER + Heinz',
    color: '#1e40af', // Királykék
    varieties: ['WALLER', 'H2123*', 'H2239', 'H2249', 'H1881', 'H2127']
  }
];

// Helyszínek csoportosítása
export const LOCATION_GROUPS = [
  { name: 'Mezőberény', locations: ['M-I', 'M-II'], color: '#8b5cf6' },
  { name: 'Csabacsűd', locations: ['Cs-I', 'Cs-II'], color: '#06b6d4' },
  { name: 'Lakitelek', locations: ['L-I', 'L-II'], color: '#84cc16' }
];

export function getBreederForVariety(variety: string): string {
  for (const breeder of BREEDERS) {
    if (breeder.varieties.includes(variety)) {
      return breeder.name;
    }
  }
  return 'Ismeretlen';
}

export function getBreederColor(breederName: string): string {
  const breeder = BREEDERS.find(b => b.name === breederName);
  return breeder?.color || '#6b7280';
}

export function processChartData(chartType: 'érett' | 'romló'): ProcessedData[] {
  const targetDiagram = chartType === 'érett' 
    ? 'Tövön tarthatóság - az ép, érett bogyó mennyisége, I. és II. szedés, t/ha'
    : 'Tövön tarthatóság - a romló bogyó mennyisége, I. és II. szedés, t/ha';

  const filteredData = rawData.Munka1.filter(item => item.diagramhoz === targetDiagram);

  return filteredData.map(item => ({
    variety: item.fajta,
    breeder: getBreederForVariety(item.fajta),
    locations: {
      'M-I': item['M-I.'],
      'M-II': item['M-II.'],
      'Cs-I': item['Cs-I.'],
      'Cs-II': item['Cs-II.'],
      'L-I': item['L-I.'],
      'L-II': item['L-II.']
    }
  }));
}

export function groupDataByBreeder(data: ProcessedData[]): Record<string, ProcessedData[]> {
  return data.reduce((acc, item) => {
    if (!acc[item.breeder]) {
      acc[item.breeder] = [];
    }
    acc[item.breeder].push(item);
    return acc;
  }, {} as Record<string, ProcessedData[]>);
}

interface ChartSeriesData {
  name: string;
  data: Array<{
    name: string;
    y: number;
    color: string;
  }>;
  color: string;
}

export function createChartSeriesData(varieties: ProcessedData[], breederColor: string): ChartSeriesData[] {
  const locations = ['M-I', 'M-II', 'Cs-I', 'Cs-II', 'L-I', 'L-II'];
  
  return varieties.map((variety, varietyIndex) => ({
    name: variety.variety,
    data: locations.map((location, locationIndex) => ({
      name: location,
      y: variety.locations[location as keyof typeof variety.locations],
      color: adjustColorBrightness(breederColor, varietyIndex * 0.2)
    })),
    color: adjustColorBrightness(breederColor, varietyIndex * 0.2)
  }));
}

function adjustColorBrightness(hex: string, factor: number): string {
  // Egyszerű színárnyalat módosítás
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * factor * 100);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

// L50 adatok betöltése és feldolgozása
export async function loadL50Data(): Promise<L50Data[]> {
  try {
    const response = await fetch('/data/l50_data.json');
    const data = await response.json();
    const lakitelekData = data['LAKITELEK - 50 SOROS'] || [];

    return lakitelekData.map((item: any) => {
      return {
        variety: item.variety,
        breeder: item.breeder,
        romló_I: item.romló_I || 0,
        romló_II: item.romló_II || 0,
        érett_I: item.érett_I || 0,
        érett_II: item.érett_II || 0
      };
    });
  } catch (error) {
    console.error('Error loading L50 data:', error);
    return [];
  }
}

// L50 adatok csoportosítása nemesítőházak szerint
export function groupL50DataByBreeder(data: L50Data[]): Record<string, L50Data[]> {
  return data.reduce((acc, item) => {
    if (!acc[item.breeder]) {
      acc[item.breeder] = [];
    }
    acc[item.breeder].push(item);
    return acc;
  }, {} as Record<string, L50Data[]>);
}

// L50 diagramhoz alkalmas adatstruktúra létrehozása
export function processL50DataForChart(varieties: L50Data[], chartType: 'érett' | 'romló'): ProcessedData[] {
  return varieties.map(variety => ({
    variety: variety.variety,
    breeder: variety.breeder,
    locations: {
      'M-I': 0,
      'M-II': 0,
      'Cs-I': 0,
      'Cs-II': 0,
      'L-I': chartType === 'érett' ? variety.érett_I : variety.romló_I,
      'L-II': chartType === 'érett' ? variety.érett_II : variety.romló_II
    }
  }));
}

// Brix adatok feldolgozása
export function processBrixData(): ProcessedData[] {
  const brixData = rawData.brix || [];

  return brixData.map(item => ({
    variety: item.fajta,
    breeder: item.nemesítőház,
    locations: {
      'M-I': item['M-I.'] || 0,
      'M-II': item['M-II.'] || 0,
      'Cs-I': item['Cs-I.'] || 0,
      'Cs-II': item['Cs-II.'] || 0,
      'L-I': item['L-I.'] || 0,
      'L-II': item['L-II.'] || 0
    }
  }));
}

// Brix L50 adatok betöltése
export function loadBrixL50Data(): BrixL50Data[] {
  const brixL50Data = rawData.brix_l50 || [];

  return brixL50Data.map(item => ({
    variety: item.fajta,
    breeder: item.nemesítőház,
    'L-50-I': item['L-50-I'] || 0,
    'L-50-II': item['L-50-II'] || 0
  }));
}

// Brix L50 adatok feldolgozása diagram formátumra
export function processBrixL50DataForChart(varieties: BrixL50Data[]): ProcessedData[] {
  return varieties.map(variety => ({
    variety: variety.variety,
    breeder: variety.breeder,
    locations: {
      'M-I': 0,
      'M-II': 0,
      'Cs-I': 0,
      'Cs-II': 0,
      'L-I': variety['L-50-I'],
      'L-II': variety['L-50-II']
    }
  }));
}
