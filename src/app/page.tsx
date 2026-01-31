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
  Search,
  Menu,
  User,
  LayoutGrid,
  Building2,
  Landmark,
  BarChart,
  Shield,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Dynamically import the map component to prevent SSR issues
const SatelliteMap = dynamic(() => import('@/components/satellite-map'), {
  ssr: false,
  loading: () => <div className="h-screen w-screen bg-gray-800 animate-pulse" />,
});

export default function HomePage() {
  return (
    <TooltipProvider>
      <div className="relative h-screen w-screen overflow-hidden bg-gray-900 text-white">
        <SatelliteMap />

        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 bg-blue-950/60 backdrop-blur-sm shadow-lg">
          <div className="flex items-center gap-3">
            <Shield className="h-10 w-10 text-yellow-400" />
            <div>
              <h1 className="text-lg font-bold text-white">Desa Remau Bako Tuo</h1>
              <p className="text-xs text-gray-200">Kabupaten Tanjung Jabung Timur</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Left Toolbar */}
        <aside className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1 rounded-lg bg-blue-950/70 p-1.5 backdrop-blur-sm border border-blue-800/50">
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
          <div className="my-1 h-px bg-blue-800/70"></div>
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

        {/* Bottom Navigation & Footer */}
        <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-full px-4">
            <p className="mb-2 text-center text-xs text-gray-200 drop-shadow-[0_1px_1px_rgba(0,0,0,0.7)]">
                ©2024 spasial.net
            </p>
            <nav className="flex items-center justify-center gap-2 rounded-full bg-blue-950/70 p-2 backdrop-blur-sm shadow-2xl max-w-md mx-auto border border-blue-800/50">
                <BottomNavButton tooltip="Profil">
                    <User className="h-5 w-5" />
                    <span className="text-[10px] mt-0.5">Profil</span>
                </BottomNavButton>
                <BottomNavButton tooltip="Tata Ruang">
                    <LayoutGrid className="h-5 w-5" />
                    <span className="text-[10px] mt-0.5">Tata Ruang</span>
                </BottomNavButton>
                <BottomNavButton tooltip="Pembangunan">
                    <Building2 className="h-5 w-5" />
                    <span className="text-[10px] mt-0.5">Pembangunan</span>
                </BottomNavButton>
                <BottomNavButton tooltip="Dana Desa">
                    <Landmark className="h-5 w-5" />
                    <span className="text-[10px] mt-0.5">Dana Desa</span>
                </BottomNavButton>
                 <BottomNavButton tooltip="Indeks">
                    <BarChart className="h-5 w-5" />
                    <span className="text-[10px] mt-0.5">Indeks</span>
                </BottomNavButton>
            </nav>
        </footer>
      </div>
    </TooltipProvider>
  );
}

const LeftToolbarButton = ({ children, tooltip }: { children: React.ReactNode, tooltip: string }) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-200 hover:bg-white/10 hover:text-white">
                {children}
            </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-gray-800 text-white border-gray-700">
            <p>{tooltip}</p>
        </TooltipContent>
    </Tooltip>
);

const BottomNavButton = ({ children, tooltip }: { children: React.ReactNode, tooltip: string }) => (
     <Tooltip>
        <TooltipTrigger asChild>
            <Button variant="ghost" className="flex flex-col items-center h-auto px-3 py-1 gap-0.5 rounded-full text-gray-300 hover:bg-white/10 hover:text-white">
                {children}
            </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-800 text-white border-gray-700">
            <p>{tooltip}</p>
        </TooltipContent>
    </Tooltip>
);
