# BreederChart v3.0 - Globális State Kezelés

## Összefoglaló

A BreederChart komponens v3.0 verziója globális state kezeléssel rendelkezik, amely lehetővé teszi, hogy csak egy információs panel legyen aktív egyszerre az egész oldalon. Ez jelentősen javítja a felhasználói élményt és megakadályozza a zavaró többszörös panel megjelenítést.

## Főbb újítások

### 1. Globális Context (ChartPanelContext)
```typescript
interface ChartPanelContextType {
  activeChartId: string | null;
  selectedData: SelectedBreederDataPoint | null;
  setActiveChart: (chartId: string, data: SelectedBreederDataPoint) => void;
  closePanel: () => void;
  isChartActive: (chartId: string) => boolean;
}
```

### 2. Egyedi Chart Azonosítók
- Minden BreederChart példány egyedi `chartId`-t kap (`useId()` hook-kal)
- Ez lehetővé teszi a különböző chart példányok megkülönböztetését

### 3. Panel Bezárás Funkció
- **X gomb**: Minden információs panelen van bezárás gomb
- **Automatikus bezárás**: Másik chart oszlopára kattintva az előző panel automatikusan bezáródik
- **Globális kontroll**: Csak egy panel lehet aktív egyszerre

### 4. Adaptív Layout
- **Alapállapot**: Diagram teljes szélességben (`w-full`)
- **Panel aktív**: Diagram összehúzódik (`flex-1`), panel megjelenik
- **Responsív**: `flex-col lg:flex-row` - mobil: függőleges, desktop: vízszintes

## Implementáció részletei

### ChartPanelContext.tsx
```typescript
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
    <ChartPanelContext.Provider value={{ activeChartId, selectedData, setActiveChart, closePanel, isChartActive }}>
      {children}
    </ChartPanelContext.Provider>
  );
};
```

### BreederChart.tsx módosítások
```typescript
const BreederChart: React.FC<BreederChartProps> = ({ ... }) => {
  const { setActiveChart, closePanel, isChartActive, selectedData } = useChartPanel();
  const chartId = useId();

  // Ellenőrizzük, hogy ez a chart aktív-e
  const isThisChartActive = isChartActive(chartId);
  const currentSelectedData = isThisChartActive ? selectedData : null;

  // Click eseménykezelő
  click: function(this: Highcharts.Point) {
    // ... adatok összegyűjtése ...
    
    setActiveChart(chartId, {
      variety: series.name,
      location: point.category,
      value: point.y,
      seriesColor: series.color,
      allLocationData
    });
  }

  // Render
  return (
    <div className="w-full">
      <div className={`flex ${currentSelectedData ? 'flex-col lg:flex-row' : ''} gap-4`}>
        <div className={`${currentSelectedData ? 'flex-1' : 'w-full'} h-96 relative transition-all duration-300`}>
          {/* Chart */}
        </div>
        {currentSelectedData && (
          <div className="lg:flex-shrink-0">
            <BreederDataInfoPanel 
              selectedData={currentSelectedData} 
              varieties={varieties} 
              theme={theme} 
              onClose={closePanel}
            />
          </div>
        )}
      </div>
    </div>
  );
};
```

### Információs Panel Bezárás Gomb
```typescript
const BreederDataInfoPanel: React.FC<{ onClose: () => void; ... }> = ({ onClose, ... }) => {
  return (
    <div className="...">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center flex-1 min-w-0">
          {/* Fajta név és ikon */}
        </div>
        <button
          onClick={onClose}
          className="ml-2 p-1 hover:bg-muted rounded-full transition-colors duration-200 flex-shrink-0"
          title="Bezárás"
        >
          <svg className="w-4 h-4 text-muted-foreground hover:text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {/* Panel tartalom */}
    </div>
  );
};
```

## Felhasználói Élmény Javítások

### 1. Egyszerűsített Interakció
- **Egy panel egyszerre**: Nem zavaró többszörös panel megjelenítés
- **Automatikus váltás**: Másik chart oszlopára kattintva az előző panel bezáródik
- **Explicit bezárás**: X gomb minden panelen

### 2. Tiszta Layout
- **Teljes diagram**: Alapértelmezetten maximális hely a diagramnak
- **Adaptív méretezés**: Panel megjelenésekor a diagram automatikusan alkalmazkodik
- **Responsív design**: Mobil és desktop optimalizált

### 3. Konzisztens Viselkedés
- **Globális state**: Minden chart ugyanazt a state-et használja
- **Szinkronizált működés**: Chart példányok kommunikálnak egymással
- **Előre látható viselkedés**: Felhasználó tudja, mi fog történni

## Technikai Előnyök

### 1. Performance
- **Egyetlen state**: Nem minden chart tárolja a saját state-ét
- **Optimalizált renderelés**: Csak az aktív chart rendereli a panelt
- **Memory hatékonyság**: Kevesebb DOM elem egyszerre

### 2. Karbantarthatóság
- **Központosított logika**: Panel kezelés egy helyen
- **Típusbiztonság**: TypeScript interfészek
- **Újrafelhasználhatóság**: Context más komponensekben is használható

### 3. Skálázhatóság
- **Könnyen bővíthető**: Új chart típusok egyszerűen hozzáadhatók
- **Moduláris design**: Context és komponensek szétválasztva
- **Tesztelhetőség**: Izolált logika könnyebben tesztelhető

## Tesztelési Forgatókönyvek

### 1. Alapfunkciók
1. **Oszlop kattintás**: Panel megjelenése
2. **X gomb**: Panel bezárása
3. **Másik oszlop**: Panel váltás
4. **Másik chart**: Előző panel bezárása, új panel megjelenése

### 2. Responsív Viselkedés
1. **Desktop**: Vízszintes elrendezés (`lg:flex-row`)
2. **Mobil**: Függőleges elrendezés (`flex-col`)
3. **Átméretezés**: Smooth átmenetek

### 3. Edge Case-ek
1. **Gyors kattintások**: Stabil működés
2. **Több chart egyszerre**: Csak egy panel aktív
3. **Böngésző visszagomb**: State megmaradás

## Következő Lépések

### 1. Fejlesztési Lehetőségek
- **Animációk**: Panel slide-in/out effektek
- **Keyboard navigáció**: ESC gomb panel bezáráshoz
- **URL state**: Panel állapot URL-ben tárolása

### 2. Optimalizációk
- **Lazy loading**: Panel tartalom csak szükség esetén
- **Virtualizáció**: Nagy adathalmazok kezelése
- **Caching**: Számított értékek cache-elése

### 3. Accessibility
- **ARIA labels**: Screen reader támogatás
- **Focus management**: Keyboard navigáció
- **High contrast**: Színvak felhasználók támogatása

## Összegzés

A v3.0 verzió jelentős előrelépést jelent a felhasználói élmény terén:

✅ **Globális state kezelés** - Csak egy panel egyszerre  
✅ **Bezárás funkció** - X gomb minden panelen  
✅ **Automatikus váltás** - Másik chart kattintásra előző bezáródik  
✅ **Adaptív layout** - Teljes szélesség ↔ panel + diagram  
✅ **Responsív design** - Mobil és desktop optimalizált  
✅ **Típusbiztonság** - TypeScript interfészek  
✅ **Performance** - Optimalizált renderelés  

A megoldás professzionális, skálázható és felhasználóbarát chart rendszert eredményez.
