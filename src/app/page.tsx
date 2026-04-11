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
        <div className="h-12 w-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-yellow-400/50 font-bold tracking-widest uppercase text-xs">Memuat Geospasial...</p>
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

        {/* Header Modern dengan Efek Glassmorphism */}
        <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-5 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent backdrop-blur-[4px]">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-yellow-400 p-2.5 rounded-xl shadow-2xl transform transition-transform duration-500 hover:rotate-6">
                 <Shield className="h-7 w-7 text-slate-900" />
              </div>
            </div>
            <div className="drop-shadow-2xl">
              <h1 className="text-2xl font-black text-white tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Desa Lengkap
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-[10px] text-yellow-400/90 font-black uppercase tracking-[0.25em]">Sistem Integrasi Spasial</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/40 p-1 rounded-full border border-white/5 backdrop-blur-md">
              {headerMenus.map((menu: any) => (
                  <Button key={menu.id} variant="ghost" className="text-white hover:bg-yellow-400 hover:text-slate-900 text-xs font-bold gap-2 px-5 h-9 rounded-full transition-all duration-300">
                      <DynamicIcon name={menu.icon} className="h-4 w-4" />
                      <span>{menu.label}</span>
                  </Button>
              ))}
            </div>
            
            <div className="hidden sm:flex items-center bg-slate-900/60 backdrop-blur-xl rounded-2xl px-5 py-2.5 border border-white/10 group focus-within:border-yellow-400/50 focus-within:ring-4 focus-within:ring-yellow-400/10 transition-all duration-500">
                <Search className="h-4 w-4 text-slate-500 group-focus-within:text-yellow-400 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Cari desa atau koordinat..." 
                    className="bg-transparent text-xs font-medium outline-none placeholder:text-slate-600 w-36 md:w-56 ml-3"
                />
            </div>

            <Link href="/login">
              <Button variant="ghost" size="icon" className="h-11 w-11 bg-slate-900/60 backdrop-blur-xl text-white hover:bg-yellow-400 hover:text-slate-900 rounded-2xl transition-all duration-300 border border-white/10 shadow-xl group">
                <LogIn className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Toolbar Samping (Floating Toolset) */}
        <aside className="absolute left-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4">
          <div className="flex flex-col gap-2 p-2 rounded-2xl bg-slate-950/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {leftMenus.map((menu: any) => (
                <ToolbarButton key={menu.id} tooltip={menu.label}>
                    <DynamicIcon name={menu.icon} className="h-5 w-5" />
                </ToolbarButton>
            ))}
            {leftMenus.length === 0 && (
              <ToolbarButton tooltip="Admin Panel">
                <LucideIcons.Settings2 className="h-5 w-5 opacity-30" />
              </ToolbarButton>
            )}
          </div>
          
          <div className="flex flex-col gap-2 p-2 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/5 shadow-xl">
            <ToolbarButton tooltip="Lapisan Peta">
                <LucideIcons.Layers className="h-5 w-5 text-yellow-400/80" />
            </ToolbarButton>
            <ToolbarButton tooltip="Filter Data">
                <LucideIcons.Filter className="h-5 w-5 text-yellow-400/80" />
            </ToolbarButton>
          </div>
        </aside>

        {/* Navigasi Utama Bawah (Dock-Style) */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-8">
            <div className="mb-6 flex flex-col items-center">
                <div className="px-4 py-1.5 rounded-full bg-slate-950/40 backdrop-blur-md border border-white/5 inline-block">
                  <p className="text-[9px] text-white/40 font-black tracking-[0.4em] uppercase text-center">
                      Indonesian Village Network • 2024
                  </p>
                </div>
            </div>
            
            <nav className="flex items-center justify-center gap-3 p-2.5 rounded-[32px] bg-slate-950/80 backdrop-blur-3xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.9)] border border-white/10 ring-1 ring-white/5 transition-all duration-500 hover:border-white/20">
                {bottomMenus.map((menu: any) => (
                    <NavButton key={menu.id} label={menu.label}>
                        <DynamicIcon name={menu.icon} className="h-6 w-6" />
                    </NavButton>
                ))}
                {bottomMenus.length === 0 && (
                    <div className="py-4 px-12">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] animate-pulse">
                        Menunggu Konfigurasi Dasbor
                      </p>
                    </div>
                )}
            </nav>
        </div>

        {/* Zoom Controls Custom (Kanan Bawah) */}
        <div className="absolute bottom-10 right-8 z-20 flex flex-col gap-2">
           <button className="h-10 w-10 bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center hover:bg-yellow-400 hover:text-slate-900 transition-all shadow-2xl">
              <LucideIcons.Plus className="h-5 w-5" />
           </button>
           <button className="h-10 w-10 bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center hover:bg-yellow-400 hover:text-slate-900 transition-all shadow-2xl">
              <LucideIcons.Minus className="h-5 w-5" />
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
                <Button variant="ghost" size="icon" className="h-12 w-12 text-slate-400 hover:bg-yellow-400 hover:text-slate-900 transition-all duration-500 rounded-2xl hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] group">
                    <div className="group-hover:scale-110 transition-transform duration-300">
                      {children}
                    </div>
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-slate-950 text-white border-white/10 shadow-2xl font-bold text-[10px] px-3 py-1.5 rounded-lg tracking-wider uppercase translate-x-2">
                <p>{tooltip}</p>
            </TooltipContent>
        </Tooltip>
    );
}

function NavButton({ children, label }: { children: React.ReactNode, label: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" className="flex flex-col items-center justify-center h-20 min-w-[90px] px-2 gap-2 rounded-[24px] text-slate-400 hover:bg-yellow-400 hover:text-slate-900 transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500 ease-out">
                        {children}
                    </div>
                    <span className="relative z-10 text-[9px] font-black uppercase tracking-tighter text-center leading-none opacity-70 group-hover:opacity-100 transition-all duration-500">
                      {label}
                    </span>
                </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-slate-950 text-white border-white/10 shadow-2xl mb-4 font-bold text-[10px] px-3 py-1.5 rounded-lg tracking-wider uppercase">
                <p>{label}</p>
            </TooltipContent>
        </Tooltip>
    );
}
