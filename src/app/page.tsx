import { VillageMap } from '@/components/map';
import { villages } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Mountain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur-sm sm:px-6">
        <div className="inline-flex items-center justify-center gap-2">
          <Mountain className="h-8 w-8 text-primary" />
          <h1 className="font-headline text-2xl font-bold tracking-tighter text-foreground">
            Desa data Connect
          </h1>
        </div>
        <Button asChild variant="default">
          <Link href="/login">Login</Link>
        </Button>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
            <h2 className="text-4xl font-bold tracking-tight">Peta Digital Desa se-Indonesia</h2>
            <p className="text-muted-foreground mt-2 text-lg">Menghubungkan dan memvisualisasikan data desa di seluruh nusantara.</p>
        </div>
        <Card className="w-full max-w-6xl h-[65vh] shadow-lg">
          <CardContent className="p-0 h-full">
            <VillageMap villages={villages} />
          </CardContent>
        </Card>
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} Desa data Connect. All rights reserved.
      </footer>
    </div>
  );
}
