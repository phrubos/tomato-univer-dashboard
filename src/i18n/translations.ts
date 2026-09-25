/**
 * A felület szövegei nyelvenként. A magyar a forrás: az angol szótárnak ugyanazt a
 * szerkezetet kell teljesítenie, így egy hiányzó fordítás fordítási hibát okoz.
 *
 * A nemesítőház- és fajtanevek, valamint a helységnevek tulajdonnevek, nem fordítjuk őket.
 */

export type Language = 'hu' | 'en';
export const LANGUAGES: Language[] = ['hu', 'en'];
export const DEFAULT_LANGUAGE: Language = 'hu';

const HU_MONTHS = ['jan.', 'febr.', 'márc.', 'ápr.', 'máj.', 'jún.', 'júl.', 'aug.', 'szept.', 'okt.', 'nov.', 'dec.'];
const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** '2026-08-11' -> [2026, 8, 11] */
const splitIso = (iso: string) => iso.split('-').map(Number) as [number, number, number];

/**
 * Évszám melléknévi alakja a hangrend szerint: 2025-ös, 2026-os, 2020-as, 2000-es.
 * Az utolsó nem nulla helyiérték kiejtése dönti el a toldalékot.
 */
export function hungarianYearAdjective(year: number): string {
  const ones: Record<number, string> = { 1: 'es', 2: 'es', 3: 'as', 4: 'es', 5: 'ös', 6: 'os', 7: 'es', 8: 'as', 9: 'es' };
  const tens: Record<number, string> = { 1: 'es', 2: 'as', 3: 'as', 4: 'es', 5: 'es', 6: 'as', 7: 'es', 8: 'as', 9: 'es' };
  const suffix = ones[year % 10] ?? tens[Math.floor(year / 10) % 10] ?? (year % 1000 === 0 ? 'es' : 'as');
  return `${year}-${suffix}`;
}

const hu = {
  meta: {
    languageName: 'Magyar',
    switcherLabel: 'Nyelv',
    switchTo: 'Váltás magyar nyelvre'
  },
  common: {
    close: 'Bezárás',
    closeEsc: 'Bezárás (Esc)',
    fullScreen: 'Teljes képernyős nézet',
    loadingSeason: 'Szezon betöltése…',
    unitTha: 't/ha'
  },
  theme: {
    toLight: 'Váltás világos módra',
    toDark: 'Váltás sötét módra'
  },
  login: {
    subtitle: 'Paradicsom fajtakísérlet dashboard',
    passwordLabel: 'Jelszó megadása',
    passwordShortLabel: 'Jelszó',
    placeholder: 'Adja meg a jelszót...',
    error: 'Hibás jelszó! Kérjük próbálja újra.',
    signingIn: 'Bejelentkezés...',
    submit: 'Belépés a Dashboard-ba',
    submitShort: 'Belépés',
    prompt: 'Kérjük adja meg a jelszót a folytatáshoz',
    footer: '© Univer Dashboard - Bizalmas adatok',
    footerHint: 'Kérjük adja meg a hozzáférési jelszót'
  },
  header: {
    tabs: {
      cumulative: 'Halmozott termés',
      brix: 'Brix %',
      retention: 'Tövön tarthatóság'
    },
    visibleBreeders: 'Megjelenített nézet:',
    logout: 'Kijelentkezés',
    season: 'Szezon',
    seasonGroup: 'Vizsgált év',
    views: 'Nézetek'
  },
  footer: (year: number) => `🍅 Paradicsom fajtakísérlet – ${year} © Minden jog fenntartva`,
  status: {
    available: '',
    pending: 'Adatra vár',
    'not-tested': 'Nem vizsgált'
  },
  /** A diagramkategóriák helyszínkulcsai (lásd dataProcessor.getSiteKey). */
  sites: {
    'M': 'Mezőberény',
    'Cs': 'Csabacsűd',
    'L': 'Lakitelek',
    'L-50': 'Lakitelek 50 töves'
  } as Record<string, string>,
  /** A halmozott termés helyszínkulcsai. */
  cumulativeSites: {
    'LAKITELEK - 4 SOROS': 'Lakitelek - 4 soros',
    'LAKITELEK - 50 TÖVES': 'Lakitelek - 50 töves',
    'MEZŐBERÉNY - 2 SOROS': 'Mezőberény - 2 soros',
    'CSABACSŰD - 2 SOROS': 'Csabacsűd - 2 soros'
  } as Record<string, string>,
  harvest: {
    /** A vezérlősáv szedési időszaka a rögzített szedési napokból */
    period: (first: string, last: string) => {
      const format = (iso: string) => {
        const [, month, day] = splitIso(iso);
        return `${HU_MONTHS[month - 1]} ${day}`;
      };
      return `szedés: ${format(first)} – ${format(last)}.`;
    },
    /** Egy minta szedési napja a tooltipben (a forrás '2026.08.11.' alakú) */
    date: (iso: string) => {
      const [year, month, day] = splitIso(iso);
      return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}.`;
    },
    fallback: 'I. és II. szedés · 8 nap eltéréssel · aug. 14 – szept. 4.',
    brixFallback: 'I. és II. szedés Brix %-a · aug. 14 – szept. 4.',
    harvested: 'szedve:'
  },
  breederCard: {
    varietyCount: (count: number) => `${count} fajta adatai`,
    experiments: {
      base: '2 és 4 soros kísérletek',
      l50: 'Lakitelek 50 töves kísérlet'
    }
  },
  earlyVarieties: '*=korai, középkorai fajták',
  chart: {
    mean: 'Átlag:'
  },
  retention: {
    subtitle: 'Tövön tarthatóság elemzés nemesítőházak szerint',
    ripeHeading: 'Érett bogyó mennyisége (t/ha)',
    ripeMetric: 'Érett bogyó mennyisége',
    ripeDescription: 'Az ép, érett bogyó mennyisége az I. és II. szedés során',
    rottenHeading: 'Romló bogyó mennyisége (t/ha)',
    rottenMetric: 'Romló bogyó mennyisége',
    rottenDescription: 'A romló bogyó mennyisége az I. és II. szedés során'
  },
  brix: {
    subtitle: 'Brix % elemzés nemesítőházak szerint',
    heading: 'Brix % értékek',
    description: 'A bogyók cukortartalmának mérési eredményei az I. és II. szedés során',
    pendingTitle: (year: number) => `A ${hungarianYearAdjective(year)} szezon Brix-adatai még nem érkeztek meg`,
    pendingDescription:
      'A cukortartalom-mérés a szedések lezárása után készül el. Amint a laboreredmények beérkeznek, a diagramok automatikusan megjelennek itt.'
  },
  pending: {
    badge: 'Adatra vár',
    viewYear: (year: number) => `${hungarianYearAdjective(year)} adatok megtekintése`
  },
  cumulative: {
    subtitle: 'Halmozott termés diagram',
    varietySummary: (count: number, location: string) => `${count} fajta • ${location}`,
    meanRipe: 'Átlagos érett érték:',
    noData: 'Nincs adat',
    noDataForSite: 'Ehhez a helyszínhez nem található adat.',
    noDataForBreeder: 'Nincs adat ehhez a nemesítőházhoz',
    locationNotice: (stored: string, year: number, fallback: string) =>
      `A(z) ${stored} helyszín a ${hungarianYearAdjective(year)} szezonban nem szerepel, ezért a(z) ${fallback} nézet látható.`,
    axisTitle: 'Termés mennyisége (t/ha)',
    categories: {
      ripe: 'Érett',
      yellow: 'Sárga',
      green: 'Zöld',
      rotten: 'Romló'
    },
    total: 'Összesen:'
  },
  analysis: {
    title: (variety: string) => `Fajta elemzés: ${variety}`,
    kpiGroup: 'Fő teljesítmény mutatók',
    meanRotten: 'Átlagos romló bogyó',
    meanRipe: 'Átlagos érett bogyótömeg',
    meanAria: (value: string) => `Átlag: ${value} tonna per hektár`,
    rank: 'Helyezés',
    rankAria: (rank: number) => `Helyezés: ${rank}. hely`,
    rankOf: (count: number) => `${count} fajtából`,
    decayRate: 'Romlás mértéke',
    fieldStorage: 'Tövön tarthatóság',
    changeAria: (label: string, value: string) => `${label}: ${value} tonna per hektár különbség`,
    decayChange: 't/ha átlagos változás a II. szedésig',
    ripeChange: 't/ha átlagos növekedés a II. szedésig',
    sitePerformance: 'Helyszín teljesítmény',
    comparison: 'Összehasonlítás',
    noComparison: 'Ebben a nézetben nincs másik fajta az összehasonlításhoz.',
    overview: 'Teljesítmény vizualizáció',
    bySite: 'Helyszínenkénti teljesítmény',
    max: 'Max:',
    indicators: 'Teljesítmény mutatók',
    meanRottenMass: 'Átlagos romló bogyótömeg',
    decayIndicator: 'Romlás mértéke (átlagos változás a II. szedésig)',
    retentionIndicator: 'Tövön tarthatóság (átlagos növekedés a II. szedésig)',
    comparative: 'Összehasonlító elemzés',
    assessment: 'Teljesítmény értékelés',
    strengths: 'Erősségek:',
    improvements: 'Fejlesztési területek:',
    recommendation: 'Ajánlás:',
    best: 'Legjobb teljesítmény',
    good: (decay: boolean): string => (decay ? 'Jó romlási trendek' : 'Jó tövön tarthatóság'),
    moderate: (decay: boolean): string => (decay ? 'Közepes romlási trendek' : 'Közepes tövön tarthatóság'),
    weak: (decay: boolean): string => (decay ? 'Gyenge romlási trendek' : 'Gyenge tövön tarthatóság'),
    aboveAverage: (decay: boolean) => `Átlagosnál jobb ${decay ? 'romló bogyó' : 'termés'} eredmény`,
    belowAverage: (decay: boolean) => `Átlagosnál rosszabb ${decay ? 'romló bogyó' : 'termés'} eredmény`,
    missingSites: 'Hiányzó helyszín adatok',
    advice: {
      decayExcellent: 'Kiváló választás további termesztésre. Alacsony romló bogyó mennyiségű és megbízható fajta.',
      decayGood: 'Jó romlási trendekkel rendelkező fajta közepes romló bogyó értékekkel. Megfontolható választás.',
      decayModerate: 'Közepes romlási trendekkel rendelkező fajta. További megfigyelés szükséges.',
      decayWeak: 'Gyenge romlási trendek. További fejlesztés és optimalizálás szükséges.',
      ripeExcellent: 'Kiváló választás további termesztésre. Magas hozamú és megbízható fajta.',
      ripeGood: 'Jó tövön tarthatóságú fajta közepes teljesítménnyel. Megfontolandó választás.',
      ripeModerate: 'Közepes tövön tarthatóságú fajta. További megfigyelés szükséges.',
      ripeWeak: 'Gyenge tövön tarthatóság. További fejlesztés és optimalizálás szükséges.'
    }
  }
};

export type Dictionary = typeof hu;

/** Szakmai (brit) angol változat. Tövön tarthatóság = Field Storage. */
const en: Dictionary = {
  meta: {
    languageName: 'English',
    switcherLabel: 'Language',
    switchTo: 'Switch to English'
  },
  common: {
    close: 'Close',
    closeEsc: 'Close (Esc)',
    fullScreen: 'Full-screen view',
    loadingSeason: 'Loading season…',
    unitTha: 't/ha'
  },
  theme: {
    toLight: 'Switch to light mode',
    toDark: 'Switch to dark mode'
  },
  login: {
    subtitle: 'Tomato variety trial dashboard',
    passwordLabel: 'Password',
    passwordShortLabel: 'Password',
    placeholder: 'Enter your password…',
    error: 'Incorrect password. Please try again.',
    signingIn: 'Signing in…',
    submit: 'Sign in to the dashboard',
    submitShort: 'Sign in',
    prompt: 'Please enter your password to continue',
    footer: '© Univer Dashboard – Confidential data',
    footerHint: 'Please enter your access password'
  },
  header: {
    tabs: {
      cumulative: 'Cumulative Yield',
      brix: 'Brix %',
      retention: 'Field Storage'
    },
    visibleBreeders: 'Showing:',
    logout: 'Sign out',
    season: 'Season',
    seasonGroup: 'Trial year',
    views: 'Views'
  },
  footer: (year: number) => `🍅 Tomato variety trial – ${year} © All rights reserved`,
  status: {
    available: '',
    pending: 'Pending',
    'not-tested': 'Not tested'
  },
  sites: {
    'M': 'Mezőberény',
    'Cs': 'Csabacsűd',
    'L': 'Lakitelek',
    'L-50': 'Lakitelek 50-plant'
  },
  cumulativeSites: {
    'LAKITELEK - 4 SOROS': 'Lakitelek – 4-row',
    'LAKITELEK - 50 TÖVES': 'Lakitelek – 50-plant',
    'MEZŐBERÉNY - 2 SOROS': 'Mezőberény – 2-row',
    'CSABACSŰD - 2 SOROS': 'Csabacsűd – 2-row'
  },
  harvest: {
    period: (first: string, last: string) => {
      const format = (iso: string) => {
        const [, month, day] = splitIso(iso);
        return `${day} ${EN_MONTHS[month - 1]}`;
      };
      return `Harvest: ${format(first)} – ${format(last)}`;
    },
    date: (iso: string) => {
      const [year, month, day] = splitIso(iso);
      return `${day} ${EN_MONTHS[month - 1]} ${year}`;
    },
    fallback: '1st and 2nd harvest · 8 days apart · 14 Aug – 4 Sep',
    brixFallback: 'Brix % at 1st and 2nd harvest · 14 Aug – 4 Sep',
    harvested: 'Harvested:'
  },
  breederCard: {
    varietyCount: (count: number) => `${count} ${count === 1 ? 'variety' : 'varieties'}`,
    experiments: {
      base: '2- and 4-row trials',
      l50: 'Lakitelek 50-plant trial'
    }
  },
  earlyVarieties: '* = early and mid-early varieties',
  chart: {
    mean: 'Mean:'
  },
  retention: {
    subtitle: 'Field storage analysis by breeder',
    ripeHeading: 'Ripe fruit yield (t/ha)',
    ripeMetric: 'Ripe fruit yield',
    ripeDescription: 'Sound, ripe fruit yield at the 1st and 2nd harvest',
    rottenHeading: 'Rotten fruit (t/ha)',
    rottenMetric: 'Rotten fruit',
    rottenDescription: 'Quantity of rotten fruit at the 1st and 2nd harvest'
  },
  brix: {
    subtitle: 'Brix % analysis by breeder',
    heading: 'Brix % values',
    description: 'Soluble solids content (°Brix) of the fruit at the 1st and 2nd harvest',
    pendingTitle: (year: number) => `Brix data for the ${year} season have not been received yet`,
    pendingDescription:
      'Soluble solids are measured once harvesting has been completed. As soon as the laboratory results arrive, the charts will appear here automatically.'
  },
  pending: {
    badge: 'Pending',
    viewYear: (year: number) => `View ${year} data`
  },
  cumulative: {
    subtitle: 'Cumulative yield chart',
    varietySummary: (count: number, location: string) => `${count} ${count === 1 ? 'variety' : 'varieties'} • ${location}`,
    meanRipe: 'Mean ripe yield:',
    noData: 'No data',
    noDataForSite: 'No data are available for this site.',
    noDataForBreeder: 'No data for this breeder',
    locationNotice: (stored: string, year: number, fallback: string) =>
      `The ${stored} site is not part of the ${year} season, so the ${fallback} view is shown instead.`,
    axisTitle: 'Yield (t/ha)',
    categories: {
      ripe: 'Ripe',
      yellow: 'Yellow',
      green: 'Green',
      rotten: 'Rotten'
    },
    total: 'Total:'
  },
  analysis: {
    title: (variety: string) => `Variety analysis: ${variety}`,
    kpiGroup: 'Key performance indicators',
    meanRotten: 'Mean rotten fruit',
    meanRipe: 'Mean ripe fruit yield',
    meanAria: (value: string) => `Mean: ${value} tonnes per hectare`,
    rank: 'Rank',
    rankAria: (rank: number) => `Rank: ${rank}`,
    rankOf: (count: number) => `of ${count} ${count === 1 ? 'variety' : 'varieties'}`,
    decayRate: 'Rot progression',
    fieldStorage: 'Field storage',
    changeAria: (label: string, value: string) => `${label}: ${value} tonnes per hectare difference`,
    decayChange: 't/ha mean change by the 2nd harvest',
    ripeChange: 't/ha mean increase by the 2nd harvest',
    sitePerformance: 'Performance by site',
    comparison: 'Comparison',
    noComparison: 'There is no other variety in this view to compare with.',
    overview: 'Performance overview',
    bySite: 'Performance by site',
    max: 'Max:',
    indicators: 'Performance indicators',
    meanRottenMass: 'Mean rotten fruit',
    decayIndicator: 'Rot progression (mean change by the 2nd harvest)',
    retentionIndicator: 'Field storage (mean increase by the 2nd harvest)',
    comparative: 'Comparative analysis',
    assessment: 'Performance assessment',
    strengths: 'Strengths:',
    improvements: 'Areas for improvement:',
    recommendation: 'Recommendation:',
    best: 'Best performer',
    good: (decay: boolean) => (decay ? 'Favourable rot trend' : 'Good field storage'),
    moderate: (decay: boolean) => (decay ? 'Moderate rot trend' : 'Moderate field storage'),
    weak: (decay: boolean) => (decay ? 'Unfavourable rot trend' : 'Poor field storage'),
    aboveAverage: (decay: boolean) => (decay ? 'Less rotten fruit than average' : 'Above-average yield'),
    belowAverage: (decay: boolean) => (decay ? 'More rotten fruit than average' : 'Below-average yield'),
    missingSites: 'Missing site data',
    advice: {
      decayExcellent: 'An excellent choice for further cultivation: a reliable variety with a low level of rotten fruit.',
      decayGood: 'A variety with a favourable rot trend and moderate levels of rotten fruit. Worth considering.',
      decayModerate: 'A variety with a moderate rot trend. Further observation is recommended.',
      decayWeak: 'Unfavourable rot trend. Further breeding and optimisation are required.',
      ripeExcellent: 'An excellent choice for further cultivation: a high-yielding and reliable variety.',
      ripeGood: 'A variety with good field storage and moderate yield. Worth considering.',
      ripeModerate: 'A variety with moderate field storage. Further observation is recommended.',
      ripeWeak: 'Poor field storage. Further breeding and optimisation are required.'
    }
  }
};

export const translations: Record<Language, Dictionary> = { hu, en };
