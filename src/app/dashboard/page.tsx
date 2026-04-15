
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, limit } from 'firebase/firestore';
import { LayoutDashboard, Map as MapIcon, Menu as MenuIcon, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { profile } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const seedDemoData = async () => {
    setIsSeeding(true);
    try {
      // 1. Create Villages
      const villagesRef = collection(db, 'villages');
      const v1 = await addDoc(villagesRef, { name: 'Desa Sukamaju', province: 'Jawa Barat', population: 4500, area: 12.5, location: { lat: -6.9175, lng: 107.6191 }, description: 'Desa percontohan digital.' });
      const v2 = await addDoc(villagesRef, { name: 'Desa Mekarsari', province: 'Bali', population: 3200, area: 8.2, location: { lat: -8.4095, lng: 115.1889 }, description: 'Sentra kerajinan tangan.' });

      // 2. Create Visualizers (Charts)
      const vizRef = collection(db, 'visualizers');
      const vizPop = await addDoc(vizRef, { title: 'Perbandingan Populasi', metric: 'population', chartType: 'bar', createdAt: serverTimestamp() });
      const vizArea = await addDoc(vizRef, { title: 'Distribusi Wilayah', metric: 'area', chartType: 'pie', createdAt: serverTimestamp() });
      const vizDensity = await addDoc(vizRef, { title: 'Tren Kepadatan', metric: 'density', chartType: 'line', createdAt: serverTimestamp() });

      // 3. Create Dynamic Pages
      const pagesRef = collection(db, 'pages');
      await addDoc(pagesRef, { 
        title: 'Statistik Nasional Desa', 
        content: `Halaman ini menampilkan agregat data desa secara nasional.\n\nBerikut adalah grafik populasi:\n[CHART:${vizPop.id}]\n\nDan distribusi luas wilayah:\n[CHART:${vizArea.id}]`, 
        showStats: true, 
        updatedAt: serverTimestamp() 
      });

      await addDoc(pagesRef, { 
        title: 'Indeks Desa Membangun (IDM)', 
        content: `Analisis perkembangan kemandirian desa berdasarkan indikator sosial, ekonomi, dan ekologi.\n\nGrafik Kepadatan:\n[CHART:${vizDensity.id}]`, 
        showStats: true, 
        updatedAt: serverTimestamp() 
      });

      await addDoc(pagesRef, { 
        title: 'Informasi Harga Komoditas', 
        content: 'Daftar harga bahan pokok di tingkat desa untuk memantau inflasi lokal.', 
        showStats: false, 
        updatedAt: serverTimestamp() 
      });

      // 4. Create Menus
      const menusRef = collection(db, 'menus');
      await addDoc(menusRef, { label: 'Statistik', icon: 'BarChart', href: '/visualizations', order: 1, position: 'bottom' });
      await addDoc(menusRef, { label: 'Data Desa', icon: 'Landmark', href: '/dashboard/villages', order: 2, position: 'bottom' });

      toast({ title: "Demo Data Berhasil", description: "Halaman, Grafik, dan Menu dummy telah dibuat." });
    } catch (error) {
      toast({ title: "Gagal Membuat Data", variant: "destructive" });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Selamat Datang, {profile?.name || 'Admin'}</h1>
          <p className="text-muted-foreground">Kelola konfigurasi peta Desa Lengkap dari sini.</p>
        </div>
        <Button 
          onClick={seedDemoData} 
          disabled={isSeeding}
          className="bg-primary hover:bg-primary/90 rounded-2xl shadow-lg shadow-primary/20"
        >
          {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Buat Data Demo (Dummy)
        </Button>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Status Sistem</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">Online</div>
            <p className="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-1">
              <CheckCircle2 className="h-3 w-3" /> Sinkronisasi Aktif
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Modul Navigasi</CardTitle>
            <MenuIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">Aktif</div>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Terhubung ke Peta Publik</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Cakupan Wilayah</CardTitle>
            <MapIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">Nasional</div>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">38 Provinsi Terdeteksi</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-900 text-white p-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <CardHeader className="px-0">
          <CardTitle className="text-2xl font-bold">Panduan Cepat Dashboard</CardTitle>
          <CardDescription className="text-slate-400">Ikuti langkah berikut untuk mengelola portal informasi desa Anda.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pt-6 grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center font-bold shrink-0">1</div>
              <p className="text-sm text-slate-300">Gunakan <strong>Manajemen Desa</strong> untuk mengisi data statistik dasar (Populasi & Luas).</p>
            </div>
            <div className="flex gap-4">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center font-bold shrink-0">2</div>
              <p className="text-sm text-slate-300">Buka <strong>Statistik & Data</strong> untuk merancang grafik dan menyalin kode sematan.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center font-bold shrink-0">3</div>
              <p className="text-sm text-slate-300">Tempelkan kode sematan di <strong>Manajemen Halaman</strong> untuk membuat laporan interaktif.</p>
            </div>
            <div className="flex gap-4">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center font-bold shrink-0">4</div>
              <p className="text-sm text-slate-300">Atur <strong>Navigasi Publik</strong> untuk menghubungkan halaman ke dock bawah peta.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
