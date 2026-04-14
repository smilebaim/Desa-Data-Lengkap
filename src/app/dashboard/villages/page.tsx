'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { 
  Plus, Trash2, Edit2, Save, Sparkles, Landmark, 
  Loader2, Users, MapPin, Search, Info, Globe, Tag
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
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedVillage, setSelectedVillage] = useState<any>(null);

  const handleEdit = (village: any) => {
    setSelectedVillage(village);
    setIsEditing(village.id);
  };

  const handleSave = async () => {
    if (!selectedVillage) return;
    setIsSubmitting(true);

    const docRef = doc(db, 'villages', selectedVillage.id);
    const { id, ...dataToSave } = selectedVillage;

    updateDoc(docRef, dataToSave)
      .then(() => {
        toast({ title: "Berhasil", description: "Data desa telah diperbarui." });
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

  const handleAiSuggest = async () => {
    if (!selectedVillage?.name || !selectedVillage?.province) return;
    
    setIsAiLoading(true);
    try {
      const result = await suggestVillageContent({
        name: selectedVillage.name,
        province: selectedVillage.province
      });
      
      setSelectedVillage({
        ...selectedVillage,
        description: result.description,
        tagline: result.tagline,
        potentials: result.potentials
      });
      
      toast({ 
        title: "AI Berhasil", 
        description: "Konten deskripsi dan tagline telah dihasilkan." 
      });
    } catch (error) {
      toast({ 
        title: "AI Gagal", 
        description: "Gagal menghubungkan ke layanan AI.", 
        variant: "destructive" 
      });
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
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manajemen Wilayah Desa</h1>
        <p className="text-muted-foreground">Kelola profil, populasi, dan deskripsi wilayah administratif desa.</p>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daftar Desa Terdaftar</CardTitle>
            <CardDescription>Total {villages?.length || 0} wilayah dalam jaringan.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Nama Desa</TableHead>
                <TableHead>Provinsi</TableHead>
                <TableHead>Populasi</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : villages?.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-400">Belum ada desa. Gunakan Editor Spasial untuk membuat batas wilayah.</TableCell></TableRow>
              ) : villages?.map((v: any) => (
                <TableRow key={v.id}>
                  <TableCell className="font-bold">{v.name}</TableCell>
                  <TableCell className="text-xs">{v.province}</TableCell>
                  <TableCell className="text-xs">{v.population?.toLocaleString() || 0} Jiwa</TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate text-slate-500">{v.description || 'Belum ada deskripsi'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(v)}><Edit2 className="h-4 w-4 text-primary" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(v.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
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
              <Landmark className="h-5 w-5 text-primary" />
              Edit Profil Desa: {selectedVillage?.name}
            </DialogTitle>
            <DialogDescription>Gunakan AI untuk membantu mengisi deskripsi profil yang menarik.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-slate-500">Nama Desa</Label>
                <Input value={selectedVillage?.name || ''} onChange={e => setSelectedVillage({...selectedVillage, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-slate-500">Provinsi</Label>
                <Input value={selectedVillage?.province || ''} onChange={e => setSelectedVillage({...selectedVillage, province: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-slate-500">Populasi (Jiwa)</Label>
                <div className="flex gap-2 items-center">
                   <Users className="h-4 w-4 text-slate-400" />
                   <Input type="number" value={selectedVillage?.population || 0} onChange={e => setSelectedVillage({...selectedVillage, population: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-slate-500">Tagline Desa</Label>
                <div className="flex gap-2 items-center">
                   <Tag className="h-4 w-4 text-slate-400" />
                   <Input value={selectedVillage?.tagline || ''} onChange={e => setSelectedVillage({...selectedVillage, tagline: e.target.value})} placeholder="Slogan desa..." />
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase font-bold text-primary flex items-center gap-2">
                  <Sparkles className="h-3 w-3" />
                  Profil & Deskripsi Naratif
                </Label>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 text-[10px] font-bold border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={handleAiSuggest}
                  disabled={isAiLoading}
                >
                  {isAiLoading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Sparkles className="h-3 w-3 mr-2" />}
                  SARANKAN DENGAN AI
                </Button>
              </div>
              <Textarea 
                className="h-32 bg-white text-sm" 
                placeholder="Deskripsikan sejarah, budaya, atau keunggulan desa..."
                value={selectedVillage?.description || ''}
                onChange={e => setSelectedVillage({...selectedVillage, description: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditing(null)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
