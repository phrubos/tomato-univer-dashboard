'use client';

import ColumnChart from "@/components/ColumnChart";

export default function TestColumnChart() {
  const testData = [
    { name: 'Január', y: 29.9 },
    { name: 'Február', y: 71.5 },
    { name: 'Március', y: 106.4 },
    { name: 'Április', y: 129.2 },
    { name: 'Május', y: 144.0 },
    { name: 'Június', y: 176.0 },
    { name: 'Július', y: 135.6 },
    { name: 'Augusztus', y: 148.5 }
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">
            ColumnChart Teszt
          </h1>
          <p className="text-gray-400">
            Kattints egy oszlopra az adatok megtekintéséhez
          </p>
        </div>

        {/* Chart */}
        <div className="bg-gray-800 rounded-lg p-6">
          <ColumnChart 
            title="Havi Értékek Tesztje"
            data={testData}
          />
        </div>

        {/* Instrukciók */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Tesztelési útmutató:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Funkciók:</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• <span className="text-green-400">Kattintás:</span> Oszlopra kattintva megjelenik az információs panel</li>
                <li>• <span className="text-blue-400">Tooltip letiltva:</span> Nincs hover tooltip</li>
                <li>• <span className="text-purple-400">Responsív layout:</span> A diagram és panel egymás mellett</li>
                <li>• <span className="text-yellow-400">Animációk:</span> Smooth átmenetek és vizuális visszajelzések</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Információs panel tartalma:</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• <span className="text-green-400">Alapadatok:</span> Kategória, érték, pozíció</li>
                <li>• <span className="text-blue-400">Vizuális progress:</span> Relatív érték megjelenítése</li>
                <li>• <span className="text-purple-400">Statisztikák:</span> Maximum, átlag értékek</li>
                <li>• <span className="text-yellow-400">Összehasonlítás:</span> Átlag feletti/alatti jelzés</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Második teszt diagram */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Második teszt - Különböző adatok</h2>
          <ColumnChart
            title="Negyedéves Teljesítmény"
            data={[
              { name: 'Q1', y: 85.2 },
              { name: 'Q2', y: 92.7 },
              { name: 'Q3', y: 78.9 },
              { name: 'Q4', y: 105.3 }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
