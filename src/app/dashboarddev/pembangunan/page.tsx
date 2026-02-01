import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

export default function PembangunanPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 />
          Modul Pembangunan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>Ini adalah halaman untuk modul pembangunan.</p>
        <p className="mt-4 text-sm text-muted-foreground">Konten untuk halaman ini akan segera ditambahkan.</p>
      </CardContent>
    </Card>
  );
}
