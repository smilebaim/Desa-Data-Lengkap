
'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc, addDoc, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, Trash2, Edit2, Save, Sparkles, Landmark, 
  Loader2, Users, MapPin, Search, Info, Globe, Tag,
  BarChart3, Ruler
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { suggestVillageContent } from '@/ai';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function VillageManagementPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const villageQuery = useMemo(() => query(collection(db, 'villages'), orderBy('name', 'asc')), [db]);
  const { data: villages, isLoading } = useCollection(villageQuery);

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedVillage, setSelectedVillage] = useState<any>(null);
  const [newVillage, setNewVillage] = useState({
    name: '',
    province: 'Jawa Barat',
    population: 0,
    area: 0,
    description: '',
    tagline: '',
    location: { lat: -6.9175, lng: 107.6191 }
  });

  const handleEdit = (village: any) => {
    setSelectedVillage(village);
    setIsEditing(village.id);
  };

  const handleAdd = async () => {
    if (!newVillage.name) return toast({ title: "Galat", description: "Nama desa harus diisi.", variant: "destructive" });
    setIsSubmitting(true);
    const collRef = collection(db, 'villages');
    addDoc(collRef, newVillage)
      .then(() => {
        toast({ title: "Berhasil", description: "Desa baru telah ditambahkan ke basis data." });
        setIsAdding(false);
        setNewVillage({ name: '', province: 'Jawa Barat', population: 0, area: 0, description: '', tagline: '', location: { lat: -6.9175, lng: 107.6191 } });
      })
      .catch(async () => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: collRef.path, operation: 'create', requestResourceData: newVillage })))
      .finally(() => setIsSubmitting(false));
  };

  const handleSave = async () => {
    if (!selectedVillage) return;
    setIsSubmitting(true);

    const docRef = doc(db, 'villages', selectedVillage.id);
    const { id, ...dataToSave } = selectedVillage;

    updateDoc(docRef, dataToSave)
      .then(() => {
        toast({ title: "Berhasil", description: "Data statistik desa telah diperbarui." });
        setIsEditing(null);
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ 
          path: docRef.path, 
          operation: 'update', 
          requestResourceData: dataToSave 
        }));
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleAiSuggest = async (type: 'edit' | 'add') => {
    const target = type === 'edit' ? selectedVillage : newVillage;
    if (!target.name || !target.province) return toast({ title: "Info", description: "Lengkapi Nama dan Provinsi terlebih dahulu." });
    
    setIsAiLoading(true);
    try {
      const result = await suggestVillageContent({ name: target.name, province: target.province });
      if (type === 'edit') {
        setSelectedVillage({ ...selectedVillage, description: result.description, tagline: result.tagline });
      } else {
        setNewVillage({ ...newVillage, description: result.description, tagline: result.tagline });
      }
      toast({ title: "AI Berhasil", description: "Saran konten telah dihasilkan." });
    } catch (error) {
      toast({ title: "AI Gagal", description: "Gagal menghubungkan ke layanan AI.", variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus data desa ini?')) return;
    const docRef = doc(db, 'villages', id);
    deleteDoc(docRef)
      .catch(async () => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'delete' })));
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sumber Data Statistik</h1>
          <p className="text-muted-foreground">Isi data populasi dan wilayah di sini untuk memberi makan grafik di dashboard statistik.</p>
        </div>
        
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Tambah Data Desa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Input Data Desa Baru</DialogTitle>
              <DialogDescription>Data yang Anda masukkan akan langsung mempengaruhi grafik statistik nasional.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nama Desa</Label><Input value={newVillage.name} onChange={e => setNewVillage({...newVillage, name: e.target.value})} placeholder="Nama resmi desa..." /></div>
                <div className="space-y-2"><Label>Provinsi</Label><Input value={newVillage.province} onChange={e => setNewVillage({...newVillage, province: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Populasi (Jiwa)</Label><Input type="number" value={newVillage.population} onChange={e => setNewVillage({...newVillage, population: parseInt(e.target.value)})} /></div>
                <div className="space-y-2"><Label>Luas Wilayah (km²)</Label><Input type="number" value={newVillage.area} onChange={e => setNewVillage({...newVillage, area: parseFloat(e.target.value)})} /></div>
              </div>
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Profil Naratif</Label>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] text-primary" onClick={() => handleAiSuggest('add')} disabled={isAiLoading}>
                    {isAiLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                    ISI DENGAN AI
                  </Button>
                </div>
                <Textarea className="h-24 bg-white" value={newVillage.description} onChange={e => setNewVillage({...newVillage, description: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button>
              <Button onClick={handleAdd} disabled={isSubmitting}>Simpan Desa</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50/50">
          <CardTitle className="text-lg">Katalog & Auditor Data</CardTitle>
          <CardDescription>Total {villages?.length || 0} entitas desa berkontribusi pada statistik publik.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-100/50">
              <TableRow>
                <TableHead className="pl-6">Entitas Desa</TableHead>
                <TableHead>Populasi</TableHead>
                <TableHead>Luas</TableHead>
                <TableHead>Kepadatan</TableHead>
                <TableHead className="text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : villages?.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-400">Belum ada data desa.</TableCell></TableRow>
              ) : villages?.map((v: any) => (
                <TableRow key={v.id} className="hover:bg-slate-50/50">
                  <TableCell className="pl-6">
                    <div>
                      <p className="font-bold text-slate-900">{v.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black">{v.province}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-medium"><div className="flex items-center gap-2"><Users className="h-3 w-3 text-primary/40" /> {v.population?.toLocaleString() || 0} Jiwa</div></TableCell>
                  <TableCell className="text-xs font-medium"><div className="flex items-center gap-2"><Ruler className="h-3 w-3 text-primary/40" /> {v.area || 0} km²</div></TableCell>
                  <TableCell className="text-xs font-mono">{(v.area > 0 ? (v.population / v.area) : 0).toFixed(0)}/km²</TableCell>
                  <TableCell className="text-right pr-6 space-x-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => handleEdit(v)}><Edit2 className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => handleDelete(v.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!isEditing} onOpenChange={(open) => !open && setIsEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Audit Data Statistik: {selectedVillage?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nama Desa</Label><Input value={selectedVillage?.name || ''} onChange={e => setSelectedVillage({...selectedVillage, name: e.target.value})} /></div>
              <div className="space-y-2"><Label>Provinsi</Label><Input value={selectedVillage?.province || ''} onChange={e => setSelectedVillage({...selectedVillage, province: e.target.value})} /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Populasi (Jiwa)</Label>
                <Input type="number" value={selectedVillage?.population || 0} onChange={e => setSelectedVillage({...selectedVillage, population: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Luas Wilayah (km²)</Label>
                <Input type="number" value={selectedVillage?.area || 0} onChange={e => setSelectedVillage({...selectedVillage, area: parseFloat(e.target.value)})} />
              </div>
            </div>

            <div className="space-y-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase font-bold text-primary flex items-center gap-2">Profil Naratif</Label>
                <Button size="sm" variant="outline" className="h-8 text-[10px]" onClick={() => handleAiSuggest('edit')} disabled={isAiLoading}>
                  {isAiLoading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Sparkles className="h-3 w-3 mr-2" />}
                  SARANKAN DENGAN AI
                </Button>
              </div>
              <Textarea className="h-32 bg-white" value={selectedVillage?.description || ''} onChange={e => setSelectedVillage({...selectedVillage, description: e.target.value})} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditing(null)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSubmitting}>Simpan Perubahan Data</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
