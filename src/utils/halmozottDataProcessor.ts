export interface HalmozottVarietyData {
  variety: string;
  breeder: string;
  érett: number;
  sárga: number;
  zöld: number;
  romló: number;
}

export interface HalmozottLocationData {
  [location: string]: HalmozottVarietyData[];
}

export interface CumulativeData {
  variety: string;
  breeder: string;
  érett: number;
  sárga: number;
  zöld: number;
  romló: number;
  total: number;
}

export const BREEDER_COLORS = {
  'Unigen Seeds': '#E74C3C',
  'BASF-Nunhems': '#F39C12',
  'Waller + Heinz': '#27AE60'
} as const;

// Load and process cumulative yield data
export async function loadHalmozottData(): Promise<HalmozottLocationData> {
  try {
    const response = await fetch('/data/halmozott_data.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading halmozott data:', error);
    return {};
  }
}

// Process data for cumulative charts
export function processCumulativeData(varieties: HalmozottVarietyData[]): CumulativeData[] {
  return varieties.map(variety => {
    const érett = variety.érett || 0;
    const sárga = variety.sárga || 0;
    const zöld = variety.zöld || 0;
    const romló = variety.romló || 0;

    return {
      variety: variety.variety,
      breeder: variety.breeder,
      érett: érett,
      sárga: sárga,
      zöld: zöld,
      romló: romló,
      total: érett + sárga + zöld + romló
    };
  });
}

// Group data by breeder
export function groupHalmozottByBreeder(data: CumulativeData[]): { [breeder: string]: CumulativeData[] } {
  const grouped: { [breeder: string]: CumulativeData[] } = {};

  data.forEach(item => {
    if (!grouped[item.breeder]) {
      grouped[item.breeder] = [];
    }
    grouped[item.breeder].push(item);
  });

  // Sort varieties within each breeder by variety name
  Object.keys(grouped).forEach(breeder => {
    grouped[breeder].sort((a, b) => a.variety.localeCompare(b.variety));
  });

  return grouped;
}

// Filter data by access level
export function filterDataByAccessLevel(
  data: { [breeder: string]: CumulativeData[] },
  accessLevel: string | null
): { [breeder: string]: CumulativeData[] } {
  if (!accessLevel || accessLevel === 'total') {
    return data;
  }

  const filtered: { [breeder: string]: CumulativeData[] } = {};

  switch (accessLevel) {
    case 'unigen':
      if (data['Unigen Seeds']) {
        filtered['Unigen Seeds'] = data['Unigen Seeds'];
      }
      break;
    case 'nunhems':
      if (data['BASF-Nunhems']) {
        filtered['BASF-Nunhems'] = data['BASF-Nunhems'];
      }
      break;
    case 'waller_heinz':
      if (data['Waller + Heinz']) {
        filtered['Waller + Heinz'] = data['Waller + Heinz'];
      }
      break;
  }

  return filtered;
}

// Get location display name
export function getLocationDisplayName(location: string): string {
  const displayNames: { [key: string]: string } = {
    'LAKITELEK - 4 SOROS': 'Lakitelek - 4 soros',
    'LAKITELEK - 50 TŐVES': 'Lakitelek - 50 tőves',
    'MEZŐBERÉNY - 2 SOROS': 'Mezőberény - 2 soros',
    'CSABACSŰD - 2 SOROS': 'Csabacsűd - 2 soros'
  };

  return displayNames[location] || location;
}

// Get available locations
export function getAvailableLocations(data: HalmozottLocationData): string[] {
  return Object.keys(data).sort();
}