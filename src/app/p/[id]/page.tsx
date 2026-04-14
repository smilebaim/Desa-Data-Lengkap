
'use client';

import { useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Loader2, BarChart3, Users, Map as MapIcon, TrendingUp, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, 
  ResponsiveContainer, Cell
} from 'recharts';

const CHART_COLORS = ['#166534', '#15803d', '#16a34a', '#22c55e', '#4ade80'];

export default function PublicDynamicPage() {
  const { id } = useParams();
  const db = useFirestore();
  const router = useRouter();
  
  const { data: page, isLoading: isPageLoading } = useDoc(doc(db, 'pages', id as string));
  
  const villageQuery = useMemo(() => query(collection(db, 'villages'), orderBy('name', 'asc')), [db]);
  const { data: villages, isLoading: isVillagesLoading } = useCollection(villageQuery);

  const statsData = useMemo(() => {
    if (!villages) return [];
    return villages.map(v => ({
      name: v.name,
      populasi: v.population || 0,
      luas: v.area || 0
    }));
  }, [villages]);

  const summary = useMemo(() => {
    const totalPop = statsData.reduce((acc, curr) => acc + curr.populasi, 0);
    const totalArea = statsData.reduce((acc, curr) => acc + curr.luas, 0);
    const density = totalArea > 0 ? (totalPop / totalArea).toFixed(0) : 0;
    return { totalPop, totalArea, density };
  }, [statsData]);

  if (isPageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-16 w-16 border-4 border-primary/20 rounded-full animate-spin border-t-primary"></div>
            <FileText className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Menyiapkan Publikasi...</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 max-w-md">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Halaman Hilang</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">Maaf, halaman ini telah ditarik dari peredaran atau alamat yang Anda tuju tidak valid.</p>
          <Button onClick={() => router.push('/')} className="h-12 px-8 rounded-full shadow-lg">Kembali ke Peta Utama</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-body selection:bg-primary/20">
      {/* Header Section Premium */}
      <div className="bg-slate-900 pt-16 pb-32 relative overflow-hidden">
        {/* Dekorasi Latar Belakang */}
        <div className="absolute inset-0 opacity-15 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=2013')] bg-cover bg-center grayscale" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <Link href="/">
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 mb-10 pl-0 group transition-all">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
              <span className="text-xs font-bold uppercase tracking-widest">Kembali ke Beranda Peta</span>
            </Button>
          </Link>
          
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
               <Badge className="bg-primary hover:bg-primary shadow-xl shadow-primary/30 border-none uppercase tracking-[0.3em] text-[9px] py-1.5 px-4 rounded-full">
                 Informasi Publik
               </Badge>
               {page.updatedAt && (
                 <div className="flex items-center gap-2 text-[9px] text-white/50 font-black uppercase tracking-widest">
                   <div className="h-1 w-1 bg-white/30 rounded-full" />
                   Sinkronisasi Terakhir: {new Date(page.updatedAt.seconds * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                 </div>
               )}
            </div>
            <h1 className="text-4xl md:text-7xl font-bold text-white tracking-tight leading-[1.1] max-w-3xl">
              {page.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content Section Premium Layout */}
      <div className="max-w-4xl mx-auto px-6 -mt-20">
        <Card className="shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border-none rounded-[3rem] overflow-hidden bg-white ring-1 ring-black/5">
          <CardContent className="p-8 md:p-20">
            <div className="whitespace-pre-line text-xl text-slate-700 leading-relaxed font-medium">
              {page.content}
            </div>
          </CardContent>
        </Card>

        {/* Statistics Integration - Professional Dashboard */}
        {page.showStats && (
          <div className="mt-20 space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="flex flex-col items-center gap-4 text-center">
               <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-2">
                 <BarChart3 className="h-6 w-6" />
               </div>
               <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.5em]">
                 Data & Statistik Terpadu
               </h2>
               <p className="text-slate-500 text-sm max-w-sm mx-auto">Informasi demografi dan wilayah yang dihimpun secara real-time dari seluruh jaringan desa.</p>
            </div>

            {/* Summary Cards with Hover Effects */}
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { label: 'Populasi Total', value: summary.totalPop.toLocaleString(), unit: 'Jiwa', icon: Users, color: 'primary' },
                { label: 'Luas Wilayah', value: summary.totalArea.toFixed(2), unit: 'km²', icon: MapIcon, color: 'blue' },
                { label: 'Kepadatan', value: summary.density, unit: 'Jiwa/km²', icon: TrendingUp, color: 'amber' }
              ].map((item, i) => (
                <Card key={i} className="group bg-white border-none shadow-xl shadow-slate-200/50 rounded-[2rem] p-8 hover:translate-y-[-4px] transition-all duration-300">
                  <div className="flex flex-col gap-6">
                    <div className={`p-4 bg-${item.color}-50 rounded-2xl text-${item.color}-600 w-fit group-hover:scale-110 transition-transform`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                      <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                        {item.value} <span className="text-sm font-normal text-slate-400 ml-1">{item.unit}</span>
                      </h3>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Charts Section with Premium Styling */}
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="shadow-2xl shadow-slate-200/40 border-none rounded-[2.5rem] bg-white p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-sm font-bold flex items-center gap-3 text-slate-800">
                    <div className="h-2 w-2 bg-primary rounded-full" />
                    Distribusi Populasi
                  </h3>
                </div>
                <div className="h-72 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                      <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                      <ChartTooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }} 
                      />
                      <Bar dataKey="populasi" radius={[10, 10, 0, 0]} barSize={32}>
                        {statsData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="shadow-2xl shadow-slate-200/40 border-none rounded-[2.5rem] bg-white p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-sm font-bold flex items-center gap-3 text-slate-800">
                    <div className="h-2 w-2 bg-blue-500 rounded-full" />
                    Cakupan Luas Wilayah
                  </h3>
                </div>
                <div className="h-72 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                      <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                      <ChartTooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }} 
                      />
                      <Bar dataKey="luas" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
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
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">
             © {new Date().getFullYear()} Jaringan Data Nasional Indonesia
           </p>
        </footer>
      </div>
    </div>
  );
}
