import { VillageMap } from '@/components/map';
import { villages, reports } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map, FileText, Users } from 'lucide-react';

export default function DashboardPage() {
    const totalVillages = villages.length;
    const totalReports = reports.length;
    const totalPopulation = villages.reduce((sum, v) => sum + v.population, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Villages
            </CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVillages}</div>
            <p className="text-xs text-muted-foreground">
              Registered across Indonesia
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Population
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPopulation.toLocaleString()}</div>
             <p className="text-xs text-muted-foreground">
              In all registered villages
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReports}</div>
            <p className="text-xs text-muted-foreground">
              Submitted from all villages
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="h-[60vh]">
          <CardHeader>
            <CardTitle>Village Distribution Map</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(60vh-4rem)] p-0">
             <VillageMap villages={villages} />
          </CardContent>
      </Card>
    </div>
  );
}
