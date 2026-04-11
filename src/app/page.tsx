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
  loading: () => <div className="h-screen w-screen bg-slate-900 flex items-center justify-center text-white/20">Memuat Geospasial...</div>,
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

  const leftMenus = menus.filter((m: any) => m.position === 'left');
  const bottomMenus = menus.filter((m: any) => m.position === 'bottom');
  const headerMenus = menus.filter((m: any) => m.position === 'header');

  return (
    <TooltipProvider>
      <div className="relative h-screen w-screen overflow-hidden bg-slate-950 text-white font-body selection:bg-yellow-400 selection:text-slate-900">
        <LeafletMap />

        {/* Header Transparan */}
        <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-slate-900/80 to-transparent backdrop-blur-[2px]">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-400 p-2 rounded-xl shadow-lg shadow-yellow-400/20 transform hover:scale-105 transition-transform">
               <Shield className="h-8 w-8 text-slate-900" />
            </div>
            <div className="drop-shadow-md">
              <h1 className="text-xl font-bold text-white tracking-tight leading-none">Desa Lengkap</h1>
              <p className="text-[10px] text-yellow-400/80 font-bold uppercase tracking-[0.2em] mt-1">Sistem Integrasi Spasial</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1">
              {headerMenus.map((menu: any) => (
                  <Button key={menu.id} variant="ghost" className="text-white hover:bg-white/10 text-xs font-semibold gap-2 px-4 rounded-full">
                      <DynamicIcon name={menu.icon} className="h-4 w-4" />
                      <span>{menu.label}</span>
                  </Button>
              ))}
            </div>
            
            <div className="hidden sm:flex items-center bg-slate-900/60 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 group focus-within:border-yellow-400/50 transition-all">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-yellow-400 mr-2 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Cari koordinat desa..." 
                    className="bg-transparent text-xs outline-none placeholder:text-slate-500 w-32 md:w-48"
                />
            </div>

            <Link href="/login">
              <Button variant="ghost" size="icon" className="text-white hover:bg-yellow-400 hover:text-slate-900 rounded-full transition-all border border-white/5">
                <LogIn className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Bilah Alat Samping (Kiri) */}
        <aside className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3 rounded-2xl bg-slate-900/80 p-2 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="flex flex-col gap-1.5">
            {leftMenus.map((menu: any) => (
                <ToolbarButton key={menu.id} tooltip={menu.label}>
                    <DynamicIcon name={menu.icon} className="h-5 w-5" />
                </ToolbarButton>
            ))}
            {leftMenus.length === 0 && (
              <ToolbarButton tooltip="Admin Only">
                <LucideIcons.Settings2 className="h-5 w-5 opacity-20" />
              </ToolbarButton>
            )}
          </div>
          
          <div className="h-px bg-white/10 mx-2"></div>
          
          <div className="flex flex-col gap-1.5 text-yellow-400/70">
            <ToolbarButton tooltip="Lapisan Peta">
                <LucideIcons.Layers className="h-5 w-5" />
            </ToolbarButton>
            <ToolbarButton tooltip="Filter Data">
                <LucideIcons.Filter className="h-5 w-5" />
            </ToolbarButton>
          </div>
        </aside>

        {/* Navigasi Utama (Bawah) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-6">
            <nav className="flex items-center justify-center gap-2 rounded-3xl bg-slate-900/90 p-2 backdrop-blur-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden">
                {bottomMenus.map((menu: any) => (
                    <NavButton key={menu.id} label={menu.label}>
                        <DynamicIcon name={menu.icon} className="h-5 w-5" />
                    </NavButton>
                ))}
                {bottomMenus.length === 0 && (
                    <div className="text-[10px] text-slate-500 font-bold py-3 uppercase tracking-widest px-8">
                      Konfigurasi Navigasi di Dasbor
                    </div>
                )}
            </nav>
            <div className="mt-6 flex flex-col items-center gap-2">
                <p className="text-[10px] text-white/30 font-bold tracking-[0.3em] uppercase drop-shadow-md">
                    Indonesian Village Network • 2024
                </p>
            </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function ToolbarButton({ children, tooltip }: { children: React.ReactNode, tooltip: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-11 w-11 text-slate-400 hover:bg-yellow-400 hover:text-slate-900 transition-all duration-300 rounded-xl">
                    {children}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-slate-900 text-white border-white/10 shadow-2xl font-bold text-xs px-3">
                <p>{tooltip}</p>
            </TooltipContent>
        </Tooltip>
    );
}

function NavButton({ children, label }: { children: React.ReactNode, label: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" className="flex flex-col items-center justify-center h-16 min-w-[80px] px-3 gap-1.5 rounded-2xl text-slate-400 hover:bg-yellow-400 hover:text-slate-900 transition-all duration-300 group">
                    <div className="group-hover:scale-110 group-hover:-translate-y-0.5 transition-all duration-300">
                        {children}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tighter text-center leading-none">{label}</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-slate-900 text-white border-white/10 shadow-2xl mb-3 font-bold text-xs">
                <p>{label}</p>
            </TooltipContent>
        </Tooltip>
    );
}