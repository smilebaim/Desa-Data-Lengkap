'use client';

import { useMemo, useState, useCallback } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Loader2, BarChart3, TrendingUp, Users, Map as MapIcon, 
  Copy, CheckCheck, ExternalLink, Sparkles, Save,
  Database, Edit2, X, PieChart as PieChartIcon, LayoutGrid, Trash2, Coins, Plus
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

  const villageQuery = useMemo(() => query(collection(db, 'villages'), orderBy('name', 'asc')), [db]);
  const { data: villages } = useCollection(villageQuery);

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
      idmScore: v.idmScore || 0,
      budgetAllocation: v.budgetAllocation || 0
    }));
  }, [villages]);

  const totalPopulasi = useMemo(() => statsData.reduce((acc, curr) => acc + curr.population, 0), [statsData]);
  const totalAnggaran = useMemo(() => statsData.reduce((acc, curr) => acc + curr.budgetAllocation, 0), [statsData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return toast({ title: "Galat", description: "Judul grafik harus diisi.", variant: "destructive" });
    
    setIsSubmitting(true);
    const dataToSave = { 
      ...formData, 
      updatedAt: serverTimestamp() 
    };

    if (editingId) {
      const docRef = doc(db, 'visualizers', editingId);
      updateDoc(docRef, dataToSave)
        .then(() => {
          toast({ title: "Berhasil", description: "Konfigurasi grafik diperbarui." });
          resetForm();
        })
        .catch(async () => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: dataToSave })))
        .finally(() => setIsSubmitting(false));
    } else {
      addDoc(collection(db, 'visualizers'), { ...dataToSave, createdAt: serverTimestamp() })
        .then(() => {
          toast({ title: "Berhasil", description: "Grafik baru ditambahkan." });
          resetForm();
        })
        .catch(async () => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'visualizers', operation: 'create', requestResourceData: dataToSave })))
        .finally(() => setIsSubmitting(false));
    }
  };

  const handleEdit = (viz: any) => {
    setEditingId(viz.id);
    setFormData({ title: viz.title, metric: viz.metric, chartType: viz.chartType });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Disalin!", description: "Kode sematan siap digunakan di halaman profil." });
  };

  return (
    <div className="space-y-10 pb-20 text-left">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pusat Statistik & Visualisasi</h1>
          <p className="text-slate-500">Kelola pustaka grafik untuk narasi profil desa atau laporan strategis.</p>
        </div>
        <Link href="/visualizations" target="_blank">
           <Button variant="outline" className="rounded-xl h-11 gap-2 shadow-sm">
             <ExternalLink className="h-4 w-4" /> Dashboard Publik
           </Button>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <Card className="lg:col-span-4 border-none shadow-2xl rounded-[2.5rem] bg-slate-900 text-white p-8 h-fit sticky top-6">
          <CardHeader className="px-0 pt-0 text-left">
            <CardTitle className="text-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                {editingId ? <Edit2 className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
                <span>{editingId ? 'Edit Diagram' : 'Buat Baru'}</span>
              </div>
              {editingId && <Button variant="ghost" size="icon" onClick={resetForm} className="text-white hover:bg-white/10"><X className="h-4 w-4" /></Button>}
            </CardTitle>
            <CardDescription className="text-slate-400">Atur metrik dan gaya visual grafik.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Judul Grafik</Label>
              <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-white/5 border-white/10 text-white h-12" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Metrik</Label>
                <Select value={formData.metric} onValueChange={v => setFormData({...formData, metric: v})}>
                  <SelectTrigger className="bg-white/5 border-white/10 h-12 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-900 text-white border-white/10">
                    <SelectItem value="population">Populasi</SelectItem>
                    <SelectItem value="idmScore">Skor IDM</SelectItem>
                    <SelectItem value="budgetAllocation">Anggaran</SelectItem>
                    <SelectItem value="area">Luas Wilayah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gaya Visual</Label>
                <Select value={formData.chartType} onValueChange={v => setFormData({...formData, chartType: v})}>
                  <SelectTrigger className="bg-white/5 border-white/10 h-12 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-900 text-white border-white/10">
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                    <SelectItem value="radar">Radar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                    <SelectItem value="composed">Composed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-bold shadow-lg" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : (editingId ? <Save className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />)}
              {editingId ? 'Simpan Perubahan' : 'Tambahkan ke Pustaka'}
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-8 shadow-xl border-none rounded-[2.5rem] bg-white overflow-hidden text-left">
          <CardHeader className="p-8 border-b">
            <CardTitle className="text-lg flex items-center gap-3"><LayoutGrid className="h-5 w-5 text-primary" /> Katalog Visualisasi</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isVisualizersLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" /></div>
            ) : (
              <div className="divide-y">
                {visualizers?.map((viz: any) => (
                  <div key={viz.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 group">
                    <div className="flex items-center gap-5">
                      <div className="h-12 w-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary shadow-sm transition-colors">
                        {viz.chartType === 'bar' ? <BarChart3 className="h-6 w-6" /> : viz.chartType === 'pie' ? <PieChartIcon className="h-6 w-6" /> : <TrendingUp className="h-6 w-6" />}
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                          {viz.title}
                          <span className="text-[9px] font-black uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-500 border border-slate-200">{viz.metric}</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Tipe: {viz.chartType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" className="rounded-xl gap-2 h-9 px-4 text-xs font-bold border-slate-200" onClick={() => handleCopy(`[CHART:${viz.id}]`, viz.id)}>
                        {copiedId === viz.id ? <CheckCheck className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />} 
                        {copiedId === viz.id ? 'TERSALIN' : 'SALIN KODE'}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl" onClick={() => handleEdit(viz)}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl" onClick={() => { if(confirm('Hapus grafik ini secara permanen?')) deleteDoc(doc(db, 'visualizers', viz.id)) }}><Trash2 className="h-4 w-4" /></Button>
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