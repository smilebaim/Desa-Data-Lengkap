'use client';

import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Search, Shield, LogIn, HelpCircle, Plus, Minus, Layers, Filter } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import * as LucideIcons from 'lucide-react';
import Link from 'next/link';

// Inisialisasi Peta Leaflet secara dinamis
const LeafletMap = dynamic(() => import('@/components/leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-primary/40 font-bold tracking-widest uppercase text-[9px]">Initializing Engine...</p>
      </div>
    </div>
  ),
});

// Komponen Pembantu Ikon Dinamis
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
    <TooltipProvider>
      <div className="relative h-screen w-screen overflow-hidden bg-slate-950 text-white font-body selection:bg-primary selection:text-primary-foreground">
        <LeafletMap />

        {/* Floating Minimalist Header */}
        <header className="absolute top-5 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-7xl flex items-center justify-between px-5 py-3 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center h-10 w-10 bg-primary rounded-xl shadow-lg shadow-primary/20 transition-transform hover:scale-105">
               <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-base font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500">
                Desa Lengkap
              </h1>
              <p className="text-[9px] text-primary font-bold uppercase tracking-[0.2em] mt-1 opacity-80">Geospatial Platform</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-xl">
              {headerMenus.map((menu: any) => (
                  <Button key={menu.id} variant="ghost" className="text-white hover:bg-white/10 text-[11px] font-bold gap-2 px-4 h-9 rounded-lg transition-all">
                      <DynamicIcon name={menu.icon} className="h-4 w-4 text-primary" />
                      <span>{menu.label}</span>
                  </Button>
              ))}
            </div>
            
            <div className="relative flex items-center bg-white/5 rounded-xl px-4 py-2 border border-white/5 focus-within:border-primary/50 focus-within:bg-white/10 transition-all duration-300">
                <Search className="h-4 w-4 text-slate-500" />
                <input 
                    type="text" 
                    placeholder="Search area..." 
                    className="bg-transparent text-[11px] font-medium outline-none placeholder:text-slate-600 w-32 md:w-48 ml-3"
                />
            </div>

            <Link href="/login">
              <Button variant="ghost" size="icon" className="h-10 w-10 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground rounded-xl transition-all border border-primary/20">
                <LogIn className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Side Toolbar - Vertical Dock */}
        <aside className="absolute left-5 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4">
          <div className="flex flex-col gap-2 p-1.5 rounded-2xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl">
            {leftMenus.map((menu: any) => (
                <ToolbarButton key={menu.id} tooltip={menu.label}>
                    <DynamicIcon name={menu.icon} className="h-4 w-4" />
                </ToolbarButton>
            ))}
            {leftMenus.length === 0 && (
              <ToolbarButton tooltip="Settings">
                <LucideIcons.Settings2 className="h-4 w-4 opacity-30" />
              </ToolbarButton>
            )}
          </div>
          
          <div className="flex flex-col gap-2 p-1.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/5">
            <ToolbarButton tooltip="Map Layers">
                <Layers className="h-4 w-4 text-primary/70" />
            </ToolbarButton>
            <ToolbarButton tooltip="Filters">
                <Filter className="h-4 w-4 text-primary/70" />
            </ToolbarButton>
          </div>
        </aside>

        {/* Bottom Nav - Floating Pill Dock */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg px-6">
            <nav className="flex items-center justify-center gap-1.5 p-1.5 rounded-[28px] bg-slate-900/80 backdrop-blur-3xl shadow-2xl border border-white/10 ring-1 ring-white/5">
                {bottomMenus.map((menu: any) => (
                    <NavButton key={menu.id} label={menu.label}>
                        <DynamicIcon name={menu.icon} className="h-5 w-5" />
                    </NavButton>
                ))}
                {bottomMenus.length === 0 && (
                    <div className="py-2 px-6">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">
                        No Active Menus
                      </p>
                    </div>
                )}
            </nav>
            <div className="mt-4 text-center">
                <span className="text-[8px] text-white/20 font-black tracking-[0.5em] uppercase">
                    Indonesian Village Network • 2024
                </span>
            </div>
        </div>

        {/* Compact Zoom Controls */}
        <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-2">
           <button className="h-10 w-10 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all shadow-xl group">
              <Plus className="h-4 w-4 transition-transform group-active:scale-90" />
           </button>
           <button className="h-10 w-10 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all shadow-xl group">
              <Minus className="h-4 w-4 transition-transform group-active:scale-90" />
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
                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-xl group relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 transition-transform duration-200 group-hover:scale-110">
                      {children}
                    </div>
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-slate-950 text-white border-white/10 font-bold text-[10px] px-3 py-1.5 rounded-lg tracking-widest uppercase">
                <p>{tooltip}</p>
            </TooltipContent>
        </Tooltip>
    );
}

function NavButton({ children, label }: { children: React.ReactNode, label: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" className="flex flex-col items-center justify-center h-14 min-w-[72px] px-2 gap-1 rounded-[22px] text-slate-400 hover:bg-primary hover:text-primary-foreground transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <div className="relative z-10 group-hover:-translate-y-1 transition-all duration-300">
                        {children}
                    </div>
                    <span className="relative z-10 text-[9px] font-black uppercase tracking-tight text-center leading-none opacity-40 group-hover:opacity-100 transition-all duration-300">
                      {label}
                    </span>
                </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-slate-950 text-white border-white/10 mb-4 font-bold text-[10px] px-3 py-1.5 rounded-lg tracking-widest uppercase">
                <p>{label}</p>
            </TooltipContent>
        </Tooltip>
    );
}