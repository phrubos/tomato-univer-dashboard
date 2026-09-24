import seasons from '@/data/seasons.json';

export type SeasonYear = 2025 | 2026;
export type MeasurementStatus = 'available' | 'pending' | 'not-tested';
export const SEASON_YEARS: SeasonYear[] = [2025, 2026];
export const DEFAULT_YEAR: SeasonYear = 2026;

interface SeasonVariety {
  variety: string;
  breeder: string;
  ripe: Record<string, number | null>;
  rotten: Record<string, number | null>;
  brix: Record<string, number | null>;
}

interface SeasonData {
  year: number;
  categories: string[];
  sources: string[];
  main: SeasonVariety[];
  l50: SeasonVariety[];
  cumulative: Record<string, Array<{ variety: string; breeder: string; érett: number; sárga: number; zöld: number; romló: number; harvestDate?: string }>>;
}

export function getSeason(year: SeasonYear): SeasonData {
  return (seasons as Record<string, SeasonData>)[String(year)];
}

const MONTH_ABBREVIATIONS = ['jan.', 'febr.', 'márc.', 'ápr.', 'máj.', 'jún.', 'júl.', 'aug.', 'szept.', 'okt.', 'nov.', 'dec.'];

/**
 * A szezon szedési időszaka a mintákhoz rögzített szedési napokból, pl. 'szedés: aug. 11 – szept. 2.'.
 * Ha a szezonhoz nincsenek szedési napok (2025), a megadott szöveget adja vissza.
 */
export function getHarvestPeriod(year: SeasonYear, fallback: string): string {
  // '2026.08.11.' -> '2026-08-11': így a szöveges rendezés időrendi
  const dates = Object.values(getSeason(year).cumulative)
    .flat()
    .flatMap(row => (row.harvestDate ? [row.harvestDate.replace(/\.$/, '').replaceAll('.', '-')] : []))
    .sort();
  if (dates.length === 0) return fallback;

  const format = (date: string) => {
    const [, month, day] = date.split('-').map(Number);
    return `${MONTH_ABBREVIATIONS[month - 1]} ${day}`;
  };
  return `szedés: ${format(dates[0])} – ${format(dates[dates.length - 1])}.`;
}

export interface ChartDataPoint {
  name: string;
  y: number | null;
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
  locations: Record<string, number | null>;
  status?: Record<string, MeasurementStatus>;
}

export interface L50Data {
  variety: string;
  breeder: string;
  romló_I: number | null;
  romló_II: number | null;
  érett_I: number | null;
  érett_II: number | null;
}

export interface BrixL50Data {
  variety: string;
  breeder: string;
  'L-50-I': number | null;
  'L-50-II': number | null;
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

export const BREEDER_ACCESS: Record<string, string> = {
  'Unigen Seeds': 'unigen',
  'BASF-Nunhems': 'nunhems',
  'WALLER + Heinz': 'waller_heinz',
  'Prestomech + Heinz': 'waller_heinz',
  'Heinz+Syngenta': 'waller_heinz',
  'Heinz': 'waller_heinz'
};

export function getBreeders(year: SeasonYear, accessLevel: string | null = 'total'): BreederGroup[] {
  const rows = getSeason(year).main;
  return [...new Set(rows.map(row => row.breeder))]
    .filter(name => accessLevel === 'total' || (accessLevel !== null && BREEDER_ACCESS[name] === accessLevel))
    .map(name => ({ name, color: getBreederColor(name), varieties: rows.filter(row => row.breeder === name).map(row => row.variety) }));
}

export function getL50Breeder(name: string): string {
  return name === 'WALLER + Heinz' ? 'Prestomech + Heinz' : name === 'Heinz+Syngenta' ? 'Heinz' : name;
}

// Helyszínek csoportosítása
export const LOCATION_GROUPS = [
  { name: 'Mezőberény', locations: ['M-I', 'M-II'], color: '#8b5cf6' },
  { name: 'Csabacsűd', locations: ['Cs-I', 'Cs-II'], color: '#06b6d4' },
  { name: 'Lakitelek', locations: ['L-I', 'L-II'], color: '#84cc16' }
];

export function getBreederForVariety(variety: string, year: SeasonYear = 2025): string {
  return getSeason(year).main.find(row => row.variety === variety)?.breeder ?? 'Ismeretlen';
}

export function getBreederColor(breederName: string): string {
  const breeder = BREEDERS.find(b => b.name === breederName);
  return breeder?.color ?? (BREEDER_ACCESS[breederName] === 'waller_heinz' ? '#1e40af' : '#6b7280');
}

export function getVarietyColor(variety: string, fallback: string): string {
  return ['WALLER', 'REDIX'].includes(variety.trim().toUpperCase().replace(/\*$/, '')) ? '#16a34a' : fallback;
}

export function getChartCategories(varieties: ProcessedData[]): string[] {
  return [...new Set(varieties.flatMap(variety => Object.keys(variety.locations)))];
}

export function isMeasuredValue(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function getPairedChanges(variety: ProcessedData): number[] {
  return Object.keys(variety.locations).filter(location => location.endsWith('-I')).flatMap(location => {
    const first = variety.locations[location];
    const second = variety.locations[`${location}I`];
    return isMeasuredValue(first) && isMeasuredValue(second) ? [second - first] : [];
  });
}

function processRows(rows: SeasonVariety[], metric: 'ripe' | 'rotten' | 'brix'): ProcessedData[] {
  return rows.map(row => ({
    variety: row.variety,
    breeder: row.breeder,
    locations: { ...row[metric] },
    status: Object.fromEntries(Object.keys(row[metric]).map(location => [location,
      row.ripe[location] === null ? 'not-tested' : row[metric][location] === null ? 'pending' : 'available'
    ]))
  }));
}

export function processChartData(chartType: 'érett' | 'romló', year: SeasonYear = 2025): ProcessedData[] {
  return processRows(getSeason(year).main, chartType === 'érett' ? 'ripe' : 'rotten');
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
    y: number | null;
    color: string;
  }>;
  color: string;
}

export function createChartSeriesData(varieties: ProcessedData[], breederColor: string): ChartSeriesData[] {
  const locations = getChartCategories(varieties);
  return varieties.map((variety, varietyIndex) => ({
    name: variety.variety,
    data: locations.map(location => ({
      name: location,
      y: variety.locations[location] ?? null,
      color: getVarietyColor(variety.variety, adjustColorBrightness(breederColor, varietyIndex * 0.2))
    })),
    color: getVarietyColor(variety.variety, adjustColorBrightness(breederColor, varietyIndex * 0.2))
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
export function loadL50Data(year: SeasonYear = 2025): L50Data[] {
  return getSeason(year).l50.map(row => ({
    variety: row.variety,
    breeder: row.breeder,
    romló_I: row.rotten['L-50-I'],
    romló_II: row.rotten['L-50-II'],
    érett_I: row.ripe['L-50-I'],
    érett_II: row.ripe['L-50-II']
  }));
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
      'L-50-I': chartType === 'érett' ? variety.érett_I : variety.romló_I,
      'L-50-II': chartType === 'érett' ? variety.érett_II : variety.romló_II
    }
  }));
}

// Brix adatok feldolgozása
export function processBrixData(year: SeasonYear = 2025): ProcessedData[] {
  return processRows(getSeason(year).main, 'brix');
}

// Brix L50 adatok betöltése
export function loadBrixL50Data(year: SeasonYear = 2025): BrixL50Data[] {
  return getSeason(year).l50.map(row => ({
    variety: row.variety,
    breeder: row.breeder,
    'L-50-I': row.brix['L-50-I'],
    'L-50-II': row.brix['L-50-II']
  }));
}

// Brix L50 adatok feldolgozása diagram formátumra
export function processBrixL50DataForChart(varieties: BrixL50Data[]): ProcessedData[] {
  return varieties.map(variety => ({
    variety: variety.variety,
    breeder: variety.breeder,
    locations: {
      'L-50-I': variety['L-50-I'],
      'L-50-II': variety['L-50-II']
    },
    status: { 'L-50-I': variety['L-50-I'] === null ? 'pending' : 'available', 'L-50-II': variety['L-50-II'] === null ? 'pending' : 'available' }
  }));
}

// --- Helyszín- és állapotcímkék (szezonfüggetlen, a kategóriákból származtatva) ---

export const SITE_NAMES: Record<string, string> = {
  'M': 'Mezőberény',
  'Cs': 'Csabacsűd',
  'L': 'Lakitelek',
  'L-50': 'Lakitelek 50 töves'
};

export const STATUS_LABELS: Record<MeasurementStatus, string> = {
  available: '',
  pending: 'Adatra vár',
  'not-tested': 'Nem vizsgált'
};

/** 'Cs-II' -> 'Cs', 'L-50-I' -> 'L-50' */
export function getSiteKey(location: string): string {
  return location.replace(/-(I{1,2})$/, '');
}

/** 'Cs-II' -> 'Csabacsűd-II' */
export function getLocationLabel(location: string): string {
  const site = getSiteKey(location);
  const name = SITE_NAMES[site];
  return name ? `${name}-${location.slice(site.length + 1)}` : location;
}

/** A diagram kategóriáiból egybefüggő helyszín-sávokat képez a Highcharts plotBands-hez. */
export function getSiteBands(categories: string[]): Array<{ name: string; from: number; to: number }> {
  const bands: Array<{ name: string; from: number; to: number }> = [];
  categories.forEach((location, index) => {
    const name = SITE_NAMES[getSiteKey(location)] ?? getSiteKey(location);
    const last = bands[bands.length - 1];
    if (last && last.name === name && last.to === index - 0.5) last.to = index + 0.5;
    else bands.push({ name, from: index - 0.5, to: index + 0.5 });
  });
  return bands;
}
