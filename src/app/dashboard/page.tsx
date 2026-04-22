'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, deleteDoc, setDoc, doc } from 'firebase/firestore';
import { LayoutDashboard, Map as MapIcon, Menu as MenuIcon, Sparkles, Loader2, CheckCircle2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function DashboardPage() {
  const { profile } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const clearExistingData = async () => {
    const collections = ['villages', 'features', 'visualizers', 'pages', 'menus', 'settings'];
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

      // 0. App Settings
      await setDoc(doc(db, 'settings', 'global'), {
        appName: 'Desa Lengkap',
        appSlogan: 'Informasi Spasial Nasional Indonesia',
        logoType: 'icon',
        logoIcon: 'Shield',
        logoUrl: ''
      });

      // 1. Data Desa (38 Provinsi)
      const villagesRef = collection(db, 'villages');
      const provinces = [
        { name: 'Gampong Lampuuk', prov: 'Aceh', lat: 5.4842, lng: 95.2345 },
        { name: 'Desa Tomok', prov: 'Sumatera Utara', lat: 2.6631, lng: 98.8524 },
        { name: 'Nagari Pariangan', prov: 'Sumatera Barat', lat: -0.4432, lng: 100.4851 },
        { name: 'Desa Muara Takus', prov: 'Riau', lat: 0.3341, lng: 100.6432 },
        { name: 'Desa Muara Jambi', prov: 'Jambi', lat: -1.4789, lng: 103.6543 },
        { name: 'Desa Pulau Kemaro', prov: 'Sumatera Selatan', lat: -2.9781, lng: 104.8123 },
        { name: 'Desa Belitar Seberang', prov: 'Bengkulu', lat: -3.4211, lng: 102.5432 },
        { name: 'Desa Kelawi', prov: 'Lampung', lat: -5.8654, lng: 105.7432 },
        { name: 'Desa Terong', prov: 'Bangka Belitung', lat: -2.7123, lng: 107.8234 },
        { name: 'Desa Pengudang', prov: 'Kepulauan Riau', lat: 1.1543, lng: 104.5432 },
        { name: 'Kel. Setu Babakan', prov: 'DKI Jakarta', lat: -6.3421, lng: 106.8234 },
        { name: 'Desa Sukamaju', prov: 'Jawa Barat', lat: -6.9175, lng: 107.6191 },
        { name: 'Desa Borobudur', prov: 'Jawa Tengah', lat: -7.6078, lng: 110.2037 },
        { name: 'Desa Panggungharjo', prov: 'DI Yogyakarta', lat: -7.8432, lng: 110.3654 },
        { name: 'Desa Tamansari', prov: 'Jawa Timur', lat: -8.1234, lng: 114.2345 },
        { name: 'Desa Sawarna', prov: 'Banten', lat: -6.9876, lng: 106.3210 },
        { name: 'Desa Penglipuran', prov: 'Bali', lat: -8.4234, lng: 115.3456 },
        { name: 'Desa Sade', prov: 'Nusa Tenggara Barat', lat: -8.8432, lng: 116.2876 },
        { name: 'Desa Wae Rebo', prov: 'Nusa Tenggara Timur', lat: -8.7654, lng: 120.4321 },
        { name: 'Desa Saham', prov: 'Kalimantan Barat', lat: 0.1234, lng: 109.5432 },
        { name: 'Desa Sei Sekonyer', prov: 'Kalimantan Tengah', lat: -2.7432, lng: 111.8765 },
        { name: 'Desa Loksado', prov: 'Kalimantan Selatan', lat: -2.7876, lng: 115.5432 },
        { name: 'Desa Pampang', prov: 'Kalimantan Timur', lat: -0.4321, lng: 117.2345 },
        { name: 'Desa Setulang', prov: 'Kalimantan Utara', lat: 3.4321, lng: 116.5432 },
        { name: 'Desa Budo', prov: 'Sulawesi Utara', lat: 1.5432, lng: 124.8765 },
        { name: 'Desa Kolonodale', prov: 'Sulawesi Tengah', lat: -1.9876, lng: 121.3210 },
        { name: 'Desa Ke\'te Kesu', prov: 'Sulawesi Selatan', lat: -2.9876, lng: 119.8765 },
        { name: 'Desa Liya Togo', prov: 'Sulawesi Tenggara', lat: -5.3421, lng: 123.5432 },
        { name: 'Desa Bubohu', prov: 'Gorontalo', lat: 0.5432, lng: 123.0987 },
        { name: 'Desa Karampuang', prov: 'Sulawesi Barat', lat: -2.6543, lng: 118.8765 },
        { name: 'Desa Sawai', prov: 'Maluku', lat: -3.0123, lng: 129.2345 },
        { name: 'Desa Aketajawe', prov: 'Maluku Utara', lat: 0.6543, lng: 127.5432 },
        { name: 'Desa Skouw', prov: 'Papua', lat: -2.6543, lng: 140.7654 },
        { name: 'Desa Arborek', prov: 'Papua Barat', lat: -0.5432, lng: 130.6543 },
        { name: 'Desa Ugimba', prov: 'Papua Tengah', lat: -4.0123, lng: 137.2345 },
        { name: 'Desa Kurulu', prov: 'Papua Pegunungan', lat: -4.0543, lng: 138.9876 },
        { name: 'Desa Yanggandur', prov: 'Papua Selatan', lat: -8.4321, lng: 140.6543 },
        { name: 'Desa Sauwandarek', prov: 'Papua Barat Daya', lat: -0.4321, lng: 130.5432 }
      ];

      for (const p of provinces) {
        await addDoc(villagesRef, { 
          name: p.name, province: p.prov, population: Math.floor(Math.random() * 5000) + 1000, 
          area: parseFloat((Math.random() * 20 + 5).toFixed(2)), 
          idmScore: parseFloat((Math.random() * 0.4 + 0.5).toFixed(2)), 
          budgetAllocation: Math.floor(Math.random() * 1000000000) + 800000000, 
          location: { lat: p.lat, lng: p.lng }, 
          tagline: `Membangun ${p.prov} dari Desa`,
          potentials: ['Pertanian', 'Wisata Alam'], 
          description: `Desa percontohan pembangunan berkelanjutan di wilayah ${p.prov}.`,
          boundary: [ 
            {lat: p.lat + 0.02, lng: p.lng + 0.02}, 
            {lat: p.lat + 0.02, lng: p.lng - 0.02}, 
            {lat: p.lat - 0.02, lng: p.lng - 0.02}, 
            {lat: p.lat - 0.02, lng: p.lng + 0.02} 
          ]
        });
      }

      // 2. Data Fitur Spasial
      const featuresRef = collection(db, 'features');
      await addDoc(featuresRef, { name: 'Kantor Pusat GIS', category: 'infrastructure', type: 'marker', icon: 'Shield', geometry: { lat: -2.5489, lng: 118.0149 }, description: 'Pusat kendali data geospasial nasional.', showStats: true });

      // 3. Visualizers
      const vizRef = collection(db, 'visualizers');
      const vPop = await addDoc(vizRef, { title: 'Distribusi Populasi Nasional', metric: 'population', chartType: 'bar', createdAt: serverTimestamp() });

      // 4. Pages
      const pagesRef = collection(db, 'pages');
      const pId = await addDoc(pagesRef, { 
        title: 'Laporan Strategis Desa Indonesia 2024', 
        content: `Indonesia terdiri dari beragam desa dengan potensi luar biasa.\n\n### Statistik Populasi Terkini\n[CHART:${vPop.id}]\n\nVisualisasi ini mencakup seluruh provinsi di tanah air.`, 
        showStats: true, updatedAt: serverTimestamp() 
      });

      // 5. Menus
      const menusRef = collection(db, 'menus');
      await addDoc(menusRef, { label: 'Analisis Nasional', icon: 'BarChart', href: `/p/${pId.id}`, order: 1, position: 'bottom' });

      toast({ title: "Sinkronisasi Berhasil", description: "38 Desa dari seluruh Provinsi telah ditambahkan." });
    } catch (error) {
      toast({ title: "Gagal Seeding", description: "Terjadi kesalahan koneksi database.", variant: "destructive" });
    } finally { setIsSeeding(false); }
  };

  return (
    <div className="space-y-8 text-left">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dasbor Operasional Nasional</h1>
          <p className="text-muted-foreground">Kelola data 38 provinsi dan profil publikasi strategis desa.</p>
        </div>
        <Button onClick={seedDemoData} disabled={isSeeding} className="bg-primary hover:bg-primary/90 rounded-2xl shadow-xl h-12 px-6 font-bold">
          {isSeeding ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
          Buat Data 38 Provinsi
        </Button>
      </header>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none shadow-xl rounded-[2rem]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase text-slate-500 tracking-wider">Status Sistem</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">Online</div>
            <p className="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-1 uppercase">
              <CheckCircle2 className="h-3 w-3" /> Real-time Sync
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-xl rounded-[2rem]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase text-slate-500 tracking-wider">Geospasial</CardTitle>
            <MapIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">38 Prov</div>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Cakupan Nasional</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-[2rem]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase text-slate-500 tracking-wider">Analisis AI</CardTitle>
            <Sparkles className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">Siap</div>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Rekomendasi IDM Otomatis</p>
          </CardContent>
        </Card>

        <Link href="/dashboard/settings">
          <Card className="border-none shadow-xl rounded-[2rem] hover:bg-slate-50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold uppercase text-slate-500 tracking-wider">Pengaturan App</CardTitle>
              <Settings className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900">Aktif</div>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Branding & Logo Global</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
