
'use client';

import { useMemo, useState } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Loader2, BarChart3, TrendingUp, Users, Map as MapIcon, 
  Copy, CheckCheck, Link as LinkIcon, ExternalLink, Sparkles,
  Zap, Table as TableIcon, Plus, Trash2, LayoutGrid, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function VisualizationsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const villageQuery = useMemo(() => query(collection(db, 'villages'), orderBy('name', 'asc')), [db]);
  const { data: villages, isLoading: isVillagesLoading } = useCollection(villageQuery);

  const visualizerQuery = useMemo(() => query(collection(db, 'visualizers'), orderBy('createdAt', 'desc')), [db]);
  const { data: visualizers, isLoading: isVisualizersLoading } = useCollection(visualizerQuery);

  const [newChart, setNewChart] = useState({
    title: '',
    metric: 'population',
    chartType: 'bar'
  });

  const statsData = useMemo(() => {
    if (!villages) return [];
    return villages.map(v => ({
      name: v.name,
      population: v.population || 0,
      area: v.area || 0,
      density: v.area > 0 ? parseFloat(((v.population || 0) / v.area).toFixed(2)) : 0
    }));
  }, [villages]);

  const totalPopulasi = useMemo(() => statsData.reduce((acc, curr) => acc + curr.population, 0), [statsData]);
  const totalLuas = useMemo(() => statsData.reduce((acc, curr) => acc + curr.area, 0).toFixed(2), [statsData]);

  const handleCreateChart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChart.title) return toast({ title: "Galat", description: "Judul grafik harus diisi.", variant: "destructive" });
    
    setIsSubmitting(true);
    const collRef = collection(db, 'visualizers');
    const data = { ...newChart, createdAt: serverTimestamp() };

    addDoc(collRef, data)
      .then(() => {
        toast({ title: "Berhasil", description: "Grafik baru ditambahkan ke pustaka." });
        setNewChart({ title: '', metric: 'population', chartType: 'bar' });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: collRef.path, operation: 'create', requestResourceData: data }));
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleDeleteChart = async (id: string) => {
    if (!confirm('Hapus grafik ini dari pustaka?')) return;
    const docRef = doc(db, 'visualizers', id);
    deleteDoc(docRef)
      .then(() => toast({ title: "Berhasil", description: "Grafik dihapus." }))
      .catch(async () => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'delete' })));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Berhasil Disalin", description: `Gunakan kode ini di editor konten.` });
  };

  if (isVillagesLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-slate-50/30 rounded-[3rem]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Sinkronisasi Data Real-time...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Pusat Analisis & Visualisasi</h1>
          <p className="text-slate-500 font-medium">Buat grafik kustom dan sematkan ke dalam konten naratif Anda.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <Link href="/visualizations" target="_blank">
             <Button variant="outline" className="h-11 px-6 rounded-2xl text-xs font-bold gap-2 shadow-sm">
               <ExternalLink className="h-3.5 w-3.5" />
               Dashboard Publik
             </Button>
           </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Metric Highlights */}
        <div className="lg:col-span-12 grid gap-6 md:grid-cols-3">
          {[
            { label: 'Populasi Jaringan', value: totalPopulasi.toLocaleString(), unit: 'Jiwa', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Cakupan Wilayah', value: totalLuas, unit: 'km²', icon: MapIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Kepadatan Rata-rata', value: statsData.length > 0 ? (totalPopulasi / parseFloat(totalLuas)).toFixed(0) : 0, unit: 'Jiwa/km²', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' }
          ].map((item, i) => (
            <Card key={i} className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem]">
              <CardContent className="pt-8">
                <div className="flex items-center gap-5">
                  <div className={`p-4 ${item.bg} ${item.color} rounded-[1.5rem]`}>
                    <item.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{item.value}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart Builder Form */}
        <Card className="lg:col-span-5 border-none shadow-2xl rounded-[3rem] bg-slate-900 text-white overflow-hidden sticky top-6">
          <CardHeader className="p-8 border-b border-white/5">
            <CardTitle className="text-xl flex items-center gap-3">
              <Plus className="h-5 w-5 text-primary" />
              Buat Grafik Baru
            </CardTitle>
            <CardDescription className="text-slate-400">Rancang visualisasi data kustom untuk disematkan.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-400">Judul Grafik</Label>
              <Input 
                placeholder="Misal: Perbandingan Populasi 2024" 
                value={newChart.title}
                onChange={e => setNewChart({...newChart, title: e.target.value})}
                className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-primary/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400">Metrik Data</Label>
                <Select value={newChart.metric} onValueChange={v => setNewChart({...newChart, metric: v})}>
                  <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="population">Populasi</SelectItem>
                    <SelectItem value="area">Luas Wilayah</SelectItem>
                    <SelectItem value="density">Kepadatan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400">Tipe Grafik</Label>
                <Select value={newChart.chartType} onValueChange={v => setNewChart({...newChart, chartType: v})}>
                  <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20" 
              onClick={handleCreateChart}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Sparkles className="mr-2 h-5 w-5" />}
              Tambahkan ke Pustaka
            </Button>
          </CardContent>
        </Card>

        {/* Saved Visualizers Library */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-none shadow-xl rounded-[3rem] bg-white overflow-hidden min-h-[500px]">
            <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-3">
                  <LayoutGrid className="h-5 w-5 text-primary" />
                  Pustaka Visualisasi
                </CardTitle>
                <CardDescription>Daftar grafik kustom yang siap disematkan.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
               {isVisualizersLoading ? (
                 <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" /></div>
               ) : visualizers?.length === 0 ? (
                 <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-4">
                   <BarChart3 className="h-12 w-12 opacity-10" />
                   <p className="text-sm font-medium">Belum ada grafik kustom yang dibuat.</p>
                 </div>
               ) : (
                 <div className="divide-y divide-slate-50">
                    {visualizers?.map((viz: any) => (
                      <div key={viz.id} className="p-6 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-5">
                          <div className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                            {viz.chartType === 'bar' && <BarChart3 className="h-6 w-6" />}
                            {viz.chartType === 'pie' && <Zap className="h-6 w-6" />}
                            {viz.chartType === 'line' && <TrendingUp className="h-6 w-6" />}
                            {viz.chartType === 'area' && <TrendingUp className="h-6 w-6" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{viz.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="text-[9px] font-black uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-500">{viz.metric}</span>
                               <span className="text-[9px] font-black uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-500">{viz.chartType}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <Button 
                             variant="outline" 
                             size="sm" 
                             className="rounded-xl h-9 text-[10px] font-bold gap-2 hover:bg-primary hover:text-white transition-all"
                             onClick={() => handleCopy(`[CHART:${viz.id}]`, viz.id)}
                           >
                             {copiedId === viz.id ? <CheckCheck className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                             SALIN KODE SEMATAN
                           </Button>
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-9 w-9 text-red-400 hover:text-red-500 hover:bg-red-50"
                             onClick={() => handleDeleteChart(viz.id)}
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                      </div>
                    ))}
                 </div>
               )}
            </CardContent>
          </Card>
          
          <div className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10 flex items-start gap-4">
             <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
               <Info className="h-5 w-5" />
             </div>
             <div className="space-y-2">
                <h4 className="font-bold text-slate-900">Cara Menggunakan Kode Sematan</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Salin <strong>Kode Sematan</strong> dari pustaka di atas (contoh: <code>[CHART:abc-123]</code>) dan tempelkan ke dalam area teks pada modul <strong>Manajemen Halaman</strong> atau <strong>Map Tools</strong>. Grafik akan muncul secara otomatis menggantikan kode tersebut di halaman publik.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
