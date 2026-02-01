import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart } from 'lucide-react';

export default function IndeksPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart />
          Modul Indeks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>Ini adalah halaman untuk modul indeks.</p>
        <p className="mt-4 text-sm text-muted-foreground">Konten untuk halaman ini akan segera ditambahkan.</p>
      </CardContent>
    </Card>
  );
}
