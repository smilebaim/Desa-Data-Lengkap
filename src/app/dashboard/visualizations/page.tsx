
'use client';

import { useMemo, useState } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { 
  Loader2, PieChart as PieIcon, BarChart3, TrendingUp, Users, Map as MapIcon, 
  Share2, Copy, CheckCheck, Link as LinkIcon, ExternalLink, Sparkles,
  Settings2, LayoutPanelLeft, MousePointerClick, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function VisualizationsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // State untuk Builder
  const [builderMetric, setBuilderMetric] = useState('populasi');
  const [builderType, setBuilderType] = useState('bar');

  const villageQuery = useMemo(() => query(collection(db, 'villages'), orderBy('name', 'asc')), [db]);
  const { data: villages, isLoading } = useCollection(villageQuery);

  const statsData = useMemo(() => {
    if (!villages) return [];
    return villages.map(v => ({
      name: v.name,
      populasi: v.population || 0,
      luas: v.area || 0,
      kepadatan: v.area > 0 ? parseFloat(((v.population || 0) / v.area).toFixed(2)) : 0
    }));
  }, [villages]);

  const totalPopulasi = useMemo(() => statsData.reduce((acc, curr) => acc + curr.populasi, 0), [statsData]);
  const totalLuas = useMemo(() => statsData.reduce((acc, curr) => acc + curr.luas, 0).toFixed(2), [statsData]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Berhasil Disalin", description: "Referensi data siap digunakan di modul lain." });
  };

  const getEmbedId = () => `stats-${builderMetric}-${builderType}`;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Visualisasi Data Strategis</h1>
          <p className="text-muted-foreground">Analisis infografis populasi dan penggunaan lahan desa secara real-time.</p>
        </div>
        
        <div className="flex items-center gap-2">
           <Card className="bg-primary/5 border-primary/20 p-1 flex items-center gap-1 rounded-2xl">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-[10px] font-bold text-primary px-3 rounded-xl hover:bg-primary/10"
                onClick={() => handleCopy('/visualizations', 'public-link')}
              >
                {copiedId === 'public-link' ? <CheckCheck className="h-3 w-3 mr-2" /> : <LinkIcon className="h-3 w-3 mr-2" />}
                SALIN TAUTAN PUBLIK
              </Button>
              <div className="h-4 w-[1px] bg-primary/20" />
              <Link href="/visualizations" target="_blank">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-[10px] font-bold text-primary px-3 rounded-xl hover:bg-primary/10"
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  BUKA PANEL PUBLIK
                </Button>
              </Link>
           </Card>
        </div>
      </div>

      {/* Visualizer Builder Tool - High Contrast Design */}
      <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden ring-1 ring-white/10">
        <CardHeader className="border-b border-white/5 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-2xl">
                <Settings2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Visualizer Builder</CardTitle>
                <CardDescription className="text-slate-400">Rancang dan dapatkan ID sematan untuk modul Map Tools atau Halaman Dinamis.</CardDescription>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <Zap className="h-3 w-3 text-amber-400 fill-amber-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Live Engine Active</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8 px-6 md:px-10 pb-10">
          <div className="grid gap-10 lg:grid-cols-12 items-start">
            {/* Configuration Controls */}
            <div className="lg:col-span-4 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
                  <LayoutPanelLeft className="h-3 w-3" /> Pilihan Metrik Utama
                </label>
                <Select value={builderMetric} onValueChange={setBuilderMetric}>
                  <SelectTrigger className="bg-white/5 border-white/10 h-14 rounded-2xl text-white focus:ring-primary/50 transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 text-white border-white/10">
                    <SelectItem value="populasi">Jumlah Populasi (Jiwa)</SelectItem>
                    <SelectItem value="luas">Luas Wilayah (km²)</SelectItem>
                    <SelectItem value="kepadatan">Kepadatan (Jiwa/km²)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
                  <BarChart3 className="h-3 w-3" /> Format Tampilan Grafik
                </label>
                <Select value={builderType} onValueChange={setBuilderType}>
                  <SelectTrigger className="bg-white/5 border-white/10 h-14 rounded-2xl text-white focus:ring-primary/50 transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 text-white border-white/10">
                    <SelectItem value="bar">Diagram Batang (Modern Bar)</SelectItem>
                    <SelectItem value="pie">Diagram Lingkaran (Doughnut)</SelectItem>
                    <SelectItem value="line">Grafik Tren (Curve Line)</SelectItem>
                    <SelectItem value="area">Grafik Area (Smooth Fill)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-6 space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">ID Referensi Sematan</p>
                  <code className="text-primary font-mono text-sm block bg-black/30 p-2 rounded-lg truncate">
                    {getEmbedId()}
                  </code>
                </div>
                <Button 
                  className="w-full h-14 rounded-2xl shadow-2xl shadow-primary/30 text-xs font-bold uppercase tracking-widest bg-primary hover:bg-primary/90 transition-all active:scale-95"
                  onClick={() => handleCopy(getEmbedId(), 'copy-embed')}
                >
                  {copiedId === 'copy-embed' ? <CheckCheck className="mr-3 h-5 w-5" /> : <Copy className="mr-3 h-5 w-5" />}
                  Salin ID Referensi
                </Button>
                <p className="text-[9px] text-center text-slate-500 italic px-4">
                  Salin ID ini dan tempelkan pada kolom "Keterangan" di Map Tools untuk menampilkan grafik spesifik ini.
                </p>
              </div>
            </div>

            {/* Live Preview - Premium Canvas */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interactive Preview Mode</span>
                </div>
                <div className="flex items-center gap-2">
                   <MousePointerClick className="h-3 w-3 text-slate-600" />
                   <span className="text-[9px] text-slate-600 font-medium">Hover untuk detail data</span>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-[2.5rem] p-8 md:p-12 border border-white/10 relative min-h-[400px] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                
                <div className="h-[350px] w-full z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    {builderType === 'bar' ? (
                      <BarChart data={statsData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                        <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                        <ChartTooltip 
                          cursor={{fill: 'rgba(255,255,255,0.03)'}}
                          contentStyle={{ borderRadius: '16px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} 
                        />
                        <Bar dataKey={builderMetric} fill="#22c55e" radius={[6, 6, 0, 0]} barSize={38} />
                      </BarChart>
                    ) : builderType === 'pie' ? (
                      <PieChart>
                        <Pie 
                          data={statsData} 
                          dataKey={builderMetric} 
                          nameKey="name" 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={60} 
                          outerRadius={110} 
                          paddingAngle={8}
                        >
                          {statsData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="rgba(0,0,0,0.2)" strokeWidth={2} />)}
                        </Pie>
                        <ChartTooltip 
                           contentStyle={{ borderRadius: '16px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px' }} />
                      </PieChart>
                    ) : builderType === 'line' ? (
                      <LineChart data={statsData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" fontSize={10} tick={{fill: '#64748b'}} axisLine={false} />
                        <YAxis fontSize={10} tick={{fill: '#64748b'}} axisLine={false} />
                        <ChartTooltip contentStyle={{ borderRadius: '16px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <Line type="monotone" dataKey={builderMetric} stroke="#22c55e" strokeWidth={4} dot={{r: 6, fill: '#22c55e', strokeWidth: 3, stroke: '#0f172a'}} activeDot={{r: 8}} />
                      </LineChart>
                    ) : (
                      <AreaChart data={statsData}>
                        <defs>
                          <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" fontSize={10} tick={{fill: '#64748b'}} axisLine={false} />
                        <YAxis fontSize={10} tick={{fill: '#64748b'}} axisLine={false} />
                        <ChartTooltip contentStyle={{ borderRadius: '16px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <Area type="monotone" dataKey={builderMetric} stroke="#22c55e" strokeWidth={4} fillOpacity={1} fill="url(#colorMetric)" />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-white shadow-xl shadow-slate-200/50 border-none rounded-[2rem] overflow-hidden group hover:translate-y-[-4px] transition-all">
          <CardContent className="pt-8">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-green-50 text-green-600 rounded-2xl group-hover:scale-110 transition-transform"><Users className="h-7 w-7" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Populasi Jaringan</p>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{totalPopulasi.toLocaleString()} <span className="text-sm font-normal text-slate-400 ml-1">Jiwa</span></h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-xl shadow-slate-200/50 border-none rounded-[2rem] overflow-hidden group hover:translate-y-[-4px] transition-all">
          <CardContent className="pt-8">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform"><MapIcon className="h-7 w-7" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cakupan Luas Terdata</p>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{totalLuas} <span className="text-sm font-normal text-slate-400 ml-1">km²</span></h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-xl shadow-slate-200/50 border-none rounded-[2rem] overflow-hidden group hover:translate-y-[-4px] transition-all">
          <CardContent className="pt-8">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform"><TrendingUp className="h-7 w-7" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kepadatan Rata-rata</p>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                  {statsData.length > 0 ? (totalPopulasi / parseFloat(totalLuas)).toFixed(0) : 0} 
                  <span className="text-sm font-normal text-slate-400 ml-1">Jiwa/km²</span>
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global Data Comparison */}
      <Card className="shadow-sm border-slate-200 rounded-[2.5rem] bg-white">
        <CardHeader className="border-b px-8 py-6">
          <div className="flex items-center gap-3">
             <BarChart3 className="h-5 w-5 text-primary" />
             <div>
               <CardTitle className="text-lg">Analisis Komparatif Desa</CardTitle>
               <CardDescription>Perbandingan populasi antar wilayah administratif secara real-time.</CardDescription>
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <ChartTooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }} 
                />
                <Bar dataKey="populasi" fill="hsl(var(--primary))" radius={[12, 12, 0, 0]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Instruction Footer */}
      <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/5">
         <div className="space-y-4 text-center md:text-left">
            <h3 className="text-xl font-bold flex items-center justify-center md:justify-start gap-3">
              <Sparkles className="h-6 w-6 text-primary" />
              Sematkan ke Seluruh Antarmuka
            </h3>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Gunakan ID Referensi dari <strong>Visualizer Builder</strong> di atas untuk menampilkan grafik tertentu pada peta interaktif atau halaman narasi Anda. Setiap perubahan data di modul Manajemen Desa akan secara otomatis memperbarui grafik tersebut.
            </p>
         </div>
         <div className="flex gap-4 shrink-0">
            <Button variant="outline" className="h-12 border-white/10 text-white hover:bg-white/5 rounded-2xl px-6" onClick={() => handleCopy('/visualizations', 'footer-link')}>
              <Copy className="h-4 w-4 mr-3" /> Salin URL Publik
            </Button>
            <Link href="/visualizations" target="_blank">
               <Button className="h-12 bg-primary hover:bg-primary/90 rounded-2xl px-8 shadow-xl shadow-primary/20">
                 <ExternalLink className="h-4 w-4 mr-3" /> Buka Dashboard
               </Button>
            </Link>
         </div>
      </div>
    </div>
  );
}
