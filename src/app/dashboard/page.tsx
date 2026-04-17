
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, deleteDoc } from 'firebase/firestore';
import { LayoutDashboard, Map as MapIcon, Menu as MenuIcon, Sparkles, Loader2, CheckCircle2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { profile } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const clearExistingData = async () => {
    const collections = ['villages', 'features', 'visualizers', 'pages', 'menus'];
    for (const coll of collections) {
      const q = query(collection(db, coll));
      const snap = await getDocs(q);
      snap.forEach((doc) => deleteDoc(doc.ref));
    }
  };

  const seedDemoData = async () => {
    setIsSeeding(true);
    try {
      await clearExistingData();

      // 1. Data Desa Dasar
      const villagesRef = collection(db, 'villages');
      const villageData = [
        { 
          name: 'Desa Sukamaju', 
          province: 'Jawa Barat', 
          population: 4500, 
          area: 12.5, 
          idmScore: 0.82, 
          budgetAllocation: 1200000000, 
          location: { lat: -6.9175, lng: 107.6191 }, 
          description: 'Pusat inovasi digital pedesaan dengan fokus pada ekonomi kreatif dan pertanian cerdas.', 
          boundary: [ {lat: -6.9, lng: 107.6}, {lat: -6.9, lng: 107.65}, {lat: -6.95, lng: 107.65}, {lat: -6.95, lng: 107.6} ], 
          potentials: ['Pertanian Digital', 'Ekonomi Kreatif', 'Wisata Sawah'],
          tagline: 'Maju Bersama Teknologi'
        },
        { 
          name: 'Desa Mekarsari', 
          province: 'Bali', 
          population: 3200, 
          area: 8.2, 
          idmScore: 0.78, 
          budgetAllocation: 950000000, 
          location: { lat: -8.4095, lng: 115.1889 }, 
          description: 'Sentra kerajinan dan pariwisata budaya berbasis komunitas yang menjaga kelestarian adat.', 
          potentials: ['Pariwisata Budaya', 'Kerajinan Tangan', 'Seni Ukir'],
          tagline: 'Harmoni Budaya dan Alam'
        }
      ];

      for (const v of villageData) {
        await addDoc(villagesRef, v);
      }

      // 2. Data Fitur Spasial (Aset Peta)
      const featuresRef = collection(db, 'features');
      const featureData = [
        { name: 'Jembatan Ciujung', category: 'infrastructure', type: 'marker', icon: 'Construction', geometry: { lat: -6.918, lng: 107.620 }, description: 'Jembatan penghubung utama yang baru direnovasi.', showStats: true },
        { name: 'Puskesmas Mekarsari', category: 'public_facility', type: 'marker', icon: 'Hospital', geometry: { lat: -8.410, lng: 115.190 }, description: 'Fasilitas kesehatan desa 24 jam.', showStats: true },
        { name: 'Hutan Konservasi Mangrove', category: 'natural_resource', type: 'polygon', icon: 'TreePine', geometry: [ {lat: -6.92, lng: 107.63}, {lat: -6.92, lng: 107.635}, {lat: -6.925, lng: 107.635}, {lat: -6.925, lng: 107.63} ], properties: { area: 2.5 }, description: 'Area lindung ekosistem pesisir.', showStats: true }
      ];

      for (const f of featureData) {
        await addDoc(featuresRef, f);
      }

      // 3. Visualizers (Grafik)
      const vizRef = collection(db, 'visualizers');
      const vizPop = await addDoc(vizRef, { title: 'Populasi Desa', metric: 'population', chartType: 'bar', createdAt: serverTimestamp() });
      const vizBudget = await addDoc(vizRef, { title: 'Alokasi Anggaran', metric: 'budgetAllocation', chartType: 'pie', createdAt: serverTimestamp() });

      // 4. Halaman Dinamis & Menu
      const pagesRef = collection(db, 'pages');
      const pProfile = await addDoc(pagesRef, { 
        title: 'Profil Pembangunan Nasional', 
        content: `Selamat datang di Dashboard Informasi Desa Lengkap.\n\n### Analisis Demografi\nVisualisasi berikut menunjukkan sebaran populasi di desa-desa binaan kami:\n[CHART:${vizPop.id}]\n\n### Efisiensi Anggaran\nPenggunaan anggaran desa dialokasikan secara transparan untuk infrastruktur dan kesejahteraan:\n[CHART:${vizBudget.id}]`, 
        showStats: true, 
        updatedAt: serverTimestamp() 
      });

      const menusRef = collection(db, 'menus');
      await addDoc(menusRef, { label: 'Profil Pembangunan', icon: 'BarChart', href: `/p/${pProfile.id}`, order: 1, position: 'bottom' });
      await addDoc(menusRef, { label: 'Laporan Publik', icon: 'FileText', href: `/p/${pProfile.id}`, order: 2, position: 'bottom' });
      await addDoc(menusRef, { label: 'Statistik', icon: 'TrendingUp', href: `/visualizations`, order: 3, position: 'header' });

      toast({ title: "Data Demo Berhasil", description: "Seluruh ekosistem (Navigasi, Halaman, Aset, & Grafik) telah disinkronkan." });
    } catch (error) {
      console.error(error);
      toast({ title: "Gagal Seeding", description: "Terjadi kesalahan koneksi database.", variant: "destructive" });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dasbor Operasional</h1>
          <p className="text-muted-foreground">Kelola data wilayah dan profil publikasi desa Anda.</p>
        </div>
        <Button 
          onClick={seedDemoData} 
          disabled={isSeeding}
          className="bg-primary hover:bg-primary/90 rounded-2xl shadow-xl h-12 px-6 font-bold"
        >
          {isSeeding ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
          Buat Data Demo Lengkap
        </Button>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-xl rounded-[2rem]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase text-slate-500 tracking-wider">Status Sistem</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">Online</div>
            <p className="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-1">
              <CheckCircle2 className="h-3 w-3" /> Sinkronisasi Aktif
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-xl rounded-[2rem]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase text-slate-500 tracking-wider">Menu Aktif</CardTitle>
            <MenuIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">Geospasial</div>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Terhubung ke Peta Utama</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-[2rem]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase text-slate-500 tracking-wider">Metrik Desa</CardTitle>
            <MapIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">IDM & APBDes</div>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Mendukung Analisis AI</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-900 text-white p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <CardHeader className="px-0">
          <CardTitle className="text-2xl font-bold">Panduan Kontrol Publik</CardTitle>
          <CardDescription className="text-slate-400 italic">Ikuti langkah ini untuk hasil visualisasi terbaik di halaman utama.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pt-6 grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">1</div>
              <p className="text-sm text-slate-300">Buat grafik di <strong>Statistik & Data</strong> menggunakan metrik IDM atau Anggaran.</p>
            </div>
            <div className="flex gap-4">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">2</div>
              <p className="text-sm text-slate-300">Sematkan kode diagram di <strong>Manajemen Halaman</strong> untuk laporan otomatis.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">3</div>
              <p className="text-sm text-slate-300">Gambar aset kategori INFRA, FASUM, atau SDA di <strong>Editor Spasial</strong>.</p>
            </div>
            <div className="flex gap-4">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">4</div>
              <p className="text-sm text-slate-300">Aktifkan menu di <strong>Navigasi Publik</strong> agar muncul di dock bawah peta.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
