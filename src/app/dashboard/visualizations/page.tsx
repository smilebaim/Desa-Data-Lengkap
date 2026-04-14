
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
  Loader2, BarChart3, TrendingUp, Users, Map as MapIcon, 
  Copy, CheckCheck, Link as LinkIcon, ExternalLink, Sparkles,
  Zap, Table as TableIcon, Info, MousePointer2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function VisualizationsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    toast({ title: "Berhasil Disalin", description: `ID Referensi "${text}" siap digunakan di modul lain.` });
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-slate-50/30 rounded-[3rem]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Sinkronisasi Data Real-time...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Pusat Analisis Data</h1>
          <p className="text-slate-500 font-medium">Pantau performa dan statistik wilayah desa secara visual dan akurat.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
           <Link href="/visualizations" target="_blank">
             <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl text-xs font-bold gap-2 text-slate-600 hover:text-primary">
               <ExternalLink className="h-3.5 w-3.5" />
               Dashboard Publik
             </Button>
           </Link>
           <div className="w-[1px] h-4 bg-slate-200" />
           <Button 
             variant="ghost" 
             size="sm" 
             className="h-9 px-4 rounded-xl text-xs font-bold gap-2 text-slate-600 hover:text-primary"
             onClick={() => handleCopy('/visualizations', 'share-url')}
            >
             {copiedId === 'share-url' ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <LinkIcon className="h-3.5 w-3.5" />}
             Salin URL
           </Button>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: 'Populasi Jaringan', value: totalPopulasi.toLocaleString(), unit: 'Jiwa', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Cakupan Wilayah', value: totalLuas, unit: 'km²', icon: MapIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Kepadatan Rata-rata', value: statsData.length > 0 ? (totalPopulasi / parseFloat(totalLuas)).toFixed(0) : 0, unit: 'Jiwa/km²', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' }
        ].map((item, i) => (
          <Card key={i} className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] group hover:scale-[1.02] transition-transform duration-500">
            <CardContent className="pt-8">
              <div className="flex items-center gap-5">
                <div className={`p-4 ${item.bg} ${item.color} rounded-[1.5rem] group-hover:rotate-6 transition-transform`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                    {item.value} <span className="text-xs font-normal text-slate-400 ml-1">{item.unit}</span>
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analysis Section */}
      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* Comparison Chart */}
        <Card className="lg:col-span-8 border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                 <BarChart3 className="h-5 w-5" />
               </div>
               <div>
                 <CardTitle className="text-lg">Komparasi Populasi Antar Desa</CardTitle>
                 <CardDescription>Visualisasi jumlah penduduk secara berdampingan.</CardDescription>
               </div>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="rounded-full text-[10px] font-bold uppercase tracking-wider h-8 border-primary/20 text-primary hover:bg-primary hover:text-white"
              onClick={() => handleCopy('stats-populasi-bar', 'btn-pop')}
            >
              {copiedId === 'btn-pop' ? <CheckCheck className="h-3 w-3 mr-1.5" /> : <Copy className="h-3 w-3 mr-1.5" />}
              Salin ID Sematan
            </Button>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={statsData}>
                  <defs>
                    <linearGradient id="colorPop" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                  <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <ChartTooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '16px' }} 
                  />
                  <Area type="monotone" dataKey="populasi" stroke="#22c55e" strokeWidth={4} fillOpacity={1} fill="url(#colorPop)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribution Chart */}
        <Card className="lg:col-span-4 border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-50">
            <div className="flex items-center justify-between mb-4">
               <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                 <Zap className="h-5 w-5" />
               </div>
               <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 rounded-full text-slate-400 hover:text-primary"
                onClick={() => handleCopy('stats-luas-pie', 'btn-luas')}
              >
                {copiedId === 'btn-luas' ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <CardTitle className="text-lg">Distribusi Wilayah</CardTitle>
            <CardDescription>Persentase luas lahan administratif.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 flex flex-col items-center">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statsData}
                    dataKey="luas"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={8}
                  >
                    {statsData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 w-full">
               {statsData.slice(0, 4).map((d, i) => (
                 <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="truncate">{d.name}</span>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Data Table */}
        <Card className="lg:col-span-12 border-none shadow-xl rounded-[3rem] bg-white overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                 <TableIcon className="h-5 w-5" />
               </div>
               <div>
                 <CardTitle className="text-lg">Audit Angka Statistik</CardTitle>
                 <CardDescription>Rincian data numerik per wilayah administratif.</CardDescription>
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="pl-10">Nama Desa</TableHead>
                  <TableHead className="text-center">Populasi (Jiwa)</TableHead>
                  <TableHead className="text-center">Luas Wilayah (km²)</TableHead>
                  <TableHead className="text-center">Kepadatan (Jiwa/km²)</TableHead>
                  <TableHead className="text-right pr-10">Status Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statsData.map((row, i) => (
                  <TableRow key={i} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="pl-10 font-black text-slate-700">{row.name}</TableCell>
                    <TableCell className="text-center font-mono font-bold text-primary">{row.populasi.toLocaleString()}</TableCell>
                    <TableCell className="text-center font-mono">{row.luas}</TableCell>
                    <TableCell className="text-center">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                         row.kepadatan > 500 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                       }`}>
                         {row.kepadatan}
                       </span>
                    </TableCell>
                    <TableCell className="text-right pr-10">
                       <div className="flex items-center justify-end gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
                         <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                         Terverifikasi
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Instructional Footer */}
      <div className="bg-slate-900 rounded-[3rem] p-12 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
        <div className="space-y-4 max-w-xl relative z-10 text-center md:text-left">
           <h3 className="text-2xl font-bold text-white flex items-center justify-center md:justify-start gap-3">
             <Sparkles className="h-6 w-6 text-primary" />
             Gunakan Data Dalam Narasi Anda
           </h3>
           <p className="text-slate-400 leading-relaxed">
             Setiap grafik di atas memiliki **ID Referensi**. Klik tombol "Salin ID Sematan" dan tempelkan ID tersebut ke dalam kolom deskripsi di **Map Tools** atau **Manajemen Halaman** untuk secara otomatis menyisipkan grafik tersebut di antarmuka publik.
           </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
           <Link href="/dashboard/map-tools">
             <Button className="h-14 px-8 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-bold gap-2">
                <MousePointer2 className="h-5 w-5" />
                Buka Map Tools
             </Button>
           </Link>
           <Link href="/dashboard/pages">
             <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/20 text-white hover:bg-white/10 font-bold gap-2">
                <Info className="h-5 w-5" />
                Manajemen Halaman
             </Button>
           </Link>
        </div>
      </div>
    </div>
  );
}
