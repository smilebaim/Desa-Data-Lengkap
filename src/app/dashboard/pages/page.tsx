
'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Edit2, Save, FileText, Loader2, Eye, BarChart3, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Link from 'next/link';

export default function PagesManagementPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const pagesQuery = useMemo(() => query(collection(db, 'pages'), orderBy('updatedAt', 'desc')), [db]);
  const { data: pages, isLoading } = useCollection(pagesQuery);

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    showStats: false
  });

  const resetForm = () => {
    setIsEditing(null);
    setFormData({ title: '', content: '', showStats: false });
  };

  const handleEdit = (page: any) => {
    setIsEditing(page.id);
    setFormData({
      title: page.title,
      content: page.content,
      showStats: !!page.showStats
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const collRef = collection(db, 'pages');
    const data = {
      ...formData,
      updatedAt: serverTimestamp()
    };

    if (isEditing) {
      const docRef = doc(db, 'pages', isEditing);
      updateDoc(docRef, data)
        .then(() => {
          toast({ title: "Berhasil", description: "Halaman diperbarui." });
          resetForm();
        })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ 
            path: docRef.path, 
            operation: 'update', 
            requestResourceData: data 
          }));
        })
        .finally(() => setIsSubmitting(false));
    } else {
      addDoc(collRef, data)
        .then(() => {
          toast({ title: "Berhasil", description: "Halaman baru dibuat." });
          resetForm();
        })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ 
            path: collRef.path, 
            operation: 'create', 
            requestResourceData: data 
          }));
        })
        .finally(() => setIsSubmitting(false));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus halaman ini?')) return;
    const docRef = doc(db, 'pages', id);
    deleteDoc(docRef)
      .then(() => toast({ title: "Berhasil", description: "Halaman dihapus." }))
      .catch(async () => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'delete' })));
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manajemen Halaman Dinamis</h1>
        <p className="text-muted-foreground">Buat halaman profil atau laporan dengan opsi penyisipan data statistik desa.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        <Card className="lg:col-span-5 shadow-sm border-slate-200 sticky top-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {isEditing ? <Edit2 className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
              {isEditing ? 'Edit Halaman' : 'Buat Halaman Baru'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Judul Halaman</Label>
                <Input 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="Misal: Profil Ekonomi Desa" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Konten Halaman</Label>
                <Textarea 
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value})} 
                  placeholder="Tulis narasi atau konten profil di sini..." 
                  className="min-h-[200px]"
                  required 
                />
              </div>

              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      Sisipkan Statistik & Data
                    </Label>
                    <p className="text-[10px] text-slate-500">Aktifkan untuk menampilkan dashboard infografis otomatis.</p>
                  </div>
                  <Switch 
                    checked={formData.showStats} 
                    onCheckedChange={(checked) => setFormData({...formData, showStats: checked})} 
                  />
                </div>
                {formData.showStats && (
                  <div className="flex items-start gap-2 text-[9px] text-primary/70 bg-white/50 p-2 rounded-lg border border-primary/5">
                    <Info className="h-3 w-3 shrink-0 mt-0.5" />
                    <span>Halaman ini akan secara otomatis menyertakan visualisasi populasi dan luas wilayah dari modul Statistik Desa.</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {isEditing ? 'Simpan Perubahan' : 'Terbitkan Halaman'}
                </Button>
                {isEditing && (
                  <Button type="button" variant="ghost" className="w-full" onClick={resetForm}>
                    Batal
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-7 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Daftar Halaman Terdaftar</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Status Data</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                ) : pages?.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-10 text-slate-400">Belum ada halaman dinamis.</TableCell></TableRow>
                ) : pages?.map((page: any) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-bold flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      {page.title}
                    </TableCell>
                    <TableCell>
                      {page.showStats ? (
                        <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">Tersemat Statistik</span>
                      ) : (
                        <span className="text-[9px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase">Hanya Teks</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Link href={`/p/${page.id}`} target="_blank">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-600" onClick={() => handleEdit(page)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => handleDelete(page.id)}>
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
