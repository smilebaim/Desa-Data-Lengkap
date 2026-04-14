
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
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Menghimpun Data Strategis...</p>
        </div>
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

      {/* Visualizer Builder Tool - Premium Canvas */}
      <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden ring-1 ring-white/10">
        <CardHeader className="border-b border-white/5 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-2xl shadow-lg shadow-primary/10">
                <Settings2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Visualizer Builder</CardTitle>
                <CardDescription className="text-slate-400">Rancang dan dapatkan ID sematan untuk modul Map Tools atau Halaman Dinamis.</CardDescription>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <Zap className="h-3 w-3 text-amber-400 fill-amber-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Live Engine Active</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8 px-6 md:px-10 pb-10">
          <div className="grid gap-10 lg:grid-cols-12 items-start">
            {/* Configuration Controls */}
            <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
                  <LayoutPanelLeft className="h-3 w-3" /> Pilihan Metrik Utama
                </label>
                <Select value={builderMetric} onValueChange={setBuilderMetric}>
                  <SelectTrigger className="bg-white/5 border-white/10 h-14 rounded-2xl text-white focus:ring-primary/50 transition-all hover:bg-white/10">
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
                  <SelectTrigger className="bg-white/5 border-white/10 h-14 rounded-2xl text-white focus:ring-primary/50 transition-all hover:bg-white/10">
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
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2 group transition-all hover:bg-white/10">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                    ID Referensi Sematan
                    <Sparkles className="h-2.5 w-2.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                  <code className="text-primary font-mono text-sm block bg-black/30 p-2 rounded-lg truncate border border-primary/10">
                    {getEmbedId()}
                  </code>
                </div>
                <Button 
                  className="w-full h-14 rounded-2xl shadow-2xl shadow-primary/30 text-xs font-bold uppercase tracking-widest bg-primary hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-3"
                  onClick={() => handleCopy(getEmbedId(), 'copy-embed')}
                >
                  {copiedId === 'copy-embed' ? <CheckCheck className="h-5 w-5 animate-in zoom-in" /> : <Copy className="h-5 w-5" />}
                  {copiedId === 'copy-embed' ? 'Tersalin!' : 'Salin ID Referensi'}
                </Button>
                <p className="text-[9px] text-center text-slate-500 italic px-4 leading-relaxed">
                  Salin ID ini dan tempelkan pada kolom "Keterangan" di Map Tools untuk menampilkan grafik spesifik ini secara otomatis.
                </p>
              </div>
            </div>

            {/* Live Preview - Premium Canvas */}
            <div className="lg:col-span-8 space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interactive Preview Mode</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                   <MousePointerClick className="h-3 w-3" />
                   <span className="text-[9px] font-medium uppercase tracking-wider">Hover untuk detail data</span>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-[2.5rem] p-8 md:p-12 border border-white/10 relative min-h-[450px] flex items-center justify-center overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                <div className="absolute -top-24 -right-24 h-64 w-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
                
                <div className="h-[350px] w-full z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    {builderType === 'bar' ? (
                      <BarChart data={statsData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                        <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                        <ChartTooltip 
                          cursor={{fill: 'rgba(255,255,255,0.03)'}}
                          contentStyle={{ borderRadius: '16px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '11px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} 
                        />
                        <Bar dataKey={builderMetric} fill="#22c55e" radius={[8, 8, 0, 0]} barSize={40} animationDuration={1500} />
                      </BarChart>
                    ) : builderType === 'pie' ? (
                      <PieChart>
                        <Pie 
                          data={statsData} 
                          dataKey={builderMetric} 
                          nameKey="name" 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={70} 
                          outerRadius={120} 
                          paddingAngle={10}
                          animationBegin={0}
                          animationDuration={1500}
                        >
                          {statsData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="rgba(0,0,0,0.4)" strokeWidth={2} />)}
                        </Pie>
                        <ChartTooltip 
                           contentStyle={{ borderRadius: '16px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px', fontSize: '10px', color: '#64748b' }} />
                      </PieChart>
                    ) : builderType === 'line' ? (
                      <LineChart data={statsData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" fontSize={10} tick={{fill: '#64748b'}} axisLine={false} />
                        <YAxis fontSize={10} tick={{fill: '#64748b'}} axisLine={false} />
                        <ChartTooltip contentStyle={{ borderRadius: '16px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px' }} />
                        <Line type="monotone" dataKey={builderMetric} stroke="#22c55e" strokeWidth={5} dot={{r: 7, fill: '#22c55e', strokeWidth: 4, stroke: '#0f172a'}} activeDot={{r: 10, strokeWidth: 0}} animationDuration={1500} />
                      </LineChart>
                    ) : (
                      <AreaChart data={statsData}>
                        <defs>
                          <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" fontSize={10} tick={{fill: '#64748b'}} axisLine={false} />
                        <YAxis fontSize={10} tick={{fill: '#64748b'}} axisLine={false} />
                        <ChartTooltip contentStyle={{ borderRadius: '16px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px' }} />
                        <Area type="monotone" dataKey={builderMetric} stroke="#22c55e" strokeWidth={5} fillOpacity={1} fill="url(#colorMetric)" animationDuration={1500} />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights Cards with Enhanced Interaction */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: 'Total Populasi Jaringan', value: totalPopulasi, unit: 'Jiwa', icon: Users, color: 'bg-green-50', iconColor: 'text-green-600' },
          { label: 'Cakupan Luas Terdata', value: parseFloat(totalLuas), unit: 'km²', icon: MapIcon, color: 'bg-blue-50', iconColor: 'text-blue-600' },
          { label: 'Kepadatan Rata-rata', value: statsData.length > 0 ? (totalPopulasi / parseFloat(totalLuas)).toFixed(0) : 0, unit: 'Jiwa/km²', icon: TrendingUp, color: 'bg-amber-50', iconColor: 'text-amber-600' }
        ].map((item, idx) => (
          <Card key={idx} className="bg-white shadow-xl shadow-slate-200/40 border-none rounded-[2rem] overflow-hidden group hover:translate-y-[-6px] transition-all duration-300">
            <CardContent className="pt-8">
              <div className="flex items-center gap-6">
                <div className={`p-4 ${item.color} ${item.iconColor} rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                    {Number(item.value).toLocaleString()} 
                    <span className="text-sm font-normal text-slate-400 ml-1.5">{item.unit}</span>
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Global Data Comparison - Professional Analytics */}
      <Card className="shadow-sm border-slate-200 rounded-[2.5rem] bg-white overflow-hidden group">
        <CardHeader className="border-b px-8 py-8 flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
               <BarChart3 className="h-6 w-6" />
             </div>
             <div>
               <CardTitle className="text-xl">Analisis Komparatif Antar Desa</CardTitle>
               <CardDescription>Perbandingan populasi real-time di seluruh wilayah administratif.</CardDescription>
             </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
             <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Terakhir</p>
                <p className="text-xs font-bold text-slate-700">Otomatis (Sesuai Firestore)</p>
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 md:p-12">
          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                <YAxis fontSize={11} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dx={-10} />
                <ChartTooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }} 
                />
                <Bar dataKey="populasi" fill="hsl(var(--primary))" radius={[14, 14, 0, 0]} barSize={50} animationDuration={2000}>
                   {statsData.map((_, index) => (
                    <Cell key={`cell-${index}`} fillOpacity={0.8 + (index % 5) * 0.05} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Interactive CTA Footer */}
      <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 border border-white/5 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-700" />
         
         <div className="space-y-5 text-center md:text-left relative z-10">
            <h3 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-4">
              <Sparkles className="h-7 w-7 text-primary animate-pulse" />
              Sematkan Data Ke Seluruh Antarmuka
            </h3>
            <p className="text-slate-400 text-base max-w-xl leading-relaxed">
              ID yang dihasilkan dari <strong>Visualizer Builder</strong> dapat ditempelkan di kolom deskripsi pada modul Map Tools atau Manajemen Halaman. Gunakan kekuatan data untuk memperkaya narasi geospasial Anda.
            </p>
         </div>
         <div className="flex flex-col sm:flex-row gap-4 shrink-0 relative z-10">
            <Button variant="outline" className="h-14 border-white/10 text-white hover:bg-white/10 rounded-2xl px-8 transition-all group/btn" onClick={() => handleCopy('/visualizations', 'footer-link')}>
              <Copy className="h-5 w-5 mr-3 group-hover/btn:scale-110 transition-transform" /> 
              {copiedId === 'footer-link' ? 'Tersalin' : 'Salin URL Publik'}
            </Button>
            <Link href="/visualizations" target="_blank">
               <Button className="h-14 bg-primary hover:bg-primary/90 rounded-2xl px-10 shadow-2xl shadow-primary/20 group/btn">
                 <ExternalLink className="h-5 w-5 mr-3 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                 Buka Dashboard
               </Button>
            </Link>
         </div>
      </div>
    </div>
  );
}
