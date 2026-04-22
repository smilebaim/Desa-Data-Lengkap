
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
        appSlogan: 'Informasi Spasial Nasional',
        logoType: 'icon',
        logoIcon: 'Shield',
        logoUrl: ''
      });

      // 1. Data Desa
      const villagesRef = collection(db, 'villages');
      const v1 = await addDoc(villagesRef, { 
        name: 'Desa Sukamaju', province: 'Jawa Barat', population: 4500, area: 12.5, idmScore: 0.82, budgetAllocation: 1200000000, 
        location: { lat: -6.9175, lng: 107.6191 }, tagline: 'Maju Bersama Teknologi',
        potentials: ['Pertanian Digital', 'Ekonomi Kreatif'], description: 'Pusat inovasi digital pedesaan Jawa Barat.',
        boundary: [ {lat: -6.9, lng: 107.6}, {lat: -6.9, lng: 107.65}, {lat: -6.95, lng: 107.65}, {lat: -6.95, lng: 107.6} ]
      });

      // 2. Data Fitur Spasial
      const featuresRef = collection(db, 'features');
      await addDoc(featuresRef, { name: 'Jembatan Ciujung', category: 'infrastructure', type: 'marker', icon: 'Construction', geometry: { lat: -6.918, lng: 107.620 }, description: 'Infrastruktur konektivitas utama.', showStats: true });

      // 3. Visualizers
      const vizRef = collection(db, 'visualizers');
      const vPop = await addDoc(vizRef, { title: 'Populasi Wilayah', metric: 'population', chartType: 'bar', createdAt: serverTimestamp() });

      // 4. Pages
      const pagesRef = collection(db, 'pages');
      const pId = await addDoc(pagesRef, { 
        title: 'Laporan Nasional Pembangunan Desa 2024', 
        content: `Berikut adalah ringkasan kemajuan pembangunan desa di seluruh Indonesia.\n\n### Sebaran Populasi\n[CHART:${vPop.id}]\n\nData ini dihimpun melalui sistem monitoring geospasial real-time.`, 
        showStats: true, updatedAt: serverTimestamp() 
      });

      // 5. Menus
      const menusRef = collection(db, 'menus');
      await addDoc(menusRef, { label: 'Statistik Nasional', icon: 'BarChart', href: `/p/${pId.id}`, order: 1, position: 'bottom' });

      toast({ title: "Data Demo Berhasil", description: "Ekosistem nasional telah disinkronkan." });
    } catch (error) {
      toast({ title: "Gagal Seeding", description: "Terjadi kesalahan koneksi database.", variant: "destructive" });
    } finally { setIsSeeding(false); }
  };

  return (
    <div className="space-y-8 text-left">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dasbor Operasional</h1>
          <p className="text-muted-foreground">Kelola data wilayah dan profil publikasi desa Anda.</p>
        </div>
        <Button onClick={seedDemoData} disabled={isSeeding} className="bg-primary hover:bg-primary/90 rounded-2xl shadow-xl h-12 px-6 font-bold">
          {isSeeding ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
          Buat Data Demo Lengkap
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
              <CheckCircle2 className="h-3 w-3" /> Sinkronisasi Aktif
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-xl rounded-[2rem]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase text-slate-500 tracking-wider">Geospasial</CardTitle>
            <MapIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">Aktif</div>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Visualisasi GIS Nasional</p>
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
              <div className="text-3xl font-black text-slate-900">Tersedia</div>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Identitas & Logo Global</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
