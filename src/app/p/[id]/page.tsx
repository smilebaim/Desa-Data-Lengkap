
'use client';

import { useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Loader2, BarChart3, Users, Map as MapIcon, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, 
  ResponsiveContainer 
} from 'recharts';

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
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Halaman...</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Halaman Tidak Ditemukan</h2>
        <p className="text-slate-500 mb-6">Maaf, halaman yang Anda cari telah dihapus atau dipindahkan.</p>
        <Button onClick={() => router.push('/')}>Kembali ke Beranda</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-body">
      {/* Header Section */}
      <div className="bg-slate-900 pt-12 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=2013')] bg-cover bg-center" />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-8 pl-0">
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Peta
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
             <Badge className="bg-primary hover:bg-primary shadow-xl shadow-primary/20 border-none uppercase tracking-[0.2em] text-[10px] py-1 px-3">
               Publikasi Desa
             </Badge>
             {page.updatedAt && (
               <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest ml-2">
                 Update: {new Date(page.updatedAt.seconds * 1000).toLocaleDateString('id-ID')}
               </span>
             )}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">{page.title}</h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 -mt-12">
        <Card className="shadow-2xl border-none rounded-[2rem] overflow-hidden">
          <CardContent className="p-8 md:p-16 prose prose-slate max-w-none">
            <div className="whitespace-pre-line text-lg text-slate-700 leading-relaxed font-medium">
              {page.content}
            </div>
          </CardContent>
        </Card>

        {/* Statistics Integration */}
        {page.showStats && (
          <div className="mt-16 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex items-center gap-4">
               <div className="h-px flex-1 bg-slate-200" />
               <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                 <BarChart3 className="h-4 w-4 text-primary" /> Statistik & Data Terintegrasi
               </h2>
               <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-white border-none shadow-sm rounded-3xl p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Populasi Total</p>
                    <h3 className="text-xl font-bold text-slate-900">{summary.totalPop.toLocaleString()} <span className="text-xs font-normal">Jiwa</span></h3>
                  </div>
                </div>
              </Card>

              <Card className="bg-white border-none shadow-sm rounded-3xl p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                    <MapIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Luas Cakupan</p>
                    <h3 className="text-xl font-bold text-slate-900">{summary.totalArea.toFixed(2)} <span className="text-xs font-normal">km²</span></h3>
                  </div>
                </div>
              </Card>

              <Card className="bg-white border-none shadow-sm rounded-3xl p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Kepadatan</p>
                    <h3 className="text-xl font-bold text-slate-900">{summary.density} <span className="text-xs font-normal">Jiwa/km²</span></h3>
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-xl border-none rounded-3xl bg-white p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    Distribusi Populasi per Desa
                  </CardTitle>
                </CardHeader>
                <div className="h-64 mt-4">
                   <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis fontSize={10} axisLine={false} tickLine={false} />
                      <ChartTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="populasi" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="shadow-xl border-none rounded-3xl bg-white p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    Luas Wilayah Administratif
                  </CardTitle>
                </CardHeader>
                <div className="h-64 mt-4">
                   <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis fontSize={10} axisLine={false} tickLine={false} />
                      <ChartTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="luas" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        )}

        <footer className="mt-24 border-t border-slate-200 pt-12 text-center pb-12">
           <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-10 w-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">Sistem Informasi Desa Lengkap</span>
           </div>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">© {new Date().getFullYear()} Jaringan Spasial Desa Nasional Indonesia.</p>
        </footer>
      </div>
    </div>
  );
}
