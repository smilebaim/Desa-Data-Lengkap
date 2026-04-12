'use client';

import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Search, Shield, LogIn, HelpCircle, Plus, Minus, Layers, Filter } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import * as LucideIcons from 'lucide-react';
import Link from 'next/link';

// Inisialisasi Peta secara dinamis untuk performa
const LeafletMap = dynamic(() => import('@/components/leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-primary/60 font-medium tracking-[0.2em] uppercase text-[10px]">Loading Interface</p>
      </div>
    </div>
  ),
});

const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return <HelpCircle className={className} />;
  return <IconComponent className={className} />;
};

export default function HomePage() {
  const db = useFirestore();
  const menuQuery = query(collection(db, 'menus'), orderBy('order', 'asc'));
  const { data: menus } = useCollection(menuQuery);

  const leftMenus = (menus || []).filter((m: any) => m.position === 'left');
  const bottomMenus = (menus || []).filter((m: any) => m.position === 'bottom');
  const headerMenus = (menus || []).filter((m: any) => m.position === 'header');

  return (
    <TooltipProvider delayDuration={0}>
      <div className="relative h-[100dvh] w-screen overflow-hidden bg-slate-950 text-white font-body">
        <div className="absolute inset-0 z-0">
          <LeafletMap />
        </div>

        {/* Header Atas */}
        <header className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[5000] w-full max-w-5xl px-4 pointer-events-none">
          <div className="flex items-center justify-between gap-3 pointer-events-auto bg-slate-950/60 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-2xl ring-1 ring-white/10">
            <div className="flex items-center gap-2 sm:gap-3 pl-2">
              <div className="h-7 w-7 sm:h-8 sm:w-8 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
              </div>
              <div className="hidden xs:block">
                <h1 className="text-[10px] sm:text-xs font-bold tracking-tight text-white leading-none">Desa Lengkap</h1>
                <p className="text-[7px] sm:text-[8px] text-primary/80 font-bold uppercase tracking-widest mt-0.5">Geospatial</p>
              </div>
            </div>

            <div className="flex-1 max-w-sm hidden md:flex items-center bg-white/5 border border-white/5 rounded-full px-4 h-9 group transition-all focus-within:bg-white/10 focus-within:border-primary/30">
              <Search className="h-3.5 w-3.5 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Cari desa atau wilayah..." 
                className="bg-transparent text-[11px] font-medium outline-none placeholder:text-slate-600 w-full ml-3"
              />
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 pr-1">
              {headerMenus.map((menu: any) => (
                <Button key={menu.id} variant="ghost" className="h-7 sm:h-8 rounded-full px-2 sm:px-3 text-[9px] sm:text-[10px] font-bold gap-1.5 sm:gap-2 text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                  <DynamicIcon name={menu.icon} className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                  <span className="hidden lg:inline">{menu.label}</span>
                </Button>
              ))}
              <Link href="/login">
                <Button className="h-7 sm:h-8 w-7 sm:w-auto sm:px-4 rounded-full text-[9px] sm:text-[10px] font-bold gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all">
                  <LogIn className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="hidden sm:inline">Masuk</span>
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Toolbar Samping Kiri */}
        <aside className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-[5000] flex flex-col gap-3">
          <div className="flex flex-col gap-1 p-1 bg-slate-950/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl ring-1 ring-white/10">
            {leftMenus.map((menu: any) => (
              <ToolbarButton key={menu.id} tooltip={menu.label}>
                <DynamicIcon name={menu.icon} className="h-4 w-4" />
              </ToolbarButton>
            ))}
            {leftMenus.length === 0 && (
              <ToolbarButton tooltip="Lapisan Peta">
                <Layers className="h-4 w-4 opacity-40" />
              </ToolbarButton>
            )}
          </div>
          
          <div className="flex flex-col gap-1 p-1 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full">
            <ToolbarButton tooltip="Filter Cepat">
              <Filter className="h-4 w-4 text-primary" />
            </ToolbarButton>
          </div>
        </aside>

        {/* Area Navigasi Bawah */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-[5000] w-full max-w-[95vw] sm:max-w-3xl px-4 flex flex-col items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-4 sm:w-8 bg-white/20" />
            <span className="text-[7px] sm:text-[9px] text-white/50 font-bold uppercase tracking-[0.4em] whitespace-nowrap drop-shadow-sm">Indonesian Village Network</span>
            <div className="h-[1px] w-4 sm:w-8 bg-white/20" />
          </div>
          
          <nav className="flex items-center justify-start sm:justify-center gap-1.5 p-1.5 bg-slate-950/60 backdrop-blur-2xl border border-white/15 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 max-w-full overflow-x-auto no-scrollbar">
            {bottomMenus.map((menu: any) => (
              <NavButton key={menu.id} label={menu.label}>
                <DynamicIcon name={menu.icon} className="h-4 w-4 sm:h-5 sm:w-5" />
              </NavButton>
            ))}
            {bottomMenus.length === 0 && (
              <div className="py-2.5 px-10 sm:px-14 text-center">
                <p className="text-[9px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-widest italic whitespace-nowrap opacity-60">Konfigurasi Kosong</p>
              </div>
            )}
          </nav>
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-6 sm:bottom-8 right-3 sm:right-6 z-[5000] flex flex-col gap-2">
          <button className="h-8 w-8 sm:h-10 sm:w-10 bg-slate-950/60 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-all group shadow-2xl ring-1 ring-white/10">
            <Plus className="h-4 w-4 text-white/70 group-hover:text-white" />
          </button>
          <button className="h-8 w-8 sm:h-10 sm:w-10 bg-slate-950/60 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-all group shadow-2xl ring-1 ring-white/10">
            <Minus className="h-4 w-4 text-white/70 group-hover:text-white" />
          </button>
        </div>
      </div>
    </TooltipProvider>
  );
}

function ToolbarButton({ children, tooltip }: { children: React.ReactNode, tooltip: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-slate-400 hover:bg-primary hover:text-white rounded-full transition-all duration-300">
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-slate-950 border-white/10 text-[9px] font-bold uppercase tracking-widest px-2 py-1">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

function NavButton({ children, label }: { children: React.ReactNode, label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" className="flex flex-col items-center justify-center h-10 min-w-[4.5rem] sm:h-12 sm:min-w-[6rem] gap-0.5 sm:gap-1 rounded-full text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-300 group shrink-0 px-2 sm:px-4">
          <div className="transition-transform group-hover:scale-110">
            {children}
          </div>
          <span className="text-[7px] sm:text-[9px] font-bold uppercase tracking-tight opacity-50 group-hover:opacity-100 whitespace-nowrap text-center">
            {label}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-slate-950 border-white/10 mb-4 text-[9px] font-bold uppercase tracking-widest px-2 py-1">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
