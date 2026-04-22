'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { 
  Search, Shield, LogIn, HelpCircle, Plus, Minus, Landmark, 
  LayoutDashboard, X, MapPin, BarChart3, 
  Users, TrendingUp, Info, Zap, 
  Navigation, Eye, EyeOff, Construction, TreePine, Sparkles, Loader2, BrainCircuit,
  LocateFixed, ChevronRight, Menu as MenuIcon, LogOut
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFirestore, useCollection, useUser, useDoc, useAuth } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import * as LucideIcons from 'lucide-react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { signOut } from 'firebase/auth';
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
  const auth = useAuth();
  const { user, isLoading: isAuthLoading } = useUser();
  const [showVillages, setShowVillages] = useState(true);
  const [activeCategories, setActiveCategories] = useState<string[]>(['infrastructure', 'public_facility', 'natural_resource']);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: 'page' | 'village' | 'feature', id: string } | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AnalyzeVillageOutput | null>(null);

  // App Settings reaktif
  const settingsRef = useMemo(() => doc(db, 'settings', 'global'), [db]);
  const { data: appSettings } = useDoc(settingsRef);

  const menuQuery = useMemo(() => query(collection(db, 'menus'), orderBy('order', 'asc')), [db]);
  const { data: menus } = useCollection(menuQuery);

  const villageQuery = useMemo(() => query(collection(db, 'villages'), orderBy('name', 'asc')), [db]);
  const { data: villages } = useCollection(villageQuery);

  const featureQuery = useMemo(() => query(collection(db, 'features'), orderBy('name', 'asc')), [db]);
  const { data: features } = useCollection(featureQuery);

  const { data: visualizers } = useCollection(query(collection(db, 'visualizers')));

  const bottomMenus = useMemo(() => (menus || []).filter((m: any) => m.position === 'bottom'), [menus]);
  const headerMenus = useMemo(() => (menus || []).filter((m: any) => (m.position === 'header' || m.position === 'left')), [menus]);

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
    } catch (e) {} finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
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

        {/* Header Reaktif dengan Kontrol Logo */}
        <header className="absolute top-6 left-1/2 -translate-x-1/2 z-[5000] w-full max-w-5xl px-4 pointer-events-none">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3 pointer-events-auto bg-slate-950/40 backdrop-blur-2xl border border-white/10 p-1.5 rounded-full shadow-2xl ring-1 ring-white/10">
              <div className="flex items-center gap-3 pl-3">
                <div className="h-9 w-9 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20 shrink-0 overflow-hidden">
                  {appSettings?.logoType === 'image' && appSettings?.logoUrl ? (
                    <img src={appSettings.logoUrl} alt="Logo" className="h-5 w-5 object-contain" />
                  ) : (
                    <DynamicIcon name={appSettings?.logoIcon || 'Shield'} className="h-4 w-4 text-primary-foreground" />
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <h1 className="text-[11px] font-black tracking-tight text-white leading-none uppercase">{appSettings?.appName || 'Desa Lengkap'}</h1>
                  <p className="text-[7px] text-primary/80 font-bold uppercase tracking-[0.2em] mt-1">{appSettings?.appSlogan || 'Informasi Spasial Nasional'}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 pr-1 pointer-events-auto">
                <div className="relative flex items-center">
                  <div className={`flex items-center bg-white/5 border border-white/5 rounded-full transition-all duration-300 ${isSearchFocused ? 'w-48 px-3 h-8 bg-white/10' : 'w-8 h-8 justify-center cursor-pointer hover:bg-white/15'}`}>
                    <button onClick={() => setIsSearchFocused(!isSearchFocused)} className={`flex items-center justify-center transition-colors ${isSearchFocused ? 'text-primary mr-2' : 'text-slate-200'}`}>
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
                      />
                    )}
                  </div>

                  {isSearchFocused && searchQuery.trim() && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                      <ScrollArea className="max-h-[350px]">
                        <div className="p-2 space-y-4 text-left">
                          {searchResults.villages.length > 0 && (
                            <div>
                              <p className="px-3 py-1 text-[8px] font-black text-primary uppercase tracking-widest">Wilayah</p>
                              {searchResults.villages.map(v => (
                                <button key={v.id} onClick={() => handleSelectItem('village', v.id)} className="w-full text-left p-3 rounded-xl hover:bg-white/10 transition-colors group flex items-center justify-between">
                                  <div>
                                    <p className="text-[11px] font-bold text-white group-hover:text-primary">{v.name}</p>
                                    <p className="text-[9px] text-slate-500">{v.province}</p>
                                  </div>
                                  <ChevronRight className="h-3.5 w-3.5 text-slate-700" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-200 hover:bg-white/10">
                      <MenuIcon className="h-3.5 w-3.5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="bg-slate-950/40 backdrop-blur-2xl border-white/10 text-white p-0 overflow-hidden z-[9000]">
                    <div className="flex flex-col h-full">
                      <div className="p-8 border-b border-white/5 bg-slate-900/20 text-left">
                        <div className="flex items-center gap-3 mb-6">
                           <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                             <DynamicIcon name={appSettings?.logoIcon || 'Shield'} className="h-5 w-5 text-white" />
                           </div>
                           <div>
                              <h2 className="text-sm font-black uppercase tracking-widest text-white leading-none">{appSettings?.appName || 'Desa Lengkap'}</h2>
                              <p className="text-[9px] font-bold text-primary/60 uppercase tracking-[0.3em] mt-1">Menu Navigasi</p>
                           </div>
                        </div>
                      </div>
                      
                      <ScrollArea className="flex-1 px-4 py-6">
                        <div className="space-y-1">
                          {headerMenus?.map((menu: any) => (
                            <Button key={menu.id} variant="ghost" onClick={() => menu.href?.startsWith('/p/') ? handleSelectItem('page', menu.href.replace('/p/', '')) : window.open(menu.href, '_blank')} className="w-full justify-start h-12 rounded-xl text-xs font-bold gap-4 hover:bg-white/5">
                              <DynamicIcon name={menu.icon} className="h-3.5 w-3.5 text-primary" />
                              {menu.label}
                            </Button>
                          ))}
                        </div>
                      </ScrollArea>

                      <div className="p-8 border-t border-white/5 bg-slate-900/20">
                        {!isAuthLoading && (
                          user ? (
                            <div className="space-y-3">
                              <Link href="/dashboard" className="w-full block">
                                <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold gap-3">
                                  <LayoutDashboard className="h-3.5 w-3.5" /> Buka Dasbor
                                </Button>
                              </Link>
                              <Button variant="ghost" onClick={handleLogout} className="w-full h-12 rounded-xl text-red-400 hover:bg-red-500/10 font-bold gap-3">
                                <LogOut className="h-3.5 w-3.5" /> Keluar
                              </Button>
                            </div>
                          ) : (
                            <Link href="/login" className="w-full block">
                              <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold gap-3">
                                <LogIn className="h-3.5 w-3.5" /> Masuk Admin
                              </Button>
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </header>

        {/* Toolbar Kiri - Spasi gap-3 */}
        <aside className="absolute left-0 top-1/2 -translate-y-1/2 z-[5000] flex flex-col gap-3 transition-all duration-500 pointer-events-none">
          <div className="pointer-events-auto flex flex-col gap-2.5 py-4 px-2.5 bg-slate-950/40 backdrop-blur-2xl border border-white/10 rounded-r-[2rem] shadow-2xl ring-1 ring-white/10 transform transition-all duration-500 -translate-x-[75%] hover:translate-x-0 md:translate-x-0 md:ml-6 md:rounded-3xl border-l-0">
            <ToolbarButton tooltip={showVillages ? "Sembunyikan Batas" : "Tampilkan Batas"} onClick={() => setShowVillages(!showVillages)} className={showVillages ? "bg-primary text-primary-foreground" : "text-white"}>
              {showVillages ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </ToolbarButton>
            <Separator className="bg-white/10 mx-2 my-0.5" />
            <ToolbarButton tooltip="Fasilitas Umum" onClick={() => toggleCategory('public_facility')} className={activeCategories.includes('public_facility') ? "text-blue-400 bg-blue-400/20" : "text-white"}><Landmark className="h-3.5 w-3.5" /></ToolbarButton>
            <ToolbarButton tooltip="Infrastruktur" onClick={() => toggleCategory('infrastructure')} className={activeCategories.includes('infrastructure') ? "text-amber-400 bg-amber-400/20" : "text-white"}><Construction className="h-3.5 w-3.5" /></ToolbarButton>
            <ToolbarButton tooltip="Sumber Daya Alam" onClick={() => toggleCategory('natural_resource')} className={activeCategories.includes('natural_resource') ? "text-green-400 bg-green-400/20" : "text-white"}><TreePine className="h-3.5 w-3.5" /></ToolbarButton>
            <Separator className="bg-white/10 mx-2 my-0.5" />
            <ToolbarButton tooltip="Reset Peta" onClick={() => window.location.reload()} className="text-white"><LocateFixed className="h-3.5 w-3.5" /></ToolbarButton>
          </div>
        </aside>

        {/* Dock Bawah - Glassmorphism 40% */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[4000] flex flex-col items-center gap-3 w-full px-4">
          <nav className="flex items-center gap-4 p-2 bg-slate-950/40 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl ring-1 ring-white/10 overflow-x-auto no-scrollbar max-w-[95vw]">
            {bottomMenus?.map((menu: any) => (
              <NavButton key={menu.id} label={menu.label} onClick={() => menu.href?.startsWith('/p/') ? handleSelectItem('page', menu.href.replace('/p/', '')) : window.open(menu.href, '_blank')}>
                <DynamicIcon name={menu.icon} className="h-3.5 w-3.5" />
              </NavButton>
            ))}
          </nav>
        </div>

        {/* Panel Informasi - pb-40 agar tidak tertutup dock */}
        <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
          <SheetContent side="right" className="w-full sm:max-w-xl p-0 border-none bg-white overflow-hidden shadow-2xl z-[9000]">
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
                      {itemDetail.province && <p className="text-white text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{itemDetail.province}</p>}
                    </div>
                  </div>
                  <div className="px-8 py-10 pb-40 space-y-8 text-left">
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
                          {isAiAnalyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BrainCircuit className="h-3.5 w-3.5 text-primary" />}
                          Analisis Strategis AI
                        </Button>
                        {aiAnalysisResult && (
                          <div className="p-8 bg-primary/5 rounded-3xl border border-primary/10 animate-in zoom-in-95 duration-300">
                            <div className="flex items-center gap-2 mb-4">
                              <Sparkles className="h-3.5 w-3.5 text-primary" />
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
                      <div className="space-y-4 text-left">
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
