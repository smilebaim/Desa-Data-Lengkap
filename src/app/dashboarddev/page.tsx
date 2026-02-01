'use client';

import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import {
  Layers,
  BookOpen,
  Wrench,
  Mountain,
  Plus,
  Minus,
  Maximize,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Dynamically import the map component to prevent SSR issues
const LeafletMap = dynamic(() => import('@/components/leaflet-map'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-200 animate-pulse" />,
});

export default function DashboardDevPage() {
  return (
    <TooltipProvider>
      <div className="relative h-[calc(100vh-theme(spacing.16)-2*theme(spacing.6))] w-full overflow-hidden rounded-lg border">
        <LeafletMap />

        {/* Left Toolbar */}
        <aside className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1 rounded-lg bg-background/70 p-1.5 backdrop-blur-sm border border-border/50">
          <LeftToolbarButton tooltip="Layers">
            <Layers />
          </LeftToolbarButton>
          <LeftToolbarButton tooltip="Legend">
            <BookOpen />
          </LeftToolbarButton>
          <LeftToolbarButton tooltip="Tools">
            <Wrench />
          </LeftToolbarButton>
          <LeftToolbarButton tooltip="Basemap">
            <Mountain />
          </LeftToolbarButton>
          <div className="my-1 h-px bg-border/70"></div>
          <LeftToolbarButton tooltip="Zoom In">
            <Plus />
          </LeftToolbarButton>
          <LeftToolbarButton tooltip="Zoom Out">
            <Minus />
          </LeftToolbarButton>
          <LeftToolbarButton tooltip="Fullscreen">
            <Maximize />
          </LeftToolbarButton>
        </aside>
      </div>
    </TooltipProvider>
  );
}

const LeftToolbarButton = ({ children, tooltip }: { children: React.ReactNode, tooltip: string }) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="text-foreground/80 hover:bg-muted/50 hover:text-foreground">
                {children}
            </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-background">
            <p>{tooltip}</p>
        </TooltipContent>
    </Tooltip>
);
