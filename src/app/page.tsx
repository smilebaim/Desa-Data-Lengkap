
'use client';

import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Search, Menu, Shield, LogIn } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import * as LucideIcons from 'lucide-react';
import Link from 'next/link';

// Dynamically import the map component to prevent SSR issues
const LeafletMap = dynamic(() => import('@/components/leaflet-map'), {
  ssr: false,
  loading: () => <div className="h-screen w-screen bg-gray-800 animate-pulse" />,
});

// Helper component to render Lucide icons from string name
const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return <LucideIcons.HelpCircle className={className} />;
  return <IconComponent className={className} />;
};

export default function HomePage() {
  const db = useFirestore();
  const menuQuery = query(collection(db, 'menus'), orderBy('order', 'asc'));
  const { data: menus } = useCollection(menuQuery);

  const leftMenus = menus.filter((m: any) => m.position === 'left');
  const bottomMenus = menus.filter((m: any) => m.position === 'bottom');
  const headerMenus = menus.filter((m: any) => m.position === 'header');

  return (
    <TooltipProvider>
      <div className="relative h-screen w-screen overflow-hidden bg-gray-900 text-white font-body">
        <LeafletMap />

        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 bg-blue-950/60 backdrop-blur-sm shadow-lg border-b border-blue-800/30">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 p-1.5 rounded-lg shadow-inner">
               <Shield className="h-7 w-7 text-blue-950" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-tight">Desa Lengkap</h1>
              <p className="text-[10px] text-gray-300 font-medium uppercase tracking-wider">Platform Integrasi Data Desa</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {headerMenus.map((menu: any) => (
                <Button key={menu.id} variant="ghost" className="text-white hover:bg-white/10 hidden md:flex items-center gap-2">
                    <DynamicIcon name={menu.icon} className="h-4 w-4" />
                    <span>{menu.label}</span>
                </Button>
            ))}
            <div className="hidden sm:flex items-center bg-white/10 rounded-full px-3 py-1 border border-white/10">
                <Search className="h-4 w-4 text-gray-300 mr-2" />
                <input 
                    type="text" 
                    placeholder="Cari desa..." 
                    className="bg-transparent text-xs outline-none placeholder:text-gray-400 w-32 focus:w-48 transition-all duration-300"
                />
            </div>
            <Link href="/login">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                <LogIn className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Left Toolbar */}
        <aside className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2 rounded-xl bg-blue-950/80 p-1.5 backdrop-blur-md border border-blue-800/50 shadow-2xl">
          <div className="flex flex-col gap-1">
            {leftMenus.map((menu: any) => (
                <LeftToolbarButton key={menu.id} tooltip={menu.label}>
                    <DynamicIcon name={menu.icon} className="h-5 w-5" />
                </LeftToolbarButton>
            ))}
          </div>
          
          <div className="h-px bg-blue-800/50 mx-2"></div>
          
          <div className="flex flex-col gap-1">
            <LeftToolbarButton tooltip="Zoom In">
                <LucideIcons.Plus className="h-5 w-5" />
            </LeftToolbarButton>
            <LeftToolbarButton tooltip="Zoom Out">
                <LucideIcons.Minus className="h-5 w-5" />
            </LeftToolbarButton>
          </div>
        </aside>

        {/* Bottom Navigation */}
        <footer className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg px-4">
            <nav className="flex items-center justify-around gap-1 rounded-2xl bg-blue-950/85 p-2 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-blue-800/40 overflow-x-auto no-scrollbar">
                {bottomMenus.map((menu: any) => (
                    <BottomNavButton key={menu.id} label={menu.label}>
                        <DynamicIcon name={menu.icon} className="h-5 w-5" />
                    </BottomNavButton>
                ))}
                {bottomMenus.length === 0 && (
                    <div className="text-[10px] text-gray-500 py-2">Navigasi kosong. Gunakan dasbor untuk mengisi.</div>
                )}
            </nav>
            <div className="mt-4 flex flex-col items-center gap-1">
                <p className="text-[10px] text-white/50 font-medium tracking-widest uppercase drop-shadow-md">
                    © 2024 spasial.net
                </p>
                <div className="h-1 w-12 bg-white/20 rounded-full"></div>
            </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}

function LeftToolbarButton({ children, tooltip }: { children: React.ReactNode, tooltip: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-300 hover:bg-blue-600 hover:text-white transition-all duration-200 rounded-lg">
                    {children}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-blue-900 text-white border-blue-700 shadow-xl">
                <p className="text-xs font-semibold">{tooltip}</p>
            </TooltipContent>
        </Tooltip>
    );
}

function BottomNavButton({ children, label }: { children: React.ReactNode, label: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" className="flex flex-col items-center justify-center h-14 min-w-[64px] px-2 gap-1 rounded-xl text-gray-300 hover:bg-blue-600 hover:text-white transition-all duration-300 group">
                    <div className="group-hover:scale-110 transition-transform duration-300">
                        {children}
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-tighter text-center">{label}</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-blue-900 text-white border-blue-700 shadow-xl mb-2">
                <p className="text-xs font-semibold">{label}</p>
            </TooltipContent>
        </Tooltip>
    );
}
