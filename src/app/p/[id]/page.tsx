
'use client';

import { useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Loader2, BarChart3, Users, Map as MapIcon } from 'lucide-react';
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
        <h2 className="text-2xl font-bold text-slate-900">Halaman Tidak Ditemukan</h2>
        <p className="text-slate-500 mb-6">Maaf, halaman yang Anda cari telah dihapus atau dipindahkan.</p>
        <Button onClick={() => router.push('/')}>Kembali ke Beranda</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Section */}
      <div className="bg-slate-900 pt-10 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=2013')] bg-cover bg-center" />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-6 pl-0">
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Peta
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
             <Badge className="bg-primary hover:bg-primary shadow-none uppercase tracking-widest text-[10px]">Informasi Desa</Badge>
             {page.updatedAt && (
               <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                 Terakhir Diperbarui: {new Date(page.updatedAt.seconds * 1000).toLocaleDateString('id-ID')}
               </span>
             )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">{page.title}</h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 -mt-10">
        <Card className="shadow-2xl border-none rounded-3xl overflow-hidden">
          <CardContent className="p-8 md:p-12 prose prose-slate max-w-none">
            <div className="whitespace-pre-line text-lg text-slate-700 leading-relaxed">
              {page.content}
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Stats Integration */}
        {page.showStats && (
          <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center gap-3">
               <div className="h-1px flex-1 bg-slate-200" />
               <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                 <BarChart3 className="h-4 w-4" /> Lampiran Data Statistik
               </h2>
               <div className="h-1px flex-1 bg-slate-200" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-sm border-slate-200 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Populasi Terkini
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis fontSize={10} axisLine={false} tickLine={false} />
                      <ChartTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="populasi" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <MapIcon className="h-4 w-4 text-primary" />
                    Luas Wilayah (km²)
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis fontSize={10} axisLine={false} tickLine={false} />
                      <ChartTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="luas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <footer className="mt-20 border-t pt-10 text-center">
           <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold text-slate-900">Sistem Informasi Desa Lengkap</span>
           </div>
           <p className="text-xs text-slate-400 font-medium">© {new Date().getFullYear()} Jaringan Spasial Desa Nasional Indonesia.</p>
        </footer>
      </div>
    </div>
  );
}
