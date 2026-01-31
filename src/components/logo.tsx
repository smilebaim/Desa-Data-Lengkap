import { Mountain } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('inline-flex items-center justify-center gap-2', className)}>
      <Mountain className="h-6 w-6 text-sidebar-foreground" />
      <span className="font-headline text-lg font-bold text-sidebar-foreground">
        Desa data Connest
      </span>
    </div>
  );
}
