const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, parent, ...rest) {
  return resolve.call(this, request.startsWith('@/') ? path.join(root, 'src', request.slice(2)) : request, parent, ...rest);
};
require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true}
  }).outputText, filename);
};
const data = require('../src/utils/dataProcessor.ts');
const cumulative = require('../src/utils/halmozottDataProcessor.ts');
const i18n = require('../src/i18n/translations.ts');

test('2026 main data has correct sites, roster and missing values', () => {
  const rows = data.processChartData('érett', 2026);
  assert.equal(rows.length, 15);
  assert.deepEqual(data.getChartCategories(rows), ['Cs-I', 'Cs-II', 'L-I', 'L-II']);
  assert.equal(rows.find(r => r.variety === 'UG10162').locations['Cs-I'], null);
  assert.equal(rows.find(r => r.variety === 'UG10162').locations['L-I'], 108);
  assert.equal(rows.find(r => r.variety === 'REDIX*').breeder, 'Syngenta');
  assert.equal(rows.find(r => r.variety === 'REDIX*').locations['L-II'], 146);
});

test('2026 Syngenta is split off: REDIX is its only variety and Heinz keeps only H varieties', () => {
  const rows = data.processChartData('érett', 2026);
  assert.deepEqual(rows.filter(r => r.breeder === 'Syngenta').map(r => r.variety), ['REDIX*']);
  const heinz = rows.filter(r => r.breeder === 'Heinz').map(r => r.variety);
  assert.deepEqual(heinz, ['H2123*', 'H2239', 'H2249', 'H2766*', 'H2480*', 'H2646']);
  assert.ok(rows.every(r => !r.breeder.includes('+Syngenta') && !r.breeder.includes('Syngenta+')));
  // A halmozott termésben is ugyanez a felosztás
  for (const rowsAtSite of Object.values(cumulative.loadHalmozottData(2026))) {
    for (const row of rowsAtSite) {
      assert.equal(row.breeder === 'Syngenta', row.variety.startsWith('REDIX'), row.variety);
    }
  }
  // A Syngentának nincs 50 töves kísérlete
  assert.ok(data.loadL50Data(2026).every(r => r.breeder !== 'Syngenta'));
});

test('2025 regression keeps values, labels and missing-site semantics', () => {
  const rows = data.processChartData('érett', 2025);
  assert.equal(rows.length, 18);
  assert.deepEqual(data.getChartCategories(rows), ['M-I', 'M-II', 'Cs-I', 'Cs-II', 'L-I', 'L-II']);
  assert.equal(rows.find(r => r.variety === 'WALLER').locations['M-I'], 41.7);
  assert.equal(rows.find(r => r.variety === 'UG13577*').locations['L-I'], null);
  assert.equal(data.processBrixData(2025).find(r => r.variety === 'UG11227*').locations['M-I'], 4.656666666666667);
});

test('only the 2025 WALLER control keeps the green highlight; REDIX uses the Syngenta colour', () => {
  assert.equal(data.getVarietyColor('WALLER', '#123456'), '#16a34a');
  for (const name of ['REDIX', 'REDIX*', 'H2249']) assert.equal(data.getVarietyColor(name, '#123456'), '#123456');
  assert.equal(data.getBreederColor('Syngenta'), '#6b7a00');
  assert.equal(data.getBreederColor('Heinz'), data.getBreederColor('WALLER + Heinz'));
});

test('L50 data retains Unigen and Heinz membership and genuine measurements', async () => {
  const rows = await data.loadL50Data(2026);
  assert.equal(rows.length, 7);
  assert.equal(rows.filter(r => r.breeder === 'Unigen Seeds').length, 3);
  assert.equal(rows.filter(r => r.breeder === 'Heinz').length, 3);
  const converted = data.processL50DataForChart(rows, 'érett');
  assert.deepEqual(data.getChartCategories(converted), ['L-50-I', 'L-50-II']);
  assert.equal(converted.find(r => r.variety === '1-UG17121*').locations['L-50-II'], 149);
  assert.equal((await data.loadL50Data(2025)).length, 9);
});

test('2026 Brix is measured where sampled and stays not-tested elsewhere', () => {
  const rows = data.processBrixData(2026);
  assert.equal(rows.length, 15);
  assert.deepEqual(data.getChartCategories(rows), ['Cs-I', 'Cs-II', 'L-I', 'L-II']);
  assert.equal(rows.find(r => r.variety === 'UG8492').locations['Cs-I'], 6.39);
  assert.equal(rows.find(r => r.variety === 'H2249').locations['Cs-II'], 7.02);
  // A nem vizsgált helyszín nullája hiányzó érték marad, nem 0% Brix
  const row = rows.find(r => r.variety === 'UG10162');
  assert.equal(row.locations['Cs-I'], null);
  assert.equal(row.status['Cs-I'], 'not-tested');
  assert.equal(row.locations['L-I'], 5.46);
  assert.equal(row.status['L-I'], 'available');
  // Minden megszedett helyszínhez tartozik Brix-érték, tehát nincs függőben lévő mérés
  assert.ok(rows.every(r => Object.values(r.status).every(s => s !== 'pending')));
  const l50 = data.loadBrixL50Data(2026);
  assert.equal(l50.find(r => r.variety === '7-N296*')['L-50-I'], 4.335);
  assert.ok(l50.every(r => r['L-50-I'] !== null && r['L-50-II'] !== null));
});

test('Heinz and Syngenta have separate access groups that never see each other', () => {
  assert.deepEqual(data.getBreeders(2026, 'unigen').map(r => r.name), ['Unigen Seeds']);
  assert.deepEqual(data.getBreeders(2026, 'heinz').map(r => r.name), ['Heinz']);
  assert.deepEqual(data.getBreeders(2026, 'syngenta').map(r => r.name), ['Syngenta']);
  assert.deepEqual(data.getBreeders(2025, 'heinz').map(r => r.name), ['WALLER + Heinz']);
  assert.deepEqual(data.getBreeders(2025, 'syngenta'), []);
  // A megszűnt közös szint semmit sem lát
  assert.deepEqual(data.getBreeders(2026, 'waller_heinz'), []);
  assert.deepEqual(data.getBreeders(2026, 'unknown'), []);
  // Teljes hozzáférésnél rögzített sorrend: a Syngenta a Heinz után
  assert.deepEqual(data.getBreeders(2026, 'total').map(r => r.name), ['Unigen Seeds', 'BASF-Nunhems', 'Heinz', 'Syngenta']);
  const groups = {Heinz: [], Syngenta: [], 'Prestomech + Heinz': [], 'Unigen Seeds': []};
  assert.deepEqual(cumulative.filterDataByAccessLevel(groups, 'heinz'), {Heinz: [], 'Prestomech + Heinz': []});
  assert.deepEqual(cumulative.filterDataByAccessLevel(groups, 'syngenta'), {Syngenta: []});
});

test('restricted users are only offered seasons in which their breeder has data', () => {
  assert.deepEqual(data.getSeasonYearsForAccess('total'), [2025, 2026]);
  assert.deepEqual(data.getSeasonYearsForAccess('heinz'), [2025, 2026]);
  assert.deepEqual(data.getSeasonYearsForAccess('syngenta'), [2026]);
  const sites = cumulative.getAvailableLocationsForAccessLevel(cumulative.loadHalmozottData(2026), 'syngenta');
  assert.deepEqual(sites, ['CSABACSŰD - 2 SOROS', 'LAKITELEK - 4 SOROS']);
});

test('harvest period is language-neutral and formatted by the dictionary', () => {
  assert.equal(data.getHarvestPeriod(2025), null);
  const period = data.getHarvestPeriod(2026);
  assert.match(period.first, /^2026-\d{2}-\d{2}$/);
  assert.ok(period.first <= period.last);
  // Nemesítőházanként a saját minták szedési napjai számítanak
  assert.deepEqual(data.getHarvestPeriod(2026, 'syngenta'), {first: '2026-08-11', last: '2026-08-26'});
  for (const access of ['unigen', 'nunhems', 'heinz', 'syngenta']) {
    const own = Object.values(cumulative.loadHalmozottData(2026)).flat()
      .filter(r => data.canAccessBreeder(r.breeder, access)).map(r => data.toIsoDate(r.harvestDate)).sort();
    assert.deepEqual(data.getHarvestPeriod(2026, access), {first: own[0], last: own[own.length - 1]}, access);
  }
  assert.equal(data.getHarvestPeriod(2026, 'unknown'), null);
  assert.match(i18n.translations.hu.harvest.period('2026-08-11', '2026-09-02'), /^szedés: aug\. 11 – szept\. 2\.$/);
  assert.equal(i18n.translations.en.harvest.period('2026-08-11', '2026-09-02'), 'Harvest: 11 Aug – 2 Sep');
  assert.equal(i18n.translations.hu.harvest.date('2026-08-11'), '2026.08.11.');
  assert.equal(i18n.translations.en.harvest.date('2026-08-11'), '11 Aug 2026');
});

test('English dictionary covers every Hungarian key and uses the agreed terminology', () => {
  const shape = value => typeof value === 'object' && value !== null
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, shape(value[key])]))
    : typeof value;
  assert.deepEqual(shape(i18n.translations.en), shape(i18n.translations.hu));
  assert.equal(i18n.translations.en.header.tabs.retention, 'Field Storage');
  assert.equal(i18n.translations.hu.header.tabs.retention, 'Tövön tarthatóság');
  assert.equal(i18n.DEFAULT_LANGUAGE, 'hu');
  // Az angol szövegekben ne maradjon magyar felirat (a helységnevek kivételével)
  const strings = [];
  const collect = value => typeof value === 'string' ? strings.push(value) : typeof value === 'object' && Object.values(value).forEach(collect);
  collect({...i18n.translations.en, sites: {}, cumulativeSites: {}});
  assert.deepEqual(strings.filter(s => /[áéíóöőúüű]/i.test(s)), []);
});

test('Hungarian year adjectives follow vowel harmony', () => {
  const adjective = i18n.hungarianYearAdjective;
  assert.deepEqual([2025, 2026, 2020, 2000, 2023, 2031].map(adjective), ['2025-ös', '2026-os', '2020-as', '2000-es', '2023-as', '2031-es']);
});

test('both seasons have complete cumulative data with matching ripe/rotten values', async () => {
  for (const [year, count] of [[2025, 114], [2026, 64]]) {
    const locations = await cumulative.loadHalmozottData(year);
    assert.equal(Object.values(locations).flat().length, count);
    assert.equal(Object.keys(locations).length, year === 2025 ? 4 : 3);
    for (const rows of Object.values(locations)) {
      assert.ok(rows.every(r => r.breeder !== 'Unknown'));
      assert.ok(cumulative.processCumulativeData(rows).every(r => Number.isFinite(r.total)));
    }
  }
});

test('zero remains measured, categories are not inferred from positive numbers', () => {
  const rows = [{variety:'zero',breeder:'Unigen Seeds',locations:{'L-I':0,'L-II':null}}];
  assert.deepEqual(data.getChartCategories(rows), ['L-I','L-II']);
  assert.equal(data.createChartSeriesData(rows, '#dc2626')[0].data[0].y, 0);
  assert.equal(data.createChartSeriesData(rows, '#dc2626')[0].data[1].y, null);
});

test('site bands and labels follow the season categories, not a fixed site list', () => {
  assert.deepEqual(data.getSiteBands(['M-I','M-II','Cs-I','Cs-II','L-I','L-II']), [
    {name:'Mezőberény',from:-0.5,to:1.5},
    {name:'Csabacsűd',from:1.5,to:3.5},
    {name:'Lakitelek',from:3.5,to:5.5}
  ]);
  assert.deepEqual(data.getSiteBands(['Cs-I','Cs-II','L-I','L-II']), [
    {name:'Csabacsűd',from:-0.5,to:1.5},
    {name:'Lakitelek',from:1.5,to:3.5}
  ]);
  assert.deepEqual(data.getSiteBands(['L-50-I','L-50-II']), [{name:'Lakitelek 50 töves',from:-0.5,to:1.5}]);
  assert.equal(data.getLocationLabel('Cs-II'), 'Csabacsűd-II');
  assert.equal(data.getLocationLabel('L-50-I'), 'Lakitelek 50 töves-I');
  assert.equal(data.getLocationLabel('X-I'), 'X-I');
});

test('paired changes only count sites measured at both harvests', () => {
  const row = {variety:'t',breeder:'b',locations:{'Cs-I':10,'Cs-II':14,'L-I':null,'L-II':20,'L-50-I':0,'L-50-II':3}};
  assert.deepEqual(data.getPairedChanges(row), [4, 3]);
});
