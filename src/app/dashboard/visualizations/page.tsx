
'use client';

import { useMemo, useState, useCallback } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Loader2, BarChart3, TrendingUp, Users, Map as MapIcon, 
  Copy, CheckCheck, Link as LinkIcon, ExternalLink, Sparkles,
  Zap, Table as TableIcon, Plus, Trash2, LayoutGrid, Info, Database, Edit2, X,
  PieChart as PieIcon, Save
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
  const [editingId, setEditingId] = useState<string | null>(null);

  // Memoize queries to prevent infinite loop
  const villageQuery = useMemo(() => query(collection(db, 'villages'), orderBy('name', 'asc')), [db]);
  const { data: villages, isLoading: isVillagesLoading } = useCollection(villageQuery);

  const visualizerQuery = useMemo(() => query(collection(db, 'visualizers'), orderBy('createdAt', 'desc')), [db]);
  const { data: visualizers, isLoading: isVisualizersLoading } = useCollection(visualizerQuery);

  const [formData, setFormData] = useState({
    title: '',
    metric: 'population',
    chartType: 'bar'
  });

  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormData({ title: '', metric: 'population', chartType: 'bar' });
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return toast({ title: "Galat", description: "Judul grafik harus diisi.", variant: "destructive" });
    
    setIsSubmitting(true);
    const data = { 
      ...formData, 
      createdAt: editingId ? undefined : serverTimestamp(), 
      updatedAt: serverTimestamp() 
    };

    const actionPromise = editingId 
      ? updateDoc(doc(db, 'visualizers', editingId), data)
      : addDoc(collection(db, 'visualizers'), data);

    actionPromise
      .then(() => {
        toast({ 
          title: "Berhasil", 
          description: editingId ? "Konfigurasi grafik diperbarui." : "Grafik baru ditambahkan ke pustaka." 
        });
        resetForm();
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ 
          path: 'visualizers', 
          operation: editingId ? 'update' : 'create', 
          requestResourceData: data 
        }));
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleEdit = (viz: any) => {
    setEditingId(viz.id);
    setFormData({
      title: viz.title || '',
      metric: viz.metric || 'population',
      chartType: viz.chartType || 'bar'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteChart = async (id: string) => {
    if (!id || !confirm('Hapus grafik ini secara permanen?')) return;
    const docRef = doc(db, 'visualizers', id);
    deleteDoc(docRef)
      .then(() => toast({ title: "Berhasil", description: "Grafik dihapus dari sistem." }))
      .catch(async () => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'delete' })));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Disalin!", description: `Kode sematan ${text} siap digunakan.` });
  };

  if (isVillagesLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pusat Statistik & Visualisasi</h1>
          <p className="text-slate-500">Kelola pustaka grafik untuk disematkan ke narasi profil desa atau halaman IDM.</p>
        </div>
        <Link href="/visualizations" target="_blank">
           <Button variant="outline" className="rounded-xl h-11 gap-2 shadow-sm">
             <ExternalLink className="h-4 w-4" /> Buka Dashboard Publik
           </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-[2rem] border-none shadow-xl bg-green-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl text-green-600 shadow-sm border border-green-100"><Users className="h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-black text-green-800/40 uppercase tracking-widest">Total Populasi</p>
                <h3 className="text-2xl font-black text-green-900">{totalPopulasi.toLocaleString()} <span className="text-sm font-medium opacity-40">Jiwa</span></h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-none shadow-xl bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm border border-blue-100"><MapIcon className="h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-black text-blue-800/40 uppercase tracking-widest">Luas Wilayah</p>
                <h3 className="text-2xl font-black text-blue-900">{totalLuas.toFixed(2)} <span className="text-sm font-medium opacity-40">km²</span></h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-none shadow-xl bg-amber-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl text-amber-600 shadow-sm border border-amber-100"><TrendingUp className="h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-black text-amber-800/40 uppercase tracking-widest">Kepadatan Rata-rata</p>
                <h3 className="text-2xl font-black text-amber-900">{(totalLuas > 0 ? (totalPopulasi / totalLuas) : 0).toFixed(0)} <span className="text-sm font-medium opacity-40">/km²</span></h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <Card className="lg:col-span-4 border-none shadow-2xl rounded-[2.5rem] bg-slate-900 text-white p-8 h-fit sticky top-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                {editingId ? <Edit2 className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
                <span>{editingId ? 'Edit Konfigurasi' : 'Buat Grafik Baru'}</span>
              </div>
              {editingId && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
            <CardDescription className="text-slate-400">Tentukan metrik dan gaya visual untuk grafik Anda.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} className="px-0 space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 tracking-wider">JUDUL GRAFIK</Label>
              <Input 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Misal: Sebaran Penduduk"
                className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus-visible:ring-primary/50"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400 tracking-wider">METRIK DATA</Label>
                <Select value={formData.metric} onValueChange={v => setFormData({...formData, metric: v})}>
                  <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 text-white border-white/10">
                    <SelectItem value="population">Populasi (Jiwa)</SelectItem>
                    <SelectItem value="area">Luas (km²)</SelectItem>
                    <SelectItem value="density">Kepadatan (/km²)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400 tracking-wider">TIPE DIAGRAM</Label>
                <Select value={formData.chartType} onValueChange={v => setFormData({...formData, chartType: v})}>
                  <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 text-white border-white/10">
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                    <SelectItem value="radar">Radar Chart</SelectItem>
                    <SelectItem value="composed">Composed (Combo)</SelectItem>
                    <SelectItem value="scatter">Scatter Plot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : (editingId ? <Save className="h-5 w-5 mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />)}
              {editingId ? 'Simpan Perubahan' : 'Tambahkan ke Pustaka'}
            </Button>
            {editingId && (
              <Button type="button" variant="ghost" className="w-full text-slate-400" onClick={resetForm}>
                Batalkan Pengeditan
              </Button>
            )}
          </form>
        </Card>

        <Card className="lg:col-span-8 shadow-xl border-none rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-3">
                <LayoutGrid className="h-5 w-5 text-primary" /> 
                Katalog Visualisasi Global
              </CardTitle>
              <CardDescription>Semua grafik di bawah ini tersinkronisasi dengan data desa terbaru.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isVisualizersLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" /></div>
            ) : visualizers?.length === 0 ? (
              <div className="text-center py-24 flex flex-col items-center gap-3">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                  <Database className="h-8 w-8" />
                </div>
                <p className="text-slate-400 font-medium">Belum ada grafik kustom yang terdaftar.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {visualizers?.map((viz: any) => (
                  <div key={viz.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all group">
                    <div className="flex items-center gap-5">
                      <div className="h-12 w-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary shadow-sm transition-colors">
                        {viz.chartType === 'bar' ? <BarChart3 className="h-6 w-6" /> : viz.chartType === 'pie' ? <PieIcon className="h-6 w-6" /> : <TrendingUp className="h-6 w-6" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                          {viz.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-black uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-500 border border-slate-200">{viz.metric}</span>
                          <span className="text-[9px] font-black uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-500 border border-slate-200">{viz.chartType}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="outline" size="sm" className="rounded-xl h-9 text-[10px] font-bold gap-2 border-slate-200 hover:border-primary hover:text-primary transition-all"
                        onClick={() => handleCopy(`[CHART:${viz.id}]`, viz.id)}
                      >
                        {copiedId === viz.id ? <CheckCheck className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        SALIN KODE
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-primary" onClick={() => handleEdit(viz)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-red-300 hover:text-red-500 hover:bg-red-50" onClick={() => handleDeleteChart(viz.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
