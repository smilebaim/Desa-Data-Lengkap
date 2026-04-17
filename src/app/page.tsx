
'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { 
  Search, Shield, LogIn, HelpCircle, Plus, Minus, Layers, Filter, 
  LayoutDashboard, X, ChevronRight, MapPin, Landmark, BarChart3, 
  Users, Coins, TrendingUp, Info, Globe, FileText, Zap, Compass, RefreshCw,
  Navigation, Eye, EyeOff, Construction, TreePine, Droplets, ZapOff
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFirestore, useCollection, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import * as LucideIcons from 'lucide-react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, Radar, RadarChart, PolarGrid, PolarAngleAxis, LineChart, Line
} from 'recharts';

const CHART_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Inisialisasi Peta secara dinamis
const LeafletMap = dynamic(() => import('@/components/leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-primary/60 font-medium tracking-[0.2em] uppercase text-[10px]">Memuat Antarmuka...</p>
      </div>
    </div>
  ),
});

const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return <HelpCircle className={className} />;
  return <IconComponent className={className} />;
};

const MiniChart = ({ config, data }: { config: any, data: any[] }) => {
  if (!config || !data.length) return null;
  const metric = config.metric || 'population';
  const type = config.chartType || 'bar';

  return (
    <div className="h-56 w-full my-6 bg-slate-50 p-4 rounded-3xl border border-slate-100 shadow-inner overflow-hidden">
      <p className="text-[9px] font-black uppercase text-slate-400 mb-4 tracking-widest">{config.title}</p>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" hide />
            <Bar dataKey={metric} radius={[4, 4, 0, 0]}>
              {data.map((_, index) => <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
            </Bar>
          </BarChart>
        ) : type === 'pie' ? (
          <PieChart>
            <Pie data={data} dataKey={metric} nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={40}>
              {data.map((_, index) => <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
            </Pie>
          </PieChart>
        ) : type === 'radar' ? (
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" fontSize={8} />
            <Radar name={metric} dataKey={metric} stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
          </RadarChart>
        ) : (
          <LineChart data={data}>
            <Line type="monotone" dataKey={metric} stroke="#22c55e" strokeWidth={2} dot={false} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default function HomePage() {
  const db = useFirestore();
  const { user, isLoading: isAuthLoading } = useUser();
  const [showVillages, setShowVillages] = useState(true);
  
  // State untuk Panel Samping
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: 'page' | 'village' | 'feature', id: string } | null>(null);

  const menuQuery = useMemo(() => query(collection(db, 'menus'), orderBy('order', 'asc')), [db]);
  const { data: menus } = useCollection(menuQuery);

  const villageQuery = useMemo(() => query(collection(db, 'villages'), orderBy('name', 'asc')), [db]);
  const { data: villages } = useCollection(villageQuery);

  const { data: visualizers } = useCollection(query(collection(db, 'visualizers')));

  const leftMenus = useMemo(() => (menus || []).filter((m: any) => m.position === 'left'), [menus]);
  const bottomMenus = useMemo(() => (menus || []).filter((m: any) => m.position === 'bottom'), [menus]);
  const headerMenus = useMemo(() => (menus || []).filter((m: any) => m.position === 'header'), [menus]);

  const selectedDocRef = useMemo(() => {
    if (!selectedItem) return null;
    const collectionName = selectedItem.type === 'page' ? 'pages' : selectedItem.type === 'village' ? 'villages' : 'features';
    return doc(db, collectionName, selectedItem.id);
  }, [selectedItem, db]);

  const { data: itemDetail, isLoading: isDetailLoading } = useDoc(selectedDocRef);

  const statsData = useMemo(() => {
    if (!villages) return [];
    return villages.map(v => ({
      name: v.name,
      population: v.population || 0,
      area: v.area || 0,
      idmScore: v.idmScore || 0,
      budgetAllocation: v.budgetAllocation || 0
    }));
  }, [villages]);

  const handleSelectItem = (type: 'page' | 'village' | 'feature', id: string) => {
    setSelectedItem({ type, id });
    setPanelOpen(true);
  };

  const renderContentWithCharts = (content: string) => {
    if (!content) return null;
    const parts = content.split(/(\[CHART:[a-zA-Z0-9_-]+\])/g);
    
    return parts.map((part, index) => {
      const match = part.match(/\[CHART:([a-zA-Z0-9_-]+)\]/);
      if (match) {
        const chartId = match[1];
        const config = visualizers?.find(v => v.id === chartId);
        return config ? <MiniChart key={index} config={config} data={statsData} /> : null;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handleResetMap = () => {
    window.location.reload();
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="relative h-[100dvh] w-screen overflow-hidden bg-slate-950 text-white font-body selection:bg-primary/30">
        <div className="absolute inset-0 z-0">
          <LeafletMap 
            villages={villages} 
            showVillages={showVillages} 
            onSelectVillage={(id) => handleSelectItem('village', id)}
            onSelectFeature={(id) => handleSelectItem('feature', id)}
          />
        </div>

        {/* Header Atas */}
        <header className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[5000] w-full max-w-5xl px-4 pointer-events-none">
          <div className="flex items-center justify-between gap-1.5 sm:gap-3 pointer-events-auto bg-slate-950/70 backdrop-blur-3xl border border-white/10 p-1 rounded-full shadow-2xl ring-1 ring-white/10">
            <div className="flex items-center gap-2 pl-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 sm:h-8 sm:w-8 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                  <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
                </div>
                <div className="hidden lg:block text-left">
                  <h1 className="text-[10px] sm:text-xs font-bold tracking-tight text-white leading-none">Desa Lengkap</h1>
                  <p className="text-[7px] sm:text-[8px] text-primary/80 font-bold uppercase tracking-widest mt-0.5">Sistem Informasi Spasial</p>
                </div>
              </div>
            </div>

            <div className="flex-1 flex items-center bg-white/5 border border-white/5 rounded-full px-3 h-8 sm:h-9 group transition-all focus-within:bg-white/10 focus-within:border-primary/30 mx-1 max-w-[140px] xs:max-w-[180px] sm:max-w-xs md:max-w-sm lg:max-w-md">
              <Search className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-500 group-focus-within:text-primary transition-colors shrink-0" />
              <input 
                type="text" 
                placeholder="Cari wilayah atau aset..." 
                className="bg-transparent text-[9px] sm:text-[11px] font-medium outline-none placeholder:text-slate-600 w-full ml-1.5 sm:ml-3"
              />
            </div>

            <div className="flex items-center gap-1 pr-1">
              {headerMenus.map((menu: any) => (
                <Button 
                  key={menu.id}
                  variant="ghost" 
                  onClick={() => {
                    if (menu.href?.startsWith('/p/')) {
                      handleSelectItem('page', menu.href.replace('/p/', ''));
                    } else if (menu.href?.startsWith('/visualizations')) {
                       window.open('/visualizations', '_blank');
                    }
                  }}
                  className="h-7 sm:h-8 rounded-full px-1.5 sm:px-3 text-[9px] sm:text-[10px] font-bold gap-1 sm:gap-2 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                >
                  <DynamicIcon name={menu.icon} className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                  <span className="hidden md:inline">{menu.label}</span>
                </Button>
              ))}
              
              {!isAuthLoading && (
                <Link href={user ? "/dashboard" : "/login"}>
                  <Button className="h-7 sm:h-8 w-7 sm:w-auto sm:px-4 rounded-full text-[9px] sm:text-[10px] font-bold gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all">
                    {user ? <LayoutDashboard className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : <LogIn className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                    <span className="hidden sm:inline">{user ? "Dasbor" : "Masuk"}</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Toolbar Samping Kiri (Kontrol Peta Atraktif) */}
        <aside className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-[5000] flex flex-col gap-5">
          {/* Kelompok Kontrol Lapisan & Visibilitas */}
          <div className="flex flex-col gap-1.5 p-1.5 bg-slate-950/70 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_15px_35px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
            <ToolbarButton 
              tooltip={showVillages ? "Sembunyikan Batas Desa" : "Tampilkan Batas Desa"}
              onClick={() => setShowVillages(!showVillages)}
              className={showVillages ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "text-white/60"}
            >
              {showVillages ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </ToolbarButton>
            
            <Separator className="bg-white/5 mx-2 my-0.5" />

            <ToolbarButton tooltip="Fasilitas Umum" className="text-blue-400 hover:bg-blue-500/10">
              <Landmark className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton tooltip="Infrastruktur Jalan" className="text-amber-400 hover:bg-amber-500/10">
              <Construction className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton tooltip="Potensi Alam" className="text-green-400 hover:bg-green-500/10">
              <TreePine className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Kelompok Alat & Navigasi */}
          <div className="flex flex-col gap-1.5 p-1.5 bg-slate-950/70 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_15px_35px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
            <ToolbarButton tooltip="Fokus Indonesia" onClick={handleResetMap} className="text-slate-300 hover:text-primary">
              <Compass className="h-4 w-4" />
            </ToolbarButton>
            <Separator className="bg-white/5 mx-2 my-0.5" />
            <ToolbarButton tooltip="Perbesar" className="hover:bg-white/10">
              <Plus className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton tooltip="Perkecil" className="hover:bg-white/10">
              <Minus className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Kelompok Menu Dinamis Kiri */}
          {leftMenus.length > 0 && (
            <div className="flex flex-col gap-1.5 p-1.5 bg-slate-950/70 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_15px_35px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
              {leftMenus.map((menu: any) => (
                <ToolbarButton 
                  key={menu.id} 
                  tooltip={menu.label}
                  onClick={() => {
                    if (menu.href?.startsWith('/p/')) {
                      handleSelectItem('page', menu.href.replace('/p/', ''));
                    }
                  }}
                >
                  <DynamicIcon name={menu.icon} className="h-4 w-4" />
                </ToolbarButton>
              ))}
            </div>
          )}

          {/* Tombol Help / Informasi */}
          <div className="flex flex-col gap-1.5 p-1.5 bg-slate-950/70 backdrop-blur-3xl border border-white/10 rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
            <ToolbarButton tooltip="Pusat Bantuan" className="text-slate-400 hover:text-white">
              <HelpCircle className="h-4 w-4" />
            </ToolbarButton>
          </div>
        </aside>

        {/* Dock Navigasi Bawah */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-[5000] w-full max-w-[95vw] sm:max-w-3xl px-4 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-[1px] w-4 sm:w-8 bg-white/20" />
            <span className="text-[7px] sm:text-[8px] text-white/50 font-black uppercase tracking-[0.5em] whitespace-nowrap drop-shadow-sm">Jaringan Spasial Desa Nasional</span>
            <div className="h-[1px] w-4 sm:w-8 bg-white/20" />
          </div>
          
          <nav className="flex items-center justify-start sm:justify-center gap-1.5 p-1.5 bg-slate-950/70 backdrop-blur-3xl border border-white/15 rounded-full shadow-[0_25px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/10 max-w-full overflow-x-auto no-scrollbar">
            {bottomMenus.map((menu: any) => (
              <NavButton 
                key={menu.id} 
                label={menu.label}
                onClick={() => {
                  if (menu.href?.startsWith('/p/')) {
                    handleSelectItem('page', menu.href.replace('/p/', ''));
                  } else if (menu.href?.startsWith('/visualizations')) {
                    window.open('/visualizations', '_blank');
                  }
                }}
              >
                <DynamicIcon name={menu.icon} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </NavButton>
            ))}
          </nav>
        </div>

        {/* Right Side Panel Popup */}
        <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
          <SheetContent side="right" className="w-full sm:max-w-xl p-0 border-none bg-white overflow-hidden shadow-2xl">
            <ScrollArea className="h-full">
              {isDetailLoading ? (
                <div className="flex h-screen items-center justify-center bg-white">
                  <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : itemDetail ? (
                <div className="flex flex-col h-full animate-in fade-in duration-500">
                  <div className="relative h-48 bg-slate-950 shrink-0">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=2013')] bg-cover bg-center grayscale" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
                    <div className="absolute bottom-6 left-8 right-8 z-10 text-left">
                      <div className="flex flex-col gap-2">
                        <Badge className="w-fit bg-primary tracking-[0.2em] text-[8px] uppercase font-black px-3 py-1">
                          {selectedItem?.type === 'village' ? 'Profil Wilayah' : selectedItem?.type === 'page' ? 'Informasi Publik' : 'Aset Spasial'}
                        </Badge>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">{itemDetail.name || itemDetail.title}</h2>
                        {itemDetail.province && <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{itemDetail.province}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="px-8 py-10 space-y-8 text-left">
                    {(selectedItem?.type === 'village' || itemDetail.showStats) && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 flex flex-col gap-3">
                           <div className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm"><Users className="h-5 w-5" /></div>
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Populasi</p>
                              <p className="text-lg font-bold text-slate-800">{(itemDetail.population || statsData.reduce((a,b) => a+b.population,0)).toLocaleString()} <span className="text-[10px] opacity-40">Jiwa</span></p>
                           </div>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 flex flex-col gap-3">
                           <div className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm"><TrendingUp className="h-5 w-5" /></div>
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Skor IDM</p>
                              <p className="text-lg font-bold text-slate-800">{(itemDetail.idmScore || 0.85).toFixed(2)}</p>
                           </div>
                        </div>
                      </div>
                    )}

                    <div className="prose prose-slate max-w-none">
                       <div className="whitespace-pre-line text-slate-600 leading-relaxed font-medium">
                         {renderContentWithCharts(itemDetail.content || itemDetail.description)}
                       </div>
                    </div>

                    {selectedItem?.type === 'village' && itemDetail.potentials?.length > 0 && (
                      <div className="space-y-4 pt-4">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                           <Zap className="h-3 w-3 text-primary" /> Potensi Wilayah
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {itemDetail.potentials.map((pot: string, i: number) => (
                            <Badge key={i} variant="outline" className="rounded-full border-slate-200 text-slate-500 font-bold text-[9px] uppercase px-3 py-1">{pot}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator className="bg-slate-100" />

                    <div className="pt-6 pb-10 flex flex-col gap-4">
                       <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em] text-center">Data Terverifikasi Nasional © 2024</p>
                       <Button 
                         variant="outline" 
                         className="w-full rounded-2xl h-12 gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                         onClick={() => setPanelOpen(false)}
                       >
                         Tutup Panel
                       </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-screen flex-col items-center justify-center p-12 text-center gap-4">
                  <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                    <Info className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Konten Tidak Tersedia</h3>
                  <p className="text-sm text-slate-500">Maaf, terjadi kesalahan saat memuat data atau data tidak ditemukan.</p>
                  <Button onClick={() => setPanelOpen(false)} className="rounded-full">Kembali ke Peta</Button>
                </div>
              )}
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  );
}

function ToolbarButton({ children, tooltip, onClick, className }: { children: React.ReactNode, tooltip: string, onClick?: () => void, className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClick}
          className={`h-9 w-9 sm:h-10 sm:w-10 text-slate-400 hover:bg-white/10 hover:text-white rounded-2xl transition-all duration-300 group ${className}`}
        >
          <div className="transition-transform duration-300 group-hover:scale-110">
            {children}
          </div>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-slate-950 border-white/10 text-[9px] font-bold uppercase tracking-widest px-2 py-1 z-[10000]">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

function NavButton({ children, label, onClick }: { children: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="ghost" 
          onClick={onClick}
          className="flex items-center justify-center h-9 px-4 sm:h-10 sm:px-6 gap-3 rounded-full text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-300 group shrink-0"
        >
          <div className="transition-transform group-hover:scale-110 text-primary">
            {children}
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest opacity-80 group-hover:opacity-100 whitespace-nowrap">
            {label}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-slate-950 border-white/10 mb-4 text-[9px] font-bold uppercase tracking-widest px-2 py-1 z-[10000]">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
