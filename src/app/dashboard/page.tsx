
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
      // 1. Data Desa Dasar untuk statistik
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
          description: 'Pusat inovasi digital pedesaan dengan fokus pada ekonomi kreatif.', 
          boundary: [ {lat: -6.9, lng: 107.6}, {lat: -6.9, lng: 107.65}, {lat: -6.95, lng: 107.65}, {lat: -6.95, lng: 107.6} ], 
          potentials: ['Pertanian Digital', 'Ekonomi Kreatif'],
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
          description: 'Sentra kerajinan dan pariwisata budaya berbasis komunitas.', 
          potentials: ['Pariwisata Budaya', 'Kerajinan Tangan'],
          tagline: 'Harmoni Budaya dan Alam'
        },
        { 
          name: 'Desa Sejahtera', 
          province: 'Sumatera Barat', 
          population: 5800, 
          area: 25.4, 
          idmScore: 0.85, 
          budgetAllocation: 1800000000, 
          location: { lat: -0.9492, lng: 100.3543 }, 
          description: 'Lumbung pangan organik nasional dengan sistem irigasi modern.', 
          potentials: ['Pangan Organik', 'Irigasi Modern'],
          tagline: 'Pangan Melimpah, Rakyat Sejahtera'
        }
      ];

      for (const v of villageData) {
        await addDoc(villagesRef, v);
      }

      // 2. Data Fitur Spasial (Aset Peta) yang sinkron dengan Tool Kiri
      const featuresRef = collection(db, 'features');
      const featureData = [
        // Infrastruktur
        { name: 'Jembatan Ciujung', category: 'infrastructure', type: 'marker', icon: 'Construction', geometry: { lat: -6.918, lng: 107.620 }, description: 'Jembatan penghubung utama antar dusun yang baru direnovasi.', showStats: true },
        { name: 'Jalan Lingkar Desa', category: 'infrastructure', type: 'polyline', icon: 'Navigation', geometry: [{lat: -6.915, lng: 107.610}, {lat: -6.915, lng: 107.630}], description: 'Jalan lingkar untuk akses distribusi hasil tani.', showStats: false },
        
        // Fasilitas Umum
        { name: 'Kantor Desa Sukamaju', category: 'public_facility', type: 'marker', icon: 'Landmark', geometry: { lat: -6.917, lng: 107.619 }, description: 'Pusat administrasi desa dengan pelayanan digital 24 jam.', showStats: false },
        { name: 'Puskesmas Mekarsari', category: 'public_facility', type: 'marker', icon: 'Hospital', geometry: { lat: -8.410, lng: 115.190 }, description: 'Fasilitas kesehatan tingkat pertama desa.', showStats: true },
        { name: 'SD Negeri 01 Sejahtera', category: 'public_facility', type: 'marker', icon: 'School', geometry: { lat: -0.950, lng: 100.355 }, description: 'Sekolah dasar unggulan di wilayah Nagari.', showStats: false },

        // Sumber Daya Alam
        { name: 'Hutan Konservasi Mangrove', category: 'natural_resource', type: 'polygon', icon: 'TreePine', geometry: [ {lat: -6.92, lng: 107.63}, {lat: -6.92, lng: 107.635}, {lat: -6.925, lng: 107.635}, {lat: -6.925, lng: 107.63} ], properties: { area: 2.5 }, description: 'Area lindung ekosistem pesisir dan sumber air.', showStats: true },
        { name: 'Danau Biru Sejahtera', category: 'natural_resource', type: 'circle', icon: 'Droplets', geometry: { lat: -0.955, lng: 100.360 }, properties: { radius: 500 }, description: 'Sumber air irigasi dan potensi wisata air.', showStats: true }
      ];

      for (const f of featureData) {
        await addDoc(featuresRef, f);
      }

      // 3. Buat Visualizers (Grafik)
      const vizRef = collection(db, 'visualizers');
      const vizPop = await addDoc(vizRef, { title: 'Perbandingan Populasi', metric: 'population', chartType: 'bar', createdAt: serverTimestamp() });
      const vizIdm = await addDoc(vizRef, { title: 'Analisis Skor IDM', metric: 'idmScore', chartType: 'radar', createdAt: serverTimestamp() });
      const vizBudget = await addDoc(vizRef, { title: 'Alokasi Anggaran Desa', metric: 'budgetAllocation', chartType: 'pie', createdAt: serverTimestamp() });

      // 4. Buat Halaman Dinamis
      const pagesRef = collection(db, 'pages');
      const pStat = await addDoc(pagesRef, { 
        title: 'Laporan Strategis Desa', 
        content: `Laporan pembangunan desa periode 2024.\n\n### Analisis Populasi & IDM\n[CHART:${vizPop.id}]\n\n[CHART:${vizIdm.id}]\n\n### Efisiensi Anggaran\n[CHART:${vizBudget.id}]`, 
        showStats: true, 
        updatedAt: serverTimestamp() 
      });

      // 5. Buat Menu Navigasi
      const menusRef = collection(db, 'menus');
      await addDoc(menusRef, { label: 'Statistik', icon: 'BarChart', href: `/p/${pStat.id}`, order: 1, position: 'bottom' });
      await addDoc(menusRef, { label: 'Profil Pembangunan', icon: 'TrendingUp', href: `/p/${pStat.id}`, order: 2, position: 'header' });

      toast({ title: "Berhasil!", description: "Seluruh ekosistem data dummy (Infrastruktur, Fasilitas Umum, SDA) telah disinkronkan.", variant: "default" });
    } catch (error) {
      console.error(error);
      toast({ title: "Gagal!", description: "Terjadi kesalahan saat seeding data.", variant: "destructive" });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Selamat Datang, {profile?.name || 'Admin'}</h1>
          <p className="text-muted-foreground">Pusat kendali operasional data dan sistem informasi publik.</p>
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
            <CardTitle className="text-sm font-bold uppercase text-slate-500">Status Sistem</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">Optimal</div>
            <p className="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-1">
              <CheckCircle2 className="h-3 w-3" /> Database Terkoneksi
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-xl rounded-[2rem]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase text-slate-500">Navigasi Aktif</CardTitle>
            <MenuIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">Stabil</div>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Terhubung ke Peta Utama</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-[2rem]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase text-slate-500">Kapasitas Data</CardTitle>
            <MapIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">Nasional</div>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">38 Provinsi Siap Input</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-900 text-white p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <CardHeader className="px-0">
          <CardTitle className="text-2xl font-bold">Panduan Kontrol Efektif</CardTitle>
          <CardDescription className="text-slate-400">Ikuti alur kerja berikut untuk mengelola konten publik Anda dengan rapi.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pt-6 grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center font-bold">1</div>
              <p className="text-sm text-slate-300">Buat grafik di <strong>Statistik & Data</strong> (mendukung IDM & Anggaran).</p>
            </div>
            <div className="flex gap-4">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center font-bold">2</div>
              <p className="text-sm text-slate-300">Gunakan kode tersebut di <strong>Manajemen Halaman</strong> untuk profil interaktif.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center font-bold">3</div>
              <p className="text-sm text-slate-300">Tautkan halaman baru tersebut melalui <strong>Navigasi Publik</strong>.</p>
            </div>
            <div className="flex gap-4">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center font-bold">4</div>
              <p className="text-sm text-slate-300">Gambar aset kategori INFRA, FASUM, atau SDA di <strong>Editor Spasial</strong>.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
