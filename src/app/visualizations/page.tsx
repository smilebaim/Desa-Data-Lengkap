
'use client';

import { useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { Loader2, Users, Map as MapIcon, TrendingUp, BarChart3, PieChart as PieIcon, ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const COLORS = ['#166534', '#15803d', '#16a34a', '#22c55e', '#4ade80', '#86efac'];

export default function PublicVisualizationsPage() {
  const db = useFirestore();
  
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Menghimpun Data Nasional...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-body">
      {/* Premium Header */}
      <div className="bg-slate-900 pt-16 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426')] bg-cover bg-center" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <Link href="/">
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 mb-8 pl-0 group">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
              KEMBALI KE PETA
            </Button>
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">Dashboard Statistik Publik</h1>
              <p className="text-white/50 text-sm font-medium uppercase tracking-widest">Visualisasi Data Geospasial Desa Lengkap</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-20 space-y-8">
        {/* Metric Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { label: 'Total Populasi', value: totalPopulasi.toLocaleString(), unit: 'Jiwa', icon: Users, color: 'bg-primary' },
            { label: 'Cakupan Wilayah', value: totalLuas, unit: 'km²', icon: MapIcon, color: 'bg-blue-600' },
            { label: 'Kepadatan Rata-rata', value: statsData.length > 0 ? (totalPopulasi / parseFloat(totalLuas)).toFixed(0) : 0, unit: 'Jiwa/km²', icon: TrendingUp, color: 'bg-amber-500' }
          ].map((item, i) => (
            <Card key={i} className={`${item.color} text-white border-none shadow-2xl shadow-slate-200 rounded-[2rem] overflow-hidden`}>
              <CardContent className="pt-8">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-white/20 rounded-2xl"><item.icon className="h-6 w-6" /></div>
                  <div>
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">{item.label}</p>
                    <h3 className="text-3xl font-bold tracking-tight">{item.value} <span className="text-sm font-normal text-white/50">{item.unit}</span></h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          <Card className="lg:col-span-8 shadow-xl border-none rounded-[2.5rem] bg-white p-6">
            <CardHeader className="px-2">
              <CardTitle className="text-lg flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-primary" />
                Distribusi Populasi per Desa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <ChartTooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="populasi" fill="hsl(var(--primary))" radius={[10, 10, 0, 0]} barSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-4 shadow-xl border-none rounded-[2.5rem] bg-white p-6">
            <CardHeader className="px-2">
              <CardTitle className="text-lg flex items-center gap-3">
                <PieIcon className="h-5 w-5 text-primary" />
                Luas Wilayah
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col items-center">
              <div className="h-[300px] w-full">
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
                      paddingAngle={5}
                    >
                      {statsData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip contentStyle={{ borderRadius: '20px', border: 'none' }} />
                    <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-12 shadow-xl border-none rounded-[2.5rem] bg-white p-8">
            <CardHeader className="px-0">
              <CardTitle className="text-lg flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                Grafik Kepadatan Penduduk (Jiwa/km²)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pt-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={statsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} />
                    <ChartTooltip contentStyle={{ borderRadius: '20px', border: 'none' }} />
                    <Line type="monotone" dataKey="kepadatan" stroke="#166534" strokeWidth={4} dot={{ r: 6, fill: '#166534', strokeWidth: 2, stroke: '#fff' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <footer className="text-center pt-20">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-bold text-slate-900">Desa Lengkap</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">© 2024 Jaringan Spasial Desa Nasional</p>
        </footer>
      </div>
    </div>
  );
}
