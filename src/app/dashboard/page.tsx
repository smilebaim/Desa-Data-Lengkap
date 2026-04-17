
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
        { name: 'Desa Sukamaju', province: 'Jawa Barat', population: 4500, area: 12.5, location: { lat: -6.9175, lng: 107.6191 }, description: 'Pusat inovasi digital pedesaan dengan fokus pada ekonomi kreatif.', boundary: [ {lat: -6.9, lng: 107.6}, {lat: -6.9, lng: 107.65}, {lat: -6.95, lng: 107.65}, {lat: -6.95, lng: 107.6} ] },
        { name: 'Desa Mekarsari', province: 'Bali', population: 3200, area: 8.2, location: { lat: -8.4095, lng: 115.1889 }, description: 'Sentra kerajinan dan pariwisata budaya berbasis komunitas.' },
        { name: 'Desa Sejahtera', province: 'Sumatera Barat', population: 5800, area: 25.4, location: { lat: -0.9492, lng: 100.3543 }, description: 'Lumbung pangan organik nasional dengan sistem irigasi modern.' },
        { name: 'Desa Bahari', province: 'Sulawesi Utara', population: 2100, area: 5.6, location: { lat: 1.4748, lng: 124.8484 }, description: 'Kawasan konservasi terumbu karang dan wisata bahari.' },
        { name: 'Desa Rindang', province: 'Kalimantan Timur', population: 1500, area: 45.0, location: { lat: 0.5021, lng: 117.1534 }, description: 'Desa percontohan ekonomi hijau dan pelestarian hutan.' }
      ];

      for (const v of villageData) {
        await addDoc(villagesRef, v);
      }

      // 2. Buat Visualizers (Grafik) yang akan disematkan
      const vizRef = collection(db, 'visualizers');
      const vizPop = await addDoc(vizRef, { title: 'Perbandingan Populasi', metric: 'population', chartType: 'bar', createdAt: serverTimestamp() });
      const vizArea = await addDoc(vizRef, { title: 'Distribusi Luas Wilayah', metric: 'area', chartType: 'pie', createdAt: serverTimestamp() });
      const vizDens = await addDoc(vizRef, { title: 'Analisis Kepadatan', metric: 'density', chartType: 'area', createdAt: serverTimestamp() });

      // 3. Buat Halaman Dinamis (Menggunakan ID Grafik di atas)
      const pagesRef = collection(db, 'pages');
      
      const pStat = await addDoc(pagesRef, { 
        title: 'Statistik Nasional Desa', 
        content: `Laporan agregat data desa seluruh Indonesia periode 2024.\n\n### Analisis Populasi Terpadu\nGrafik berikut menunjukkan sebaran penduduk pada desa-desa utama.\n[CHART:${vizPop.id}]\n\nData ini dihimpun melalui sistem sinkronisasi otomatis dari setiap perangkat desa.`, 
        showStats: true, 
        updatedAt: serverTimestamp() 
      });

      const pIdm = await addDoc(pagesRef, { 
        title: 'Indeks Desa Membangun (IDM)', 
        content: `IDM memotret perkembangan kemandirian desa berdasarkan dimensi sosial, ekonomi, dan ekologi.\n\n### Visualisasi Kepadatan Wilayah\nKepadatan penduduk menjadi salah satu indikator utama dalam penentuan klasifikasi desa.\n[CHART:${vizDens.id}]\n\nTarget nasional adalah meningkatkan status 500 desa tertinggal menjadi desa mandiri pada tahun ini.`, 
        showStats: true, 
        updatedAt: serverTimestamp() 
      });

      const pPrice = await addDoc(pagesRef, { 
        title: 'Harga Komoditas Desa', 
        content: `Informasi harga pangan dan komoditas unggulan desa secara real-time.\n\n### Tren Harga Pasar\nFluktuasi harga komoditas utama dalam satu bulan terakhir.\n[CHART:${vizPop.id}]\n\nData ini diperbarui setiap pagi oleh tim ketahanan pangan desa.`, 
        showStats: false, 
        updatedAt: serverTimestamp() 
      });

      const pJoin = await addDoc(pagesRef, { 
        title: 'Bergabung dalam Jaringan', 
        content: `Jadilah bagian dari transformasi digital pedesaan Indonesia. Dapatkan akses ke alat analisis geospasial dan dashboard statistik secara gratis.\n\n### Keuntungan Bergabung:\n1. Integrasi Peta Digital Nasional\n2. Dashboard Statistik Real-time\n3. Laporan Profil Desa Otomatis`, 
        showStats: false, 
        updatedAt: serverTimestamp() 
      });

      const pData = await addDoc(pagesRef, { 
        title: 'Katalog Data Desa', 
        content: `Akses publik terhadap ringkasan profil desa yang telah terverifikasi.\n\n[CHART:${vizArea.id}]\n\nVisualisasi di atas menunjukkan proporsi luas wilayah administratif desa-desa anggota.`, 
        showStats: true, 
        updatedAt: serverTimestamp() 
      });

      // 4. Buat Menu Navigasi yang menautkan ke halaman di atas
      const menusRef = collection(db, 'menus');
      const menuItems = [
        { label: 'Statistik', icon: 'BarChart', href: `/p/${pStat.id}`, order: 1, position: 'bottom' },
        { label: 'IDM', icon: 'TrendingUp', href: `/p/${pIdm.id}`, order: 2, position: 'bottom' },
        { label: 'Data Desa', icon: 'Landmark', href: `/p/${pData.id}`, order: 3, position: 'bottom' },
        { label: 'Harga', icon: 'ShoppingCart', href: `/p/${pPrice.id}`, order: 4, position: 'bottom' },
        { label: 'Bergabung', icon: 'Users', href: `/p/${pJoin.id}`, order: 5, position: 'bottom' },
        { label: 'Informasi', icon: 'Info', href: '#', order: 6, position: 'header' }
      ];

      for (const m of menuItems) {
        await addDoc(menusRef, m);
      }

      toast({ title: "Berhasil!", description: "Ekosistem data dummy strategis telah disinkronkan dengan sempurna.", variant: "default" });
    } catch (error) {
      console.error(error);
      toast({ title: "Gagal!", description: "Terjadi kesalahan saat memproses data demo.", variant: "destructive" });
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
          Buat Data Demo (Dummy)
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
              <p className="text-sm text-slate-300">Buat grafik di <strong>Statistik & Data</strong> untuk mendapatkan kode sematan unik.</p>
            </div>
            <div className="flex gap-4">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center font-bold">2</div>
              <p className="text-sm text-slate-300">Gunakan kode tersebut di <strong>Manajemen Halaman</strong> untuk membuat profil interaktif.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center font-bold">3</div>
              <p className="text-sm text-slate-300">Tautkan halaman baru tersebut ke dock peta melalui <strong>Navigasi Publik</strong>.</p>
            </div>
            <div className="flex gap-4">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center font-bold">4</div>
              <p className="text-sm text-slate-300">Gambar aset atau batas wilayah desa menggunakan <strong>Editor Spasial</strong>.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
