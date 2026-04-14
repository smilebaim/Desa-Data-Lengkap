
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
  Settings2, LayoutPanelLeft, MousePointerClick
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
    toast({ title: "Berhasil Disalin", description: "Gunakan tautan ini untuk menyisipkan data statistik." });
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
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-[10px] font-bold text-primary px-3 rounded-xl hover:bg-primary/10"
                onClick={() => handleCopy(getEmbedId(), 'embed-id')}
              >
                {copiedId === 'embed-id' ? <CheckCheck className="h-3 w-3 mr-2" /> : <Share2 className="h-3 w-3 mr-2" />}
                REFERENSI SEMATAN
              </Button>
           </Card>
        </div>
      </div>

      {/* Visualizer Builder Tool */}
      <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden">
        <CardHeader className="border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-xl">
              <Settings2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Visualizer Builder</CardTitle>
              <CardDescription className="text-slate-400">Rancang jenis grafik yang ingin Anda sematkan ke modul lain.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="grid gap-8 lg:grid-cols-12 items-center">
            {/* Konfigurasi */}
            <div className="lg:col-span-4 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Pilih Metrik Data</label>
                <Select value={builderMetric} onValueChange={setBuilderMetric}>
                  <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="populasi">Jumlah Populasi</SelectItem>
                    <SelectItem value="luas">Luas Wilayah</SelectItem>
                    <SelectItem value="kepadatan">Kepadatan Penduduk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Tipe Visualisasi</label>
                <Select value={builderType} onValueChange={setBuilderType}>
                  <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Diagram Batang (Bar)</SelectItem>
                    <SelectItem value="pie">Diagram Lingkaran (Pie)</SelectItem>
                    <SelectItem value="line">Grafik Garis (Line)</SelectItem>
                    <SelectItem value="area">Grafik Area</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button 
                  className="w-full h-12 rounded-2xl shadow-xl shadow-primary/20"
                  onClick={() => handleCopy(getEmbedId(), 'copy-embed')}
                >
                  {copiedId === 'copy-embed' ? <CheckCheck className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  Salin ID Referensi: {getEmbedId()}
                </Button>
                <p className="mt-3 text-[9px] text-center text-slate-500 italic">Gunakan ID ini di modul "Map Tools" atau "Halaman Dinamis".</p>
              </div>
            </div>

            {/* Live Preview */}
            <div className="lg:col-span-8 bg-white/5 rounded-[2rem] p-6 border border-white/5 relative min-h-[300px]">
              <div className="absolute top-4 left-6 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Preview</span>
              </div>
              
              <div className="h-[250px] w-full mt-8">
                <ResponsiveContainer width="100%" height="100%">
                  {builderType === 'bar' ? (
                    <BarChart data={statsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                      <YAxis fontSize={9} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                      <ChartTooltip contentStyle={{ borderRadius: '12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }} />
                      <Bar dataKey={builderMetric} fill="#22c55e" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                  ) : builderType === 'pie' ? (
                    <PieChart>
                      <Pie data={statsData} dataKey={builderMetric} nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={5}>
                        {statsData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  ) : builderType === 'line' ? (
                    <LineChart data={statsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" fontSize={9} tick={{fill: '#64748b'}} />
                      <YAxis fontSize={9} tick={{fill: '#64748b'}} />
                      <ChartTooltip />
                      <Line type="monotone" dataKey={builderMetric} stroke="#22c55e" strokeWidth={3} dot={{r: 4}} />
                    </LineChart>
                  ) : (
                    <AreaChart data={statsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" fontSize={9} tick={{fill: '#64748b'}} />
                      <YAxis fontSize={9} tick={{fill: '#64748b'}} />
                      <ChartTooltip />
                      <Area type="monotone" dataKey={builderMetric} stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary text-white shadow-lg border-none rounded-3xl overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl"><Users className="h-6 w-6" /></div>
              <div>
                <p className="text-xs font-bold text-white/60 uppercase">Total Populasi</p>
                <h3 className="text-2xl font-bold">{totalPopulasi.toLocaleString()} <span className="text-xs font-normal">Jiwa</span></h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-none bg-blue-600 text-white rounded-3xl overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl"><MapIcon className="h-6 w-6" /></div>
              <div>
                <p className="text-xs font-bold text-white/60 uppercase">Cakupan Wilayah</p>
                <h3 className="text-2xl font-bold">{totalLuas} <span className="text-xs font-normal">km²</span></h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none bg-amber-500 text-white rounded-3xl overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl"><TrendingUp className="h-6 w-6" /></div>
              <div>
                <p className="text-xs font-bold text-white/60 uppercase">Rata-rata Kepadatan</p>
                <h3 className="text-2xl font-bold">{statsData.length > 0 ? (totalPopulasi / parseFloat(totalLuas)).toFixed(0) : 0} <span className="text-xs font-normal">Jiwa/km²</span></h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8 shadow-sm border-slate-200 rounded-[2rem]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Perbandingan Populasi Antar Desa
            </CardTitle>
            <CardDescription>Visualisasi jumlah jiwa di setiap wilayah administratif.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis fontSize={10} axisLine={false} tickLine={false} />
                  <ChartTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="populasi" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 shadow-sm border-slate-200 rounded-[2rem]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-primary" />
              Distribusi Luas Wilayah
            </CardTitle>
            <CardDescription>Persentase kontribusi lahan per desa.</CardDescription>
          </CardHeader>
          <CardContent>
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
                    {statsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-12 bg-slate-900 text-white border-none rounded-[2.5rem] p-6">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                 <h3 className="text-lg font-bold flex items-center justify-center md:justify-start gap-3">
                   <Sparkles className="h-5 w-5 text-primary" />
                   Gunakan Statistik di Modul Lain
                 </h3>
                 <p className="text-slate-400 text-sm">Gunakan ID Referensi dari Builder di atas untuk memilih grafik spesifik yang ingin ditampilkan di peta atau halaman profil.</p>
              </div>
              <div className="flex gap-3 shrink-0">
                 <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-2xl" onClick={() => handleCopy('/visualizations', 'footer-link')}>
                   <Copy className="h-4 w-4 mr-2" /> Salin URL Publik
                 </Button>
                 <Link href="/visualizations" target="_blank">
                    <Button className="bg-primary hover:bg-primary/90 rounded-2xl">
                      <ExternalLink className="h-4 w-4 mr-2" /> Buka Dashboard Publik
                    </Button>
                 </Link>
              </div>
           </div>
        </Card>
      </div>
    </div>
  );
}
