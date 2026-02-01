import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';

export default function ProfilPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User />
          Modul Profil
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>Ini adalah halaman untuk modul profil.</p>
        <p className="mt-4 text-sm text-muted-foreground">Konten untuk halaman ini akan segera ditambahkan.</p>
      </CardContent>
    </Card>
  );
}
