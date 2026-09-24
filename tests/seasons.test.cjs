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

test('2026 main data has correct sites, roster and missing values', () => {
  const rows = data.processChartData('érett', 2026);
  assert.equal(rows.length, 15);
  assert.deepEqual(data.getChartCategories(rows), ['Cs-I', 'Cs-II', 'L-I', 'L-II']);
  assert.equal(rows.find(r => r.variety === 'UG10162').locations['Cs-I'], null);
  assert.equal(rows.find(r => r.variety === 'UG10162').locations['L-I'], 108);
  assert.equal(rows.find(r => r.variety === 'REDIX*').breeder, 'Heinz+Syngenta');
  assert.equal(rows.find(r => r.variety === 'REDIX*').locations['L-II'], 146);
});

test('2025 regression keeps values, labels and missing-site semantics', () => {
  const rows = data.processChartData('érett', 2025);
  assert.equal(rows.length, 18);
  assert.deepEqual(data.getChartCategories(rows), ['M-I', 'M-II', 'Cs-I', 'Cs-II', 'L-I', 'L-II']);
  assert.equal(rows.find(r => r.variety === 'WALLER').locations['M-I'], 41.7);
  assert.equal(rows.find(r => r.variety === 'UG13577*').locations['L-I'], null);
  assert.equal(data.processBrixData(2025).find(r => r.variety === 'UG11227*').locations['M-I'], 4.656666666666667);
});

test('REDIX inherits the green WALLER highlight without renaming either variety', () => {
  for (const name of ['WALLER', 'REDIX', 'REDIX*']) assert.equal(data.getVarietyColor(name, '#123456'), '#16a34a');
  assert.equal(data.getVarietyColor('H2249', '#123456'), '#123456');
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

test('access groups preserve the agreed 2026 Syngenta/Heinz mapping', () => {
  assert.deepEqual(data.getBreeders(2026, 'unigen').map(r => r.name), ['Unigen Seeds']);
  assert.deepEqual(data.getBreeders(2026, 'waller_heinz').map(r => r.name), ['Heinz+Syngenta']);
  assert.deepEqual(data.getBreeders(2026, 'unknown'), []);
  assert.deepEqual(cumulative.filterDataByAccessLevel({Heinz: [], 'Heinz+Syngenta': [], 'Unigen Seeds': []}, 'waller_heinz'), {Heinz: [], 'Heinz+Syngenta': []});
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
