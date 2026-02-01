import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LayoutGrid } from 'lucide-react';

export default function TataRuangPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LayoutGrid />
          Modul Tata Ruang
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>Ini adalah halaman untuk modul tata ruang.</p>
        <p className="mt-4 text-sm text-muted-foreground">Konten untuk halaman ini akan segera ditambahkan.</p>
      </CardContent>
    </Card>
  );
}
