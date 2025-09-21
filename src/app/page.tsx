import BreederChart from "@/components/BreederChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { processChartData, groupDataByBreeder, BREEDERS, getBreederColor } from "@/utils/dataProcessor";

export default function Home() {
  // Adatok feldolgozása
  const erettData = processChartData('érett');
  const romloData = processChartData('romló');

  const erettGrouped = groupDataByBreeder(erettData);
  const romloGrouped = groupDataByBreeder(romloData);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Univer 2025 Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Tövön tarthatóság elemzés nemesítőházak szerint
          </p>
        </div>

        {/* Bal-jobb oldali elrendezés */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bal oldal - Érett bogyó mennyisége szekció */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Érett bogyó mennyisége (t/ha)
              </h2>
              <p className="text-muted-foreground">
                Az ép, érett bogyó mennyisége I. és II. szedés során
              </p>
            </div>

            <div className="space-y-6">
              {BREEDERS.map((breeder) => {
                const varieties = erettGrouped[breeder.name] || [];
                if (varieties.length === 0) return null;

                return (
                  <Card key={`erett-${breeder.name}`} className="w-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: breeder.color }}
                        />
                        {breeder.name}
                      </CardTitle>
                      <CardDescription>
                        {varieties.length} fajta adatai
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BreederChart
                        title="Érett bogyó mennyisége"
                        varieties={varieties}
                        breederColor={breeder.color}
                        breederName={breeder.name}
                        allVarietiesData={erettData}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Jobb oldal - Romló bogyó mennyisége szekció */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Romló bogyó mennyisége (t/ha)
              </h2>
              <p className="text-muted-foreground">
                A romló bogyó mennyisége I. és II. szedés során
              </p>
            </div>

            <div className="space-y-6">
              {BREEDERS.map((breeder) => {
                const varieties = romloGrouped[breeder.name] || [];
                if (varieties.length === 0) return null;

                return (
                  <Card key={`romlo-${breeder.name}`} className="w-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: breeder.color }}
                        />
                        {breeder.name}
                      </CardTitle>
                      <CardDescription>
                        {varieties.length} fajta adatai
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BreederChart
                        title="Romló bogyó mennyisége"
                        varieties={varieties}
                        breederColor={breeder.color}
                        breederName={breeder.name}
                        allVarietiesData={romloData}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
