
'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { 
  Search, Shield, LogIn, HelpCircle, Plus, Minus, Landmark, 
  LayoutDashboard, X, MapPin, BarChart3, 
  Users, TrendingUp, Info, Zap, Compass, 
  Navigation, Eye, EyeOff, Construction, TreePine, Sparkles, Loader2, BrainCircuit
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFirestore, useCollection, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import * as LucideIcons from 'lucide-react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BarChart, Bar, XAxis, CartesianGrid, ResponsiveContainer, Cell, PieChart, Pie, Radar, RadarChart, PolarGrid, PolarAngleAxis, LineChart, Line
} from 'recharts';
import { analyzeVillagePerformance, type AnalyzeVillageOutput } from '@/ai';

const CHART_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: 'page' | 'village' | 'feature', id: string } | null>(null);
  
  // State untuk Analisis AI
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AnalyzeVillageOutput | null>(null);

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
    setAiAnalysisResult(null);
    setPanelOpen(true);
  };

  const runAiAnalysis = async () => {
    if (!itemDetail || isAiAnalyzing) return;
    setIsAiAnalyzing(true);
    try {
      const result = await analyzeVillagePerformance({
        name: itemDetail.name,
        idmScore: itemDetail.idmScore || 0,
        budget: itemDetail.budgetAllocation || 0,
        potentials: itemDetail.potentials
      });
      setAiAnalysisResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiAnalyzing(false);
    }
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
              <div className="h-7 w-7 sm:h-8 sm:w-8 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
              </div>
              <div className="hidden lg:block text-left">
                <h1 className="text-[10px] sm:text-xs font-bold tracking-tight text-white leading-none">Desa Lengkap</h1>
                <p className="text-[7px] sm:text-[8px] text-primary/80 font-bold uppercase tracking-widest mt-0.5">Informasi Spasial Nasional</p>
              </div>
            </div>

            <div className="flex-1 flex items-center bg-white/5 border border-white/5 rounded-full px-3 h-8 sm:h-9 group transition-all focus-within:bg-white/10 focus-within:border-primary/30 mx-2 max-w-md">
              <Search className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-500 group-focus-within:text-primary transition-colors shrink-0" />
              <input type="text" placeholder="Cari wilayah..." className="bg-transparent text-[9px] sm:text-[11px] font-medium outline-none placeholder:text-slate-600 w-full ml-1.5 sm:ml-3" />
            </div>

            <div className="flex items-center gap-1 pr-1">
              {headerMenus.map((menu: any) => (
                <Button key={menu.id} variant="ghost" onClick={() => menu.href?.startsWith('/p/') ? handleSelectItem('page', menu.href.replace('/p/', '')) : window.open(menu.href, '_blank')} className="h-7 sm:h-8 rounded-full px-2 sm:px-4 text-[9px] sm:text-[10px] font-bold gap-2 text-slate-300 hover:bg-white/10">
                  <DynamicIcon name={menu.icon} className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                  <span className="hidden md:inline">{menu.label}</span>
                </Button>
              ))}
              {!isAuthLoading && (
                <Link href={user ? "/dashboard" : "/login"}>
                  <Button className="h-7 sm:h-8 px-4 rounded-full text-[9px] sm:text-[10px] font-bold gap-2 bg-primary">
                    {user ? <LayoutDashboard className="h-3 w-3" /> : <LogIn className="h-3 w-3" />}
                    <span>{user ? "Dasbor" : "Masuk"}</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Toolbar Kiri */}
        <aside className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-[5000] flex flex-col gap-5">
          <div className="flex flex-col gap-1.5 p-1.5 bg-slate-950/70 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl ring-1 ring-white/10">
            <ToolbarButton tooltip={showVillages ? "Sembunyikan Batas" : "Tampilkan Batas"} onClick={() => setShowVillages(!showVillages)} className={showVillages ? "bg-primary text-primary-foreground" : "text-white/60"}>
              {showVillages ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </ToolbarButton>
            <Separator className="bg-white/5 mx-2 my-0.5" />
            <ToolbarButton tooltip="Fasilitas" className="text-blue-400"><Landmark className="h-4 w-4" /></ToolbarButton>
            <ToolbarButton tooltip="Infrastruktur" className="text-amber-400"><Construction className="h-4 w-4" /></ToolbarButton>
            <ToolbarButton tooltip="Alam" className="text-green-400"><TreePine className="h-4 w-4" /></ToolbarButton>
          </div>
          <div className="flex flex-col gap-1.5 p-1.5 bg-slate-950/70 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl ring-1 ring-white/10">
            <ToolbarButton tooltip="Fokus Utama" onClick={() => window.location.reload()}><Compass className="h-4 w-4" /></ToolbarButton>
            <Separator className="bg-white/5 mx-2 my-0.5" />
            <ToolbarButton tooltip="Perbesar"><Plus className="h-4 w-4" /></ToolbarButton>
            <ToolbarButton tooltip="Perkecil"><Minus className="h-4 w-4" /></ToolbarButton>
          </div>
        </aside>

        {/* Dock Bawah */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[5000] flex flex-col items-center gap-3">
          <span className="text-[7px] text-white/40 font-black uppercase tracking-[0.5em]">Jaringan Spasial Desa</span>
          <nav className="flex items-center gap-1.5 p-1.5 bg-slate-950/70 backdrop-blur-3xl border border-white/15 rounded-full shadow-2xl ring-1 ring-white/10 overflow-x-auto no-scrollbar max-w-[90vw]">
            {bottomMenus.map((menu: any) => (
              <NavButton key={menu.id} label={menu.label} onClick={() => menu.href?.startsWith('/p/') ? handleSelectItem('page', menu.href.replace('/p/', '')) : window.open(menu.href, '_blank')}>
                <DynamicIcon name={menu.icon} className="h-4 w-4" />
              </NavButton>
            ))}
          </nav>
        </div>

        {/* Panel Samping (Right Side Popup) */}
        <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
          <SheetContent side="right" className="w-full sm:max-w-xl p-0 border-none bg-white overflow-hidden shadow-2xl">
            <ScrollArea className="h-full">
              {isDetailLoading ? (
                <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : itemDetail ? (
                <div className="flex flex-col h-full animate-in fade-in duration-500">
                  <div className="relative h-48 bg-slate-950 shrink-0">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=2013')] bg-cover bg-center grayscale" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
                    <div className="absolute bottom-6 left-8 right-8 z-10 text-left">
                      <Badge className="bg-primary uppercase text-[8px] font-black tracking-widest px-3 mb-2">
                        {selectedItem?.type === 'village' ? 'Profil Wilayah' : 'Informasi'}
                      </Badge>
                      <h2 className="text-3xl font-black text-slate-900 leading-none uppercase">{itemDetail.name || itemDetail.title}</h2>
                    </div>
                  </div>

                  <div className="px-8 py-10 space-y-8 text-left">
                    {selectedItem?.type === 'village' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Populasi</p>
                            <p className="text-lg font-bold text-slate-800">{itemDetail.population?.toLocaleString()} <span className="text-[10px] opacity-40">Jiwa</span></p>
                          </div>
                          <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Skor IDM</p>
                            <p className="text-lg font-bold text-slate-800">{(itemDetail.idmScore || 0).toFixed(2)}</p>
                          </div>
                        </div>

                        <Button 
                          onClick={runAiAnalysis} 
                          disabled={isAiAnalyzing}
                          className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold gap-3 shadow-xl"
                        >
                          {isAiAnalyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <BrainCircuit className="h-5 w-5 text-primary" />}
                          {isAiAnalyzing ? 'Menganalisis Data...' : 'Analisis Strategis AI'}
                        </Button>

                        {aiAnalysisResult && (
                          <div className="p-6 bg-primary/5 rounded-[2.5rem] border border-primary/10 animate-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center gap-2 mb-4">
                              <Sparkles className="h-4 w-4 text-primary" />
                              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Rekomendasi AI</span>
                              <Badge className="ml-auto bg-primary/20 text-primary border-none text-[8px] uppercase">{aiAnalysisResult.efficiencyLevel}</Badge>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed font-medium mb-4">{aiAnalysisResult.analysis}</p>
                            <div className="space-y-2">
                              {aiAnalysisResult.recommendations.map((rec, i) => (
                                <div key={i} className="flex gap-3 text-xs text-slate-600 bg-white p-3 rounded-xl border border-primary/10">
                                  <Zap className="h-4 w-4 text-primary shrink-0" /> {rec}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="whitespace-pre-line text-slate-700 leading-relaxed text-lg font-medium">
                      {renderContentWithCharts(itemDetail.content || itemDetail.description)}
                    </div>

                    <Separator className="bg-slate-100" />
                    <Button variant="outline" className="w-full rounded-2xl h-12 border-slate-200" onClick={() => setPanelOpen(false)}>Tutup Detail</Button>
                  </div>
                </div>
              ) : null}
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
        <Button variant="ghost" size="icon" onClick={onClick} className={`h-10 w-10 text-slate-400 hover:bg-white/10 hover:text-white rounded-2xl transition-all ${className}`}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-slate-950 text-[9px] font-bold uppercase tracking-widest">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function NavButton({ children, label, onClick }: { children: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" onClick={onClick} className="flex items-center gap-3 h-10 px-6 rounded-full text-slate-300 hover:bg-white/10 transition-all group">
          <div className="text-primary group-hover:scale-110 transition-transform">{children}</div>
          <span className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-slate-950 mb-4 text-[9px] font-bold uppercase tracking-widest">{label}</TooltipContent>
    </Tooltip>
  );
}
