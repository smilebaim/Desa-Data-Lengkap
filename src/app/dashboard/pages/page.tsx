
'use client';

import { useState, useMemo, useCallback } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Edit2, Save, FileText, Loader2, Eye, BarChart3, Info, Globe, Sparkles, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Link from 'next/link';

export default function PagesManagementPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  // Memoize query to prevent infinite reload loop
  const pagesQuery = useMemo(() => query(collection(db, 'pages'), orderBy('updatedAt', 'desc')), [db]);
  const { data: pages, isLoading } = useCollection(pagesQuery);

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    showStats: false
  });

  const resetForm = useCallback(() => {
    setIsEditing(null);
    setFormData({ title: '', content: '', showStats: false });
  }, []);

  const handleEdit = (page: any) => {
    setIsEditing(page.id);
    setFormData({
      title: page.title || '',
      content: page.content || '',
      showStats: !!page.showStats
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (!formData.title || !formData.content) {
      return toast({ title: "Galat", description: "Judul dan konten harus diisi.", variant: "destructive" });
    }

    setIsSubmitting(true);
    const dataToSave = {
      ...formData,
      updatedAt: serverTimestamp()
    };

    try {
      if (isEditing) {
        const docRef = doc(db, 'pages', isEditing);
        await updateDoc(docRef, dataToSave);
        toast({ title: "Berhasil", description: "Halaman diperbarui." });
      } else {
        const collRef = collection(db, 'pages');
        await addDoc(collRef, dataToSave);
        toast({ title: "Berhasil", description: "Halaman baru dibuat." });
      }
      resetForm();
    } catch (error) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ 
        path: 'pages', 
        operation: isEditing ? 'update' : 'create', 
        requestResourceData: dataToSave 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id || !confirm('Hapus halaman ini secara permanen?')) return;
    
    const docRef = doc(db, 'pages', id);
    try {
      await deleteDoc(docRef);
      toast({ title: "Berhasil", description: "Halaman telah dihapus." });
    } catch (error) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ 
        path: docRef.path, 
        operation: 'delete' 
      }));
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manajemen Halaman Dinamis</h1>
        <p className="text-muted-foreground">Buat profil desa atau laporan publik yang terintegrasi dengan data real-time.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        <Card className="lg:col-span-5 shadow-xl border-primary/10 sticky top-6">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-lg flex items-center gap-2">
              {isEditing ? <Edit2 className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
              {isEditing ? 'Edit Konten Halaman' : 'Buat Halaman Baru'}
            </CardTitle>
            <CardDescription>Isi detail halaman untuk dipublikasikan ke peta.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Judul Publikasi</Label>
                <Input 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="Misal: Profil Potensi Wisata Desa" 
                  className="h-11"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Konten Naratif</Label>
                <Textarea 
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value})} 
                  placeholder="Tuliskan isi halaman di sini... Gunakan [CHART:ID] untuk menyematkan grafik." 
                  className="min-h-[250px] resize-none focus:ring-primary/20"
                  required 
                />
              </div>

              <div className="p-5 bg-primary/5 rounded-3xl border border-primary/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-bold flex items-center gap-2 text-primary">
                      <BarChart3 className="h-4 w-4" />
                      Sematkan Modul Statistik
                    </Label>
                    <p className="text-[10px] text-slate-500 leading-relaxed">Otomatis menampilkan infografis populasi dan wilayah di bawah konten.</p>
                  </div>
                  <Switch 
                    checked={formData.showStats} 
                    onCheckedChange={(checked) => setFormData({...formData, showStats: checked})} 
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button type="submit" className="w-full h-12 shadow-lg" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {isEditing ? 'Simpan Perubahan' : 'Terbitkan Sekarang'}
                </Button>
                {isEditing && (
                  <Button type="button" variant="ghost" className="w-full text-slate-500" onClick={resetForm}>
                    <X className="mr-2 h-4 w-4" /> Batalkan Edit
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-7 shadow-sm border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary/60" />
              Katalog Halaman Publik
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="pl-6">Judul Halaman</TableHead>
                  <TableHead>Integrasi</TableHead>
                  <TableHead className="text-right pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-20" /></TableCell></TableRow>
                ) : pages?.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-12 text-slate-400">Belum ada halaman dinamis.</TableCell></TableRow>
                ) : pages?.map((page: any) => (
                  <TableRow key={page.id} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-700">{page.title}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">ID: {page.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {page.showStats ? (
                        <div className="flex items-center gap-2 text-[9px] bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-black uppercase tracking-wider border border-green-100">
                          <BarChart3 className="h-3 w-3" /> Statistik
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[9px] bg-slate-100 text-slate-400 px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                          <Info className="h-3 w-3" /> Narasi
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1 pr-6">
                      <Link href={`/p/${page.id}`} target="_blank">
                        <Button size="icon" variant="ghost" className="h-9 w-9 text-blue-500 hover:bg-blue-50">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-600 hover:bg-slate-100" onClick={() => handleEdit(page)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-9 w-9 text-red-500 hover:bg-red-50" onClick={() => handleDelete(page.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
