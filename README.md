# Univer Dashboard

**Tövön tarthatóság elemzés nemesítőházak szerint**

## 📊 Projekt áttekintés

Ez a dashboard az Univer paradicsom-fajtakísérlet adatait vizualizálja interaktív diagramokon keresztül. A rendszer két fő diagram típust tartalmaz:

- **Érett bogyó mennyisége** - Az ép, érett bogyó mennyisége I. és II. szedés során
- **Romló bogyó mennyisége** - A romló bogyó mennyisége I. és II. szedés során

## 🗓️ Szezonok

A dashboard több kísérleti évet kezel; az aktuális szezont a fejlécben lévő szezonváltó állítja (alapértelmezés: a legutóbbi év).

- A választott év az URL `?year=` paraméterében és a session storage-ban is megmarad, így a nézetek között nem vész el.
- A helyszínek szezononként eltérnek (2025: Mezőberény, Csabacsűd, Lakitelek; 2026: Csabacsűd, Lakitelek). A diagramok tengelyei és helyszín-sávjai az adatokból állnak elő, nincs fix helyszínlista.
- A még el nem készült mérések nem nullaként jelennek meg: a **Nem vizsgált** (az adott fajtát ott nem vetették) és az **Adatra vár** (mérés folyamatban) állapotok külön jelölést kapnak. Nullát csak valódi nulla mérés jelent.
- Ahol egy nézetnek még egyáltalán nincs adata (pl. a 2026-os Brix), üres állapot jelenik meg, és onnan egy kattintással át lehet lépni a mért szezonra.

### Adatok frissítése

Az összes szezon adata a `src/data/seasons.json` fájlból jön, amelyet az Excel-táblákból a projekt gyökerében lévő importáló állít elő:

```bash
py ../import_seasons.py            # seasons.json újragenerálása
py ../import_seasons.py --check    # ellenőrzés: eltér-e a JSON az Excelektől
```

Az importáló ellenőrzi a fajta-nemesítőház párosítást és a halmozott adatokkal való egyezést is, így hibás tábla esetén inkább leáll, mint hogy hibás adatot írjon ki.

### Tesztek

```bash
npm test                  # adatréteg (node:test)
node tests/verify-app.cjs # végponti ellenőrzés futó appon, lásd a fájl fejlécét
```

## 🚀 Funkciók

### 📈 Diagram funkciók
- **Interaktív oszlop diagramok** minden nemesítőház adataihoz
- **Komplex tooltip** - Részletes adatok minden helyszínről
- **Hover effektek** - Fajta kiemelés és elhalványítás
- **Fullscreen mód** - Diagram teljes képernyős megjelenítése
- **Export opciók** - PNG, JPEG, SVG formátumok

### 🎨 Felhasználói felület
- **Sötét téma** - Modern és szemkímélő megjelenés
- **Responsive design** - Minden eszközön működik
- **Intuitív navigáció** - Egyszerű és átlátható felület

## 🛠️ Technológiák

- **Next.js 14** - React framework
- **TypeScript** - Típusbiztos fejlesztés
- **Highcharts** - Professzionális diagramok
- **Tailwind CSS** - Modern styling
- **Shadcn/ui** - UI komponensek

## 📦 Telepítés

### Előfeltételek
- Node.js 18+
- npm vagy yarn

### Lépések

1. **Projekt klónozása**
```bash
git clone https://github.com/username/univer-2025-dashboard.git
cd univer-2025-dashboard
```

2. **Dependencies telepítése**
```bash
npm install
# vagy
yarn install
```

3. **Fejlesztői szerver indítása**
```bash
npm run dev
# vagy
yarn dev
```

4. **Böngészőben megnyitás**
```
http://localhost:3000
```

## 📁 Projekt struktúra

```
univer-2025-dashboard/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── page.tsx        # Főoldal
│   │   ├── layout.tsx      # Layout
│   │   └── globals.css     # Globális stílusok
│   ├── components/          # React komponensek
│   │   ├── BreederChart.tsx # Fő diagram komponens
│   │   ├── ColumnChart.tsx  # Oszlop diagram
│   │   └── ui/             # UI komponensek
│   ├── data/               # Adat fájlok
│   │   └── raw_excel_data.json
│   ├── lib/                # Utility könyvtárak
│   └── utils/              # Segédfüggvények
├── public/                 # Statikus fájlok
├── .gitignore             # Git ignore szabályok
└── README.md              # Ez a fájl
```

## 🎯 Használat

1. **Navigáció** - A bal és jobb oldalon különböző diagram típusok találhatók
2. **Interakció** - Hover-rel a diagram elemek fölé a részletekért
3. **Fullscreen** - Kattints a fullscreen gombra a jobb felső sarokban
4. **Export** - Használd a hamburger menüt az export opciókhoz

## 📈 Diagram funkciók részletesen

### BreederChart
- **Többfajta** megjelenítése egy diagramon
- **Komplex tooltip** minden helyszín adataival
- **Átlag számítása** csak a valós értékekből
- **Hover kiemelés** - aktív fajta kiemelése
- **Pozicionált tooltip** - nem takarja el a tengelyeket

### ColumnChart
- **Egyszerű oszlop diagram** demo adatokkal
- **Fullscreen gomb** - diagram teljes képernyős megjelenítése
- **Responsive** - minden képernyőméreten működik

## 🔧 Fejlesztés

### Új funkciók hozzáadása
1. Komponens létrehozása a `src/components/` mappában
2. Import és használat a `src/app/page.tsx` fájlban
3. TypeScript típusok definiálása

### Styling módosítása
- **Tailwind osztályok** használata
- **Custom CSS** a `src/app/globals.css` fájlban
- **Komponens specifikus styling** inline vagy CSS modules-ként

## 📝 Adatok

Az adatok a `src/data/raw_excel_data.json` fájlban vannak tárolva. A `src/utils/dataProcessor.ts` fájl tartalmazza az adatfeldolgozó függvényeket.

## 🤝 Közreműködés

1. Fork-old a repository-t
2. Készíts feature branch-t (`git checkout -b feature/amazing-feature`)
3. Commit-old a változtatásokat (`git commit -m 'Add amazing feature'`)
4. Push-old a branch-t (`git push origin feature/amazing-feature`)
5. Nyiss Pull Request-et

## 📄 Licensz

Ez a projekt belső használatra készült.

## 📞 Kapcsolat

Projekt tulajdonos: [Név]
Email: [email cím]

---

**🆕 Legutóbbi frissítések:**
- ✅ Extra fullscreen gomb minden diagramhoz
- ✅ Chart konténer fullscreen funkció
- ✅ Diagram címek javítása (Unigen Seeds)
- ✅ Git repository létrehozva
- ✅ Version control aktív
