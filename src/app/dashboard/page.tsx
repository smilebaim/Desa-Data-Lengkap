
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, deleteDoc } from 'firebase/firestore';
import { LayoutDashboard, Map as MapIcon, Menu as MenuIcon, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
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

      // 1. Data Desa Nasional (Ekspansi wilayah)
      const villagesRef = collection(db, 'villages');
      
      const v1 = await addDoc(villagesRef, { 
        name: 'Desa Sukamaju', province: 'Jawa Barat', population: 4500, area: 12.5, idmScore: 0.82, budgetAllocation: 1200000000, 
        location: { lat: -6.9175, lng: 107.6191 }, tagline: 'Maju Bersama Teknologi',
        potentials: ['Pertanian Digital', 'Ekonomi Kreatif'], description: 'Pusat inovasi digital pedesaan Jawa Barat.',
        boundary: [ {lat: -6.9, lng: 107.6}, {lat: -6.9, lng: 107.65}, {lat: -6.95, lng: 107.65}, {lat: -6.95, lng: 107.6} ]
      });

      const v2 = await addDoc(villagesRef, { 
        name: 'Gampong Damai', province: 'Aceh', population: 3800, area: 18.2, idmScore: 0.75, budgetAllocation: 1100000000, 
        location: { lat: 5.5483, lng: 95.3238 }, tagline: 'Serambi Inovasi',
        potentials: ['Kopi Gayo', 'Wisata Religi'], description: 'Desa pusat pengembangan komoditas kopi unggulan.'
      });

      const v3 = await addDoc(villagesRef, { 
        name: 'Desa Mekarsari', province: 'Bali', population: 3200, area: 8.2, idmScore: 0.88, budgetAllocation: 950000000, 
        location: { lat: -8.4095, lng: 115.1889 }, tagline: 'Harmoni Budaya',
        potentials: ['Pariwisata Budaya', 'Seni Ukir'], description: 'Sentra kerajinan dan pariwisata budaya berbasis komunitas.'
      });

      const v4 = await addDoc(villagesRef, { 
        name: 'Desa Sentani', province: 'Papua', population: 2500, area: 45.0, idmScore: 0.65, budgetAllocation: 1500000000, 
        location: { lat: -2.5786, lng: 140.4854 }, tagline: 'Mutiara Hitam Timur',
        potentials: ['Perikanan Danau', 'Wisata Alam'], description: 'Gerbang utama pengembangan ekonomi kreatif di wilayah timur.'
      });

      // 2. Data Fitur Spasial Terpadu
      const featuresRef = collection(db, 'features');
      const featureData = [
        { name: 'Jembatan Ciujung', category: 'infrastructure', type: 'marker', icon: 'Construction', geometry: { lat: -6.918, lng: 107.620 }, description: 'Infrastruktur konektivitas utama.', showStats: true },
        { name: 'Puskesmas Mekarsari', category: 'public_facility', type: 'marker', icon: 'Hospital', geometry: { lat: -8.410, lng: 115.190 }, description: 'Layanan kesehatan desa 24 jam.', showStats: true },
        { name: 'Hutan Konservasi Mangrove', category: 'natural_resource', type: 'polygon', icon: 'TreePine', geometry: [ {lat: -6.92, lng: 107.63}, {lat: -6.92, lng: 107.635}, {lat: -6.925, lng: 107.635}, {lat: -6.925, lng: 107.63} ], properties: { area: 2.5 }, description: 'Area lindung pesisir.', showStats: true },
        { name: 'Jalan Lingkar Desa', category: 'infrastructure', type: 'polyline', icon: 'Navigation', geometry: [{lat: -6.91, lng: 107.61}, {lat: -6.915, lng: 107.62}, {lat: -6.92, lng: 107.625}], description: 'Akses logistik ekonomi desa.', showStats: false }
      ];

      for (const f of featureData) { await addDoc(featuresRef, f); }

      // 3. Visualizers & Pages
      const vizRef = collection(db, 'visualizers');
      const vPop = await addDoc(vizRef, { title: 'Populasi Wilayah', metric: 'population', chartType: 'bar', createdAt: serverTimestamp() });
      const vBudget = await addDoc(vizRef, { title: 'Alokasi Dana Desa', metric: 'budgetAllocation', chartType: 'pie', createdAt: serverTimestamp() });

      const pagesRef = collection(db, 'pages');
      const pId = await addDoc(pagesRef, { 
        title: 'Laporan Nasional Pembangunan Desa 2024', 
        content: `Berikut adalah ringkasan kemajuan pembangunan desa di seluruh Indonesia.\n\n### Sebaran Populasi\n[CHART:${vPop.id}]\n\n### Transparansi Anggaran\n[CHART:${vBudget.id}]\n\nData ini dihimpun melalui sistem monitoring geospasial real-time.`, 
        showStats: true, updatedAt: serverTimestamp() 
      });

      // 4. Menus
      const menusRef = collection(db, 'menus');
      await addDoc(menusRef, { label: 'Statistik Nasional', icon: 'BarChart', href: `/p/${pId.id}`, order: 1, position: 'bottom' });
      await addDoc(menusRef, { label: 'Bantuan & FAQ', icon: 'Info', href: `/p/${pId.id}`, order: 2, position: 'header' });

      toast({ title: "Data Demo Berhasil", description: "Ekosistem nasional (5 Desa, Aset, & Laporan) telah disinkronkan." });
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

      <div className="grid gap-6 md:grid-cols-3">
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
      </div>
    </div>
  );
}
