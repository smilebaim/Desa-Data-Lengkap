
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, deleteDoc, getDocs, query } from 'firebase/firestore';
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
      // 1. Bersihkan data lama jika diperlukan (Opsional, untuk demo kita tambah saja)
      
      // 2. Buat Koleksi Desa (Data Dasar)
      const villagesRef = collection(db, 'villages');
      const villageData = [
        { name: 'Desa Sukamaju', province: 'Jawa Barat', population: 4500, area: 12.5, location: { lat: -6.9175, lng: 107.6191 }, description: 'Pusat inovasi digital pedesaan.' },
        { name: 'Desa Mekarsari', province: 'Bali', population: 3200, area: 8.2, location: { lat: -8.4095, lng: 115.1889 }, description: 'Sentra kerajinan dan pariwisata budaya.' },
        { name: 'Desa Sejahtera', province: 'Sumatera Barat', population: 5800, area: 25.4, location: { lat: -0.9492, lng: 100.3543 }, description: 'Lumbung pangan organik nasional.' },
        { name: 'Desa Bahari', province: 'Sulawesi Utara', population: 2100, area: 5.6, location: { lat: 1.4748, lng: 124.8484 }, description: 'Kawasan konservasi terumbu karang.' },
        { name: 'Desa Rindang', province: 'Kalimantan Timur', population: 1500, area: 45.0, location: { lat: 0.5021, lng: 117.1534 }, description: 'Desa percontohan ekonomi hijau.' }
      ];

      const villageIds = [];
      for (const v of villageData) {
        const docRef = await addDoc(villagesRef, v);
        villageIds.push(docRef.id);
      }

      // 3. Buat Koleksi Visualizers (Grafik)
      const vizRef = collection(db, 'visualizers');
      const vizPop = await addDoc(vizRef, { title: 'Populasi Jaringan Desa', metric: 'population', chartType: 'bar', createdAt: serverTimestamp() });
      const vizArea = await addDoc(vizRef, { title: 'Distribusi Luas Wilayah', metric: 'area', chartType: 'pie', createdAt: serverTimestamp() });
      const vizDensity = await addDoc(vizRef, { title: 'Tren Kepadatan Penduduk', metric: 'density', chartType: 'area', createdAt: serverTimestamp() });
      const vizPopLine = await addDoc(vizRef, { title: 'Analisis Demografi', metric: 'population', chartType: 'line', createdAt: serverTimestamp() });

      // 4. Buat Koleksi Halaman Dinamis (Konten Utama)
      const pagesRef = collection(db, 'pages');
      
      // Halaman Statistik
      const pStat = await addDoc(pagesRef, { 
        title: 'Dashboard Statistik Nasional', 
        content: `Selamat datang di portal data agregat desa Indonesia.\n\n### Analisis Populasi\nGrafik di bawah menunjukkan perbandingan jumlah penduduk antar desa anggota jaringan.\n[CHART:${vizPop.id}]\n\n### Distribusi Wilayah\nVisualisasi luas area administratif desa dalam kilometer persegi.\n[CHART:${vizArea.id}]`, 
        showStats: true, 
        updatedAt: serverTimestamp() 
      });

      // Halaman IDM
      const pIdm = await addDoc(pagesRef, { 
        title: 'Indeks Desa Membangun (IDM)', 
        content: `Analisis kemandirian desa berdasarkan indikator sosial, ekonomi, dan lingkungan.\n\n### Kepadatan Wilayah\nIndikator kepadatan penduduk sangat mempengaruhi alokasi dana pembangunan.\n[CHART:${vizDensity.id}]\n\nData ini diperbarui setiap bulan sesuai dengan laporan dari perangkat desa.`, 
        showStats: true, 
        updatedAt: serverTimestamp() 
      });

      // Halaman Harga
      const pHarga = await addDoc(pagesRef, { 
        title: 'Informasi Harga Komoditas', 
        content: `Pantau harga bahan pokok di tingkat produsen desa untuk menjaga stabilitas ekonomi.\n\n- Beras: Rp 12.500/kg\n- Jagung: Rp 6.000/kg\n- Cabai Merah: Rp 35.000/kg\n\n### Perbandingan Volume Produksi\n[CHART:${vizPopLine.id}]`, 
        showStats: false, 
        updatedAt: serverTimestamp() 
      });

      // Halaman Bergabung
      const pJoin = await addDoc(pagesRef, { 
        title: 'Bergabung dalam Jaringan', 
        content: `Jadilah bagian dari transformasi digital pedesaan Indonesia. Dapatkan akses ke alat analisis geospasial dan dashboard statistik secara gratis.\n\n### Persyaratan:\n1. SK Pengangkatan Kepala Desa\n2. Data Profil Desa Terbaru\n3. Peta Batas Desa (Format Shapefile/Digital)`, 
        showStats: false, 
        updatedAt: serverTimestamp() 
      });

      // Halaman Data Desa
      const pData = await addDoc(pagesRef, { 
        title: 'Katalog Data Desa Lengkap', 
        content: `Akses publik terhadap data mentah dan ringkasan eksekutif profil desa.\n\n[CHART:${vizPop.id}]\n\nData di atas merupakan hasil sinkronisasi dari 38 provinsi di Indonesia.`, 
        showStats: true, 
        updatedAt: serverTimestamp() 
      });

      // 5. Buat Koleksi Menu (Navigasi)
      const menusRef = collection(db, 'menus');
      const menuItems = [
        { label: 'Statistik', icon: 'BarChart', href: `/p/${pStat.id}`, order: 1, position: 'bottom' },
        { label: 'IDM', icon: 'TrendingUp', href: `/p/${pIdm.id}`, order: 2, position: 'bottom' },
        { label: 'Data Desa', icon: 'Landmark', href: `/p/${pData.id}`, order: 3, position: 'bottom' },
        { label: 'Harga', icon: 'ShoppingCart', href: `/p/${pHarga.id}`, order: 4, position: 'bottom' },
        { label: 'Bergabung', icon: 'Users', href: `/p/${pJoin.id}`, order: 5, position: 'bottom' }
      ];

      for (const m of menuItems) {
        await addDoc(menusRef, m);
      }

      toast({ title: "Sukses!", description: "Seluruh ekosistem data dummy (Desa, Grafik, Halaman, & Menu) telah dibuat dan disinkronkan.", variant: "default" });
    } catch (error) {
      console.error(error);
      toast({ title: "Gagal!", description: "Terjadi kesalahan saat membuat data demo.", variant: "destructive" });
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
          className="bg-primary hover:bg-primary/90 rounded-2xl shadow-lg shadow-primary/20 h-12 px-6 font-bold"
        >
          {isSeeding ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
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
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Daftar Desa Terverifikasi</p>
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
