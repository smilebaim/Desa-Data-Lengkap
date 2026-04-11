'use client';

import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Search, Shield, LogIn, HelpCircle } from 'lucide-react';
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
        <div className="h-10 w-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-yellow-400/50 font-bold tracking-widest uppercase text-[10px]">Memuat Geospasial...</p>
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
      <div className="relative h-screen w-screen overflow-hidden bg-slate-950 text-white font-body selection:bg-yellow-400 selection:text-slate-900">
        <LeafletMap />

        {/* Header Ramping dengan Efek Glassmorphism */}
        <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent backdrop-blur-[2px]">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-yellow-400 p-1.5 rounded-lg shadow-xl transform transition-transform duration-500 hover:rotate-3">
                 <Shield className="h-5 w-5 text-slate-900" />
              </div>
            </div>
            <div className="drop-shadow-xl">
              <h1 className="text-lg font-black text-white tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Desa Lengkap
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="h-1 w-1 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-[8px] text-yellow-400/80 font-black uppercase tracking-[0.2em]">Integrasi Spasial</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1 bg-slate-900/40 p-1 rounded-full border border-white/5 backdrop-blur-md">
              {headerMenus.map((menu: any) => (
                  <Button key={menu.id} variant="ghost" className="text-white hover:bg-yellow-400 hover:text-slate-900 text-[10px] font-bold gap-2 px-4 h-8 rounded-full transition-all duration-300">
                      <DynamicIcon name={menu.icon} className="h-3.5 w-3.5" />
                      <span>{menu.label}</span>
                  </Button>
              ))}
            </div>
            
            <div className="hidden sm:flex items-center bg-slate-900/60 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/10 group focus-within:border-yellow-400/50 transition-all duration-500">
                <Search className="h-3.5 w-3.5 text-slate-500 group-focus-within:text-yellow-400" />
                <input 
                    type="text" 
                    placeholder="Cari desa..." 
                    className="bg-transparent text-[11px] font-medium outline-none placeholder:text-slate-600 w-32 md:w-48 ml-2.5"
                />
            </div>

            <Link href="/login">
              <Button variant="ghost" size="icon" className="h-9 w-9 bg-slate-900/60 backdrop-blur-xl text-white hover:bg-yellow-400 hover:text-slate-900 rounded-xl transition-all duration-300 border border-white/10 shadow-lg group">
                <LogIn className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Toolbar Samping Ramping */}
        <aside className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5 p-1.5 rounded-xl bg-slate-950/80 backdrop-blur-2xl border border-white/10 shadow-2xl">
            {leftMenus.map((menu: any) => (
                <ToolbarButton key={menu.id} tooltip={menu.label}>
                    <DynamicIcon name={menu.icon} className="h-4 w-4" />
                </ToolbarButton>
            ))}
            {leftMenus.length === 0 && (
              <ToolbarButton tooltip="Belum Ada Alat">
                <LucideIcons.Settings2 className="h-4 w-4 opacity-20" />
              </ToolbarButton>
            )}
          </div>
          
          <div className="flex flex-col gap-1.5 p-1.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/5 shadow-lg">
            <ToolbarButton tooltip="Lapisan Peta">
                <LucideIcons.Layers className="h-4 w-4 text-yellow-400/70" />
            </ToolbarButton>
            <ToolbarButton tooltip="Filter">
                <LucideIcons.Filter className="h-4 w-4 text-yellow-400/70" />
            </ToolbarButton>
          </div>
        </aside>

        {/* Navigasi Utama Bawah Ramping (Compact Dock) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg px-6">
            <div className="mb-4 flex flex-col items-center">
                <div className="px-3 py-1 rounded-full bg-slate-950/40 backdrop-blur-md border border-white/5 inline-block">
                  <p className="text-[7px] text-white/30 font-black tracking-[0.4em] uppercase text-center">
                      Village Network • 2024
                  </p>
                </div>
            </div>
            
            <nav className="flex items-center justify-center gap-1.5 p-1.5 rounded-[24px] bg-slate-950/85 backdrop-blur-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border border-white/10 ring-1 ring-white/5">
                {bottomMenus.map((menu: any) => (
                    <NavButton key={menu.id} label={menu.label}>
                        <DynamicIcon name={menu.icon} className="h-5 w-5" />
                    </NavButton>
                ))}
                {bottomMenus.length === 0 && (
                    <div className="py-2 px-8">
                      <p className="text-[8px] text-slate-600 font-bold uppercase tracking-[0.2em]">
                        Konfigurasi Dasbor
                      </p>
                    </div>
                )}
            </nav>
        </div>

        {/* Zoom Controls Ramping (Kanan Bawah) */}
        <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-1.5">
           <button className="h-8 w-8 bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-lg flex items-center justify-center hover:bg-yellow-400 hover:text-slate-900 transition-all shadow-xl">
              <LucideIcons.Plus className="h-4 w-4" />
           </button>
           <button className="h-8 w-8 bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-lg flex items-center justify-center hover:bg-yellow-400 hover:text-slate-900 transition-all shadow-xl">
              <LucideIcons.Minus className="h-4 w-4" />
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
                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:bg-yellow-400 hover:text-slate-900 transition-all duration-300 rounded-lg group">
                    <div className="group-hover:scale-110 transition-transform duration-200">
                      {children}
                    </div>
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-slate-950 text-white border-white/10 font-bold text-[9px] px-2 py-1 rounded-md tracking-wider uppercase">
                <p>{tooltip}</p>
            </TooltipContent>
        </Tooltip>
    );
}

function NavButton({ children, label }: { children: React.ReactNode, label: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" className="flex flex-col items-center justify-center h-14 min-w-[64px] px-1 gap-1 rounded-[16px] text-slate-400 hover:bg-yellow-400 hover:text-slate-900 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 group-hover:-translate-y-0.5 transition-all duration-300">
                        {children}
                    </div>
                    <span className="relative z-10 text-[8px] font-black uppercase tracking-tight text-center leading-none opacity-60 group-hover:opacity-100 transition-all duration-300">
                      {label}
                    </span>
                </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-slate-950 text-white border-white/10 mb-3 font-bold text-[9px] px-2 py-1 rounded-md tracking-wider uppercase">
                <p>{label}</p>
            </TooltipContent>
        </Tooltip>
    );
}
