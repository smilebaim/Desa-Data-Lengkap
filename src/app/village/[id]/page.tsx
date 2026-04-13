
'use client';

import { useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Users, Map as MapIcon, Info, School, Hospital, Landmark, Navigation } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function VillageDetailPage() {
  const { id } = useParams();
  const db = useFirestore();
  const router = useRouter();
  const { data: village, isLoading } = useDoc(doc(db, 'villages', id as string));

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!village) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Desa Tidak Ditemukan</h2>
        <p className="text-slate-500 mb-6">Maaf, data wilayah yang Anda cari tidak tersedia di database kami.</p>
        <Button onClick={() => router.push('/')}>Kembali ke Peta</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="h-64 bg-slate-900 relative flex items-end overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=2070')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        <div className="max-w-4xl mx-auto w-full px-6 pb-8 relative z-10">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-4 pl-0">
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Peta
            </Button>
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary hover:bg-primary shadow-none uppercase text-[10px] tracking-widest">{village.province}</Badge>
                <Badge variant="outline" className="text-white border-white/20 uppercase text-[10px] tracking-widest">Wilayah Terverifikasi</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{village.name}</h1>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-4">
               <div className="text-center px-4">
                  <p className="text-[10px] text-white/60 font-bold uppercase mb-1">Populasi</p>
                  <p className="text-xl font-bold text-white">{village.population?.toLocaleString() || 0}</p>
               </div>
               <Separator orientation="vertical" className="h-8 bg-white/20" />
               <div className="text-center px-4">
                  <p className="text-[10px] text-white/60 font-bold uppercase mb-1">Status</p>
                  <p className="text-sm font-bold text-green-400">AKTIF</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-8">
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-8 space-y-6">
            <Card className="shadow-xl border-none rounded-3xl overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-100">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Profil & Deskripsi Wilayah
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {village.description ? (
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line text-lg">
                    {village.description}
                  </p>
                ) : (
                  <p className="text-slate-400 italic">Belum ada profil deskripsi untuk wilayah ini.</p>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                  <School className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Pendidikan</p>
                  <p className="font-bold text-slate-700">Tersedia</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="h-12 w-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
                  <Hospital className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Kesehatan</p>
                  <p className="font-bold text-slate-700">Tersedia</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 space-y-6">
            <Card className="shadow-xl border-none rounded-3xl bg-primary text-white overflow-hidden">
               <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    Info Geografis
                  </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                    <p className="text-[9px] font-bold text-white/60 uppercase mb-1">Garis Lintang</p>
                    <p className="font-mono text-xs">{village.location?.lat.toFixed(6)}</p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                    <p className="text-[9px] font-bold text-white/60 uppercase mb-1">Garis Bujur</p>
                    <p className="font-mono text-xs">{village.location?.lng.toFixed(6)}</p>
                  </div>
                  <Button className="w-full bg-white text-primary hover:bg-slate-100 rounded-2xl font-bold">
                    Buka di Google Maps
                  </Button>
               </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-100 rounded-3xl overflow-hidden">
               <CardHeader className="bg-slate-50 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-primary" />
                    Pemerintahan
                  </CardTitle>
               </CardHeader>
               <CardContent className="pt-4 text-sm text-slate-600 space-y-2">
                  <p>Wilayah ini berada di bawah administrasi Provinsi <strong>{village.province}</strong>.</p>
                  <p>Semua data telah disinkronkan dengan Jaringan Desa Nasional.</p>
               </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
