'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function AiSuggestionsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Content Suggestion Tool</CardTitle>
        <CardDescription>
          Generate content ideas for your village based on the latest news and trends.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-48 items-center justify-center rounded-md border-2 border-dashed bg-muted/50 p-8 text-center text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="h-8 w-8" />
            <span className="font-medium">Fitur Tidak Tersedia</span>
            <p className="text-sm">
              Fitur saran AI untuk sementara dinonaktifkan karena masalah kompatibilitas.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
