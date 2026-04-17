
'use client';

import { useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Loader2, BarChart3, Users, Map as MapIcon, TrendingUp, ChevronRight, Zap, Coins } from 'lucide-react';
import Link from 'next/link';
import { useMemo, Fragment } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line, AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ComposedChart
} from 'recharts';

const CHART_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Komponen perender grafik berdasarkan konfigurasi
const DynamicChart = ({ config, data }: { config: any, data: any[] }) => {
  if (!config || !data.length) return null;

  const chartTitle = config.title;
  const metric = config.metric || 'population';
  const type = config.chartType || 'bar';

  return (
    <Card className="my-8 shadow-2xl shadow-slate-200/40 border-none rounded-[2.5rem] bg-white p-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-bold flex items-center gap-3 text-slate-800 uppercase tracking-widest">
          <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
          {chartTitle}
        </h3>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
              <ChartTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1) ' }} />
              <Bar dataKey={metric} radius={[10, 10, 0, 0]} barSize={32}>
                {data.map((_, index) => <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          ) : type === 'pie' ? (
            <PieChart>
              <Pie data={data} dataKey={metric} nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5}>
                {data.map((_, index) => <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
              </Pie>
              <ChartTooltip />
            </PieChart>
          ) : type === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} />
              <ChartTooltip />
              <Line type="monotone" dataKey={metric} stroke="#22c55e" strokeWidth={4} dot={{ r: 6, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }} />
            </LineChart>
          ) : type === 'area' ? (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} />
              <ChartTooltip />
              <Area type="monotone" dataKey={metric} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
            </AreaChart>
          ) : type === 'radar' ? (
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" fontSize={10} />
              <PolarRadiusAxis fontSize={10} />
              <Radar name={metric} dataKey={metric} stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              <ChartTooltip />
            </RadarChart>
          ) : type === 'composed' ? (
            <ComposedChart data={data}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} />
              <ChartTooltip />
              <Bar dataKey={metric} fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
              <Line type="monotone" dataKey={metric} stroke="#ef4444" strokeWidth={2} />
            </ComposedChart>
          ) : (
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" name="Desa" unit="" fontSize={10} />
              <YAxis dataKey={metric} name={metric} fontSize={10} />
              <ChartTooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name={metric} data={data} fill="#f59e0b" />
            </ScatterChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default function PublicDynamicPage() {
  const { id } = useParams();
  const db = useFirestore();
  const router = useRouter();
  
  const { data: page, isLoading: isPageLoading } = useDoc(doc(db, 'pages', id as string));
  const villageQuery = useMemo(() => query(collection(db, 'villages'), orderBy('name', 'asc')), [db]);
  const { data: villages } = useCollection(villageQuery);
  const { data: visualizers } = useCollection(query(collection(db, 'visualizers')));

  const statsData = useMemo(() => {
    if (!villages) return [];
    return villages.map(v => ({
      name: v.name,
      population: v.population || 0,
      area: v.area || 0,
      idmScore: v.idmScore || 0,
      budgetAllocation: v.budgetAllocation || 0,
      density: v.area > 0 ? parseFloat(((v.population || 0) / v.area).toFixed(2)) : 0
    }));
  }, [villages]);

  const summary = useMemo(() => {
    const totalPop = statsData.reduce((acc, curr) => acc + curr.population, 0);
    const totalBudget = statsData.reduce((acc, curr) => acc + curr.budgetAllocation, 0);
    const avgIdm = statsData.length > 0 ? (statsData.reduce((acc, curr) => acc + curr.idmScore, 0) / statsData.length).toFixed(2) : 0;
    return { totalPop, totalBudget, avgIdm };
  }, [statsData]);

  // Fungsi untuk merender konten dengan kode sematan [CHART:ID]
  const renderContentWithCharts = (content: string) => {
    if (!content) return null;
    const parts = content.split(/(\[CHART:[a-zA-Z0-9_-]+\])/g);
    
    return parts.map((part, index) => {
      const match = part.match(/\[CHART:([a-zA-Z0-9_-]+)\]/);
      if (match) {
        const chartId = match[1];
        const config = visualizers?.find(v => v.id === chartId);
        return config ? <DynamicChart key={index} config={config} data={statsData} /> : null;
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (isPageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Halaman Hilang</h2>
        <Button onClick={() => router.push('/')} className="mt-4 rounded-full">Kembali ke Beranda</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-body selection:bg-primary/20">
      <div className="bg-slate-900 pt-16 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=2013')] bg-cover bg-center grayscale" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90" />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <Link href="/">
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 mb-10 pl-0 group">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
              KEMBALI KE PETA
            </Button>
          </Link>
          <div className="space-y-6">
            <Badge className="bg-primary hover:bg-primary uppercase tracking-[0.3em] text-[9px] py-1.5 px-4 rounded-full">Informasi Publik</Badge>
            <h1 className="text-4xl md:text-7xl font-bold text-white tracking-tight leading-[1.1]">{page.title}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-20">
        <Card className="shadow-2xl border-none rounded-[3rem] overflow-hidden bg-white">
          <CardContent className="p-8 md:p-20">
            <div className="whitespace-pre-line text-xl text-slate-700 leading-relaxed font-medium">
              {renderContentWithCharts(page.content)}
            </div>
          </CardContent>
        </Card>

        {page.showStats && (
          <div className="mt-20 space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="flex flex-col items-center gap-4 text-center">
               <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-2">
                 <BarChart3 className="h-6 w-6" />
               </div>
               <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.5em]">Dashboard Agregat Desa</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { label: 'Populasi Total', value: summary.totalPop.toLocaleString(), unit: 'Jiwa', icon: Users, color: 'primary' },
                { label: 'Total Anggaran', value: (summary.totalBudget / 1000000).toLocaleString(), unit: 'Juta', icon: Coins, color: 'blue' },
                { label: 'Rerata Skor IDM', value: summary.avgIdm, unit: 'IDM', icon: TrendingUp, color: 'amber' }
              ].map((item, i) => (
                <Card key={i} className="group bg-white border-none shadow-xl shadow-slate-200/50 rounded-[2rem] p-8">
                  <div className="flex flex-col gap-6">
                    <div className={`p-4 bg-${item.color}-50 rounded-2xl text-${item.color}-600 w-fit`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                      <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{item.value} <span className="text-xs opacity-40">{item.unit}</span></h3>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <footer className="mt-32 border-t border-slate-200 pt-16 text-center pb-16">
           <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <span className="block text-xl font-bold text-slate-900 tracking-tight">Desa Lengkap</span>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Sistem Informasi Geospasial</span>
              </div>
           </div>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">© 2024 Jaringan Data Nasional Indonesia</p>
        </footer>
      </div>
    </div>
  );
}
