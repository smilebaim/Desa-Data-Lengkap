import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Landmark } from 'lucide-react';

export default function DanaDesaPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Landmark />
          Modul Dana Desa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>Ini adalah halaman untuk modul dana desa.</p>
        <p className="mt-4 text-sm text-muted-foreground">Konten untuk halaman ini akan segera ditambahkan.</p>
      </CardContent>
    </Card>
  );
}
