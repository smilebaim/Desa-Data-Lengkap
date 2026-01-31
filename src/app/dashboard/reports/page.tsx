import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { reports, villages, users } from '@/lib/data';
import { PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function ReportsPage() {
  const getVillageName = (id: string) => villages.find(v => v.id === id)?.name || 'Unknown Village';
  const getAuthorName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown Author';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl font-bold">Pelaporan System</h1>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Create Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map(report => (
          <Card key={report.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{report.title}</CardTitle>
              <CardDescription>
                <Badge variant="secondary" className="mr-2">{getVillageName(report.villageId)}</Badge>
                by {getAuthorName(report.authorId)} on {format(new Date(report.date), 'PPP')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {report.imageUrl && (
                <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-md">
                  <Image
                    src={report.imageUrl}
                    alt={report.title}
                    fill
                    className="object-cover"
                    data-ai-hint={report.imageHint}
                  />
                </div>
              )}
              <p className="text-sm text-muted-foreground">{report.content}</p>
            </CardContent>
            <CardFooter>
                <Button variant="outline" size="sm">Read More</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
