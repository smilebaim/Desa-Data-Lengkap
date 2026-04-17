
'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { 
  Search, Shield, LogIn, HelpCircle, Plus, Minus, Landmark, 
  LayoutDashboard, X, MapPin, BarChart3, 
  Users, TrendingUp, Info, Zap, 
  Navigation, Eye, EyeOff, Construction, TreePine, Sparkles, Loader2, BrainCircuit,
  LocateFixed, ChevronRight
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFirestore, useCollection, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import * as LucideIcons from 'lucide-react';
import Link from 'next/link';
import { Sheet, SheetContent } from "@/components/ui/sheet";
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
    <div className="h-56 w-full my-6 bg-slate-50 p-4 rounded-3xl border border-slate-100 shadow-inner overflow-hidden text-left">
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
  const [activeCategories, setActiveCategories] = useState<string[]>(['infrastructure', 'public_facility', 'natural_resource']);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: 'page' | 'village' | 'feature', id: string } | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AnalyzeVillageOutput | null>(null);

  const menuQuery = useMemo(() => query(collection(db, 'menus'), orderBy('order', 'asc')), [db]);
  const { data: menus } = useCollection(menuQuery);

  const villageQuery = useMemo(() => query(collection(db, 'villages'), orderBy('name', 'asc')), [db]);
  const { data: villages } = useCollection(villageQuery);

  const featureQuery = useMemo(() => query(collection(db, 'features'), orderBy('name', 'asc')), [db]);
  const { data: features } = useCollection(featureQuery);

  const { data: visualizers } = useCollection(query(collection(db, 'visualizers')));

  const bottomMenus = useMemo(() => (menus || []).filter((m: any) => m.position === 'bottom'), [menus]);
  const headerMenus = useMemo(() => (menus || []).filter((m: any) => m.position === 'header'), [menus]);

  const toggleCategory = (cat: string) => {
    setActiveCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { villages: [], features: [] };
    const q = searchQuery.toLowerCase();
    return {
      villages: (villages || []).filter(v => v.name?.toLowerCase().includes(q) || v.province?.toLowerCase().includes(q)),
      features: (features || []).filter(f => f.name?.toLowerCase().includes(q) || f.category?.toLowerCase().includes(q))
    };
  }, [searchQuery, villages, features]);

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
    setSearchQuery('');
    setIsSearchFocused(false);
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
            activeCategories={activeCategories}
            onSelectVillage={(id) => handleSelectItem('village', id)}
            onSelectFeature={(id) => handleSelectItem('feature', id)}
          />
        </div>

        <header className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[5000] w-full max-w-5xl px-4 pointer-events-none">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-1.5 sm:gap-3 pointer-events-auto bg-slate-950/70 backdrop-blur-3xl border border-white/10 p-1.5 rounded-full shadow-2xl ring-1 ring-white/10">
              <div className="flex items-center gap-2 pl-2">
                <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                  <Shield className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="hidden lg:block text-left">
                  <h1 className="text-xs font-bold tracking-tight text-white leading-none">Desa Lengkap</h1>
                  <p className="text-[8px] text-primary/80 font-bold uppercase tracking-widest mt-0.5">Informasi Spasial Nasional</p>
                </div>
              </div>

              <div className="flex-1 flex justify-center mx-2 pointer-events-auto relative">
                <div className={`flex items-center bg-white/10 border border-white/10 rounded-full transition-all duration-300 ${isSearchFocused ? 'w-full max-w-[140px] px-3 h-8 bg-white/20' : 'w-8 h-8 justify-center cursor-pointer hover:bg-white/15'}`}>
                  <button 
                    onClick={() => setIsSearchFocused(!isSearchFocused)}
                    className={`flex items-center justify-center transition-colors ${isSearchFocused ? 'text-primary mr-2' : 'text-slate-200'}`}
                  >
                    <Search className="h-3.5 w-3.5" />
                  </button>
                  {isSearchFocused && (
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Cari..." 
                      className="bg-transparent text-[10px] font-bold text-white outline-none placeholder:text-slate-500 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onBlur={() => {
                        if (!searchQuery) setTimeout(() => setIsSearchFocused(false), 200);
                      }}
                    />
                  )}
                </div>

                {isSearchFocused && searchQuery.trim() && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-full max-w-sm bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                    <ScrollArea className="max-h-[350px]">
                      <div className="p-2 space-y-4">
                        {searchResults.villages.length > 0 && (
                          <div>
                            <p className="px-3 py-1 text-[8px] font-black text-primary uppercase tracking-widest">Wilayah</p>
                            {searchResults.villages.map(v => (
                              <button key={v.id} onClick={() => handleSelectItem('village', v.id)} className="w-full text-left p-3 rounded-xl hover:bg-white/10 transition-colors group flex items-center justify-between">
                                <div>
                                  <p className="text-[11px] font-bold text-white group-hover:text-primary">{v.name}</p>
                                  <p className="text-[9px] text-slate-500">{v.province}</p>
                                </div>
                                <ChevronRight className="h-3 w-3 text-slate-700" />
                              </button>
                            ))}
                          </div>
                        )}
                        {searchResults.features.length > 0 && (
                          <div>
                            <p className="px-3 py-1 text-[8px] font-black text-blue-400 uppercase tracking-widest">Aset</p>
                            {searchResults.features.map(f => (
                              <button key={f.id} onClick={() => handleSelectItem('feature', f.id)} className="w-full text-left p-3 rounded-xl hover:bg-white/10 transition-colors group flex items-center justify-between">
                                <div>
                                  <p className="text-[11px] font-bold text-white group-hover:text-primary">{f.name}</p>
                                  <p className="text-[9px] text-slate-500 uppercase">{f.category?.replace('_', ' ')}</p>
                                </div>
                                <ChevronRight className="h-3 w-3 text-slate-700" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 pr-1 pointer-events-auto">
                {headerMenus?.map((menu: any) => (
                  <Button key={menu.id} variant="ghost" onClick={() => menu.href?.startsWith('/p/') ? handleSelectItem('page', menu.href.replace('/p/', '')) : window.open(menu.href, '_blank')} className="h-8 rounded-full px-3 text-[10px] font-bold gap-2 text-slate-200 hover:bg-white/10">
                    <DynamicIcon name={menu.icon} className="h-3.5 w-3.5 text-primary" />
                    <span className="hidden md:inline">{menu.label}</span>
                  </Button>
                ))}
                {!isAuthLoading && (
                  <Link href={user ? "/dashboard" : "/login"}>
                    <Button className="h-8 px-3 rounded-full text-[10px] font-bold gap-2 bg-primary hover:bg-primary/90">
                      {user ? <LayoutDashboard className="h-3.5 w-3.5" /> : <LogIn className="h-3.5 w-3.5" />}
                      <span className="hidden sm:inline">{user ? "Dasbor" : "Masuk"}</span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>

        <aside className="absolute left-0 top-1/2 -translate-y-1/2 z-[5000] flex flex-col gap-3 transition-all duration-500 group">
          <div className="flex flex-col gap-1 p-1.5 bg-slate-950/70 backdrop-blur-3xl border border-white/10 rounded-r-2xl shadow-2xl ring-1 ring-white/10 transform transition-all duration-500 -translate-x-3/4 group-hover:translate-x-0 md:translate-x-0 md:ml-6 md:rounded-2xl">
            <ToolbarButton tooltip={showVillages ? "Sembunyikan Batas" : "Tampilkan Batas"} onClick={() => setShowVillages(!showVillages)} className={showVillages ? "bg-primary text-primary-foreground" : "text-white"}>
              {showVillages ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </ToolbarButton>
            <Separator className="bg-white/5 mx-2 my-0.5" />
            <ToolbarButton tooltip="Fasilitas Umum" onClick={() => toggleCategory('public_facility')} className={activeCategories.includes('public_facility') ? "text-blue-400 bg-blue-400/20" : "text-white"}><Landmark className="h-3.5 w-3.5" /></ToolbarButton>
            <ToolbarButton tooltip="Infrastruktur" onClick={() => toggleCategory('infrastructure')} className={activeCategories.includes('infrastructure') ? "text-amber-400 bg-amber-400/20" : "text-white"}><Construction className="h-3.5 w-3.5" /></ToolbarButton>
            <ToolbarButton tooltip="Sumber Daya Alam" onClick={() => toggleCategory('natural_resource')} className={activeCategories.includes('natural_resource') ? "text-green-400 bg-green-400/20" : "text-white"}><TreePine className="h-3.5 w-3.5" /></ToolbarButton>
            <Separator className="bg-white/5 mx-2 my-0.5" />
            <ToolbarButton tooltip="Reset Peta" onClick={() => window.location.reload()} className="text-white"><LocateFixed className="h-3.5 w-3.5" /></ToolbarButton>
            <Separator className="bg-white/5 mx-2 my-0.5" />
            <ToolbarButton tooltip="Perbesar" className="text-white"><Plus className="h-3.5 w-3.5" /></ToolbarButton>
            <ToolbarButton tooltip="Perkecil" className="text-white"><Minus className="h-3.5 w-3.5" /></ToolbarButton>
          </div>
        </aside>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[5000] flex flex-col items-center gap-3 w-full px-4">
          <nav className="flex items-center gap-1 p-1.5 bg-slate-950/70 backdrop-blur-3xl border border-white/15 rounded-full shadow-2xl ring-1 ring-white/10 overflow-x-auto no-scrollbar max-w-[95vw]">
            {bottomMenus?.map((menu: any) => (
              <NavButton key={menu.id} label={menu.label} onClick={() => menu.href?.startsWith('/p/') ? handleSelectItem('page', menu.href.replace('/p/', '')) : window.open(menu.href, '_blank')}>
                <DynamicIcon name={menu.icon} className="h-3.5 w-3.5" />
              </NavButton>
            ))}
          </nav>
        </div>

        <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
          <SheetContent side="right" className="w-full sm:max-w-xl p-0 border-none bg-white overflow-hidden shadow-2xl">
            <ScrollArea className="h-full">
              {isDetailLoading ? (
                <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : itemDetail ? (
                <div className="flex flex-col h-full animate-in fade-in duration-500">
                  <div className="relative h-56 bg-slate-900 shrink-0 overflow-hidden text-left">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                    <div className="absolute bottom-6 left-8 right-8 z-10">
                      <Badge className="bg-primary hover:bg-primary uppercase text-[8px] font-black tracking-widest px-3 mb-3 border-none text-white">
                        {selectedItem?.type === 'village' ? 'Profil Wilayah' : selectedItem?.type === 'feature' ? 'Informasi Aset' : 'Informasi Publik'}
                      </Badge>
                      <h2 className="text-2xl font-black text-white leading-tight uppercase tracking-tight">{itemDetail.name || itemDetail.title}</h2>
                      {itemDetail.province && <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{itemDetail.province}</p>}
                      {itemDetail.category && <p className="text-primary/80 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{itemDetail.category?.replace('_', ' ')}</p>}
                    </div>
                  </div>
                  <div className="px-8 py-10 space-y-8 text-left">
                    {selectedItem?.type === 'village' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Populasi</p>
                            <p className="text-xl font-bold text-slate-900 leading-none">{itemDetail.population?.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold ml-1">JIWA</span></p>
                          </div>
                          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Skor IDM</p>
                            <p className="text-xl font-bold text-slate-900 leading-none">{(itemDetail.idmScore || 0).toFixed(2)}</p>
                          </div>
                        </div>
                        <Button onClick={runAiAnalysis} disabled={isAiAnalyzing} className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold gap-3 shadow-xl transition-all">
                          {isAiAnalyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <BrainCircuit className="h-5 w-5 text-primary" />}
                          Analisis Strategis AI
                        </Button>
                        {aiAnalysisResult && (
                          <div className="p-8 bg-primary/5 rounded-3xl border border-primary/10 animate-in zoom-in-95 duration-300">
                            <div className="flex items-center gap-2 mb-4">
                              <Sparkles className="h-4 w-4 text-primary" />
                              <p className="text-[10px] font-black text-primary uppercase tracking-widest">Saran AI</p>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed font-medium">{aiAnalysisResult.analysis}</p>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="whitespace-pre-line text-slate-700 leading-relaxed text-lg font-medium">
                      {renderContentWithCharts(itemDetail.content || itemDetail.description)}
                    </div>
                    {itemDetail.potentials && itemDetail.potentials.length > 0 && (
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Potensi Wilayah</p>
                        <div className="flex flex-wrap gap-2">
                          {itemDetail.potentials.map((pot: string, i: number) => (
                            <Badge key={i} variant="outline" className="rounded-full px-4 py-1.5 text-slate-600 border-slate-200 bg-slate-50 font-bold text-[10px] uppercase">
                              {pot}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <Separator className="bg-slate-100" />
                    <Button variant="outline" className="w-full rounded-2xl h-12 border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-colors" onClick={() => setPanelOpen(false)}>Tutup Detail</Button>
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
        <Button variant="ghost" size="icon" onClick={onClick} className={`h-8 w-8 hover:bg-white/10 transition-all rounded-xl shrink-0 ${className}`}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-slate-950 border-white/10 text-[9px] font-bold uppercase tracking-widest text-white">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function NavButton({ children, label, onClick }: { children: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" onClick={onClick} className="flex items-center gap-3 h-10 px-6 rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-all group border border-transparent hover:border-white/10 shrink-0">
          <div className="text-primary group-hover:scale-110 transition-transform">{children}</div>
          <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-slate-950 border-white/10 mb-4 text-[9px] font-bold uppercase tracking-widest text-white">{label}</TooltipContent>
    </Tooltip>
  );
}
