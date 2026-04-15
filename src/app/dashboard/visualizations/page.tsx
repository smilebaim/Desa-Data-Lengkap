
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
  Zap, Table as TableIcon, Plus, Trash2, LayoutGrid, Info, Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function VisualizationsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoize queries to prevent infinite loop
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
  const totalLuas = useMemo(() => statsData.reduce((acc, curr) => acc + curr.area, 0), [statsData]);

  const handleCreateChart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChart.title) return toast({ title: "Galat", description: "Judul grafik harus diisi.", variant: "destructive" });
    
    setIsSubmitting(true);
    const data = { ...newChart, createdAt: serverTimestamp() };

    addDoc(collection(db, 'visualizers'), data)
      .then(() => {
        toast({ title: "Berhasil", description: "Grafik baru ditambahkan ke pustaka." });
        setNewChart({ title: '', metric: 'population', chartType: 'bar' });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'visualizers', operation: 'create', requestResourceData: data }));
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleDeleteChart = async (id: string) => {
    if (!id || !confirm('Hapus grafik ini?')) return;
    const docRef = doc(db, 'visualizers', id);
    deleteDoc(docRef)
      .then(() => toast({ title: "Berhasil", description: "Grafik dihapus." }))
      .catch(async () => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'delete' })));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Disalin!", description: `Kode sematan ${text} siap digunakan.` });
  };

  if (isVillagesLoading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pusat Statistik & Visualisasi</h1>
          <p className="text-slate-500">Kelola pustaka grafik untuk disematkan ke modul lain.</p>
        </div>
        <Link href="/visualizations" target="_blank">
           <Button variant="outline" className="rounded-xl h-11 gap-2">
             <ExternalLink className="h-4 w-4" /> Buka Dashboard Publik
           </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-[2rem] border-none shadow-xl bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl text-green-600 shadow-sm"><Users className="h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-black text-green-800/40 uppercase tracking-widest">Total Populasi</p>
                <h3 className="text-2xl font-black text-green-900">{totalPopulasi.toLocaleString()} Jiwa</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-none shadow-xl bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm"><MapIcon className="h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-black text-blue-800/40 uppercase tracking-widest">Luas Wilayah</p>
                <h3 className="text-2xl font-black text-blue-900">{totalLuas.toFixed(2)} km²</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-none shadow-xl bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl text-amber-600 shadow-sm"><TrendingUp className="h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-black text-amber-800/40 uppercase tracking-widest">Rata-rata Kepadatan</p>
                <h3 className="text-2xl font-black text-amber-900">{(totalLuas > 0 ? (totalPopulasi / totalLuas) : 0).toFixed(0)}/km²</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <Card className="lg:col-span-4 border-none shadow-2xl rounded-[2.5rem] bg-slate-900 text-white p-8">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl flex items-center gap-3"><Plus className="h-5 w-5 text-primary" /> Buat Grafik Kustom</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400">JUDUL GRAFIK</Label>
              <Input 
                value={newChart.title}
                onChange={e => setNewChart({...newChart, title: e.target.value})}
                className="bg-white/5 border-white/10 text-white h-12 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400">METRIK</Label>
                <Select value={newChart.metric} onValueChange={v => setNewChart({...newChart, metric: v})}>
                  <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="population">Populasi</SelectItem>
                    <SelectItem value="area">Luas Wilayah</SelectItem>
                    <SelectItem value="density">Kepadatan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400">TIPE DIAGRAM</Label>
                <Select value={newChart.chartType} onValueChange={v => setNewChart({...newChart, chartType: v})}>
                  <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-bold" onClick={handleCreateChart} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : <Sparkles className="h-5 w-5 mr-2" />}
              Simpan ke Pustaka
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-8 shadow-xl border-none rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-50">
            <CardTitle className="text-lg flex items-center gap-3"><LayoutGrid className="h-5 w-5 text-primary" /> Pustaka Visualisasi</CardTitle>
            <CardDescription>Grafik yang Anda buat bisa disematkan menggunakan kode di bawah.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isVisualizersLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" /></div>
            ) : visualizers?.length === 0 ? (
              <div className="text-center py-20 text-slate-400">Belum ada grafik kustom.</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {visualizers?.map((viz: any) => (
                  <div key={viz.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-5">
                      <div className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                        {viz.chartType === 'bar' ? <BarChart3 className="h-6 w-6" /> : <TrendingUp className="h-6 w-6" />}
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
                        variant="outline" size="sm" className="rounded-xl h-9 text-[10px] font-bold gap-2"
                        onClick={() => handleCopy(`[CHART:${viz.id}]`, viz.id)}
                      >
                        {copiedId === viz.id ? <CheckCheck className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        SALIN KODE
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-red-400" onClick={() => handleDeleteChart(viz.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
