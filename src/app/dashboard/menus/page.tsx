'use client';

import { useState } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Edit2, Save, X, LayoutDashboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export default function MenusPage() {
  const db = useFirestore();
  const menuQuery = query(collection(db, 'menus'), orderBy('order', 'asc'));
  const { data: menus, isLoading } = useCollection(menuQuery);
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    icon: 'Layers',
    href: '#',
    order: 0,
    position: 'bottom'
  });

  const handleAddMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    const collRef = collection(db, 'menus');
    
    const newMenu = { 
      ...formData, 
      order: Number(formData.order) 
    };

    addDoc(collRef, newMenu)
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: collRef.path,
          operation: 'create',
          requestResourceData: newMenu,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });

    setFormData({ label: '', icon: 'Layers', href: '#', order: (menus?.length || 0) + 1, position: 'bottom' });
    toast({ title: "Berhasil", description: "Menambahkan menu baru ke daftar." });
  };

  const handleDelete = async (id: string) => {
    const docRef = doc(db, 'menus', id);
    deleteDoc(docRef)
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
    toast({ title: "Berhasil", description: "Menu telah dihapus." });
  };

  const handleUpdate = async (id: string) => {
    const docRef = doc(db, 'menus', id);
    const updatedData = { ...formData, order: Number(formData.order) };
    
    updateDoc(docRef, updatedData)
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: updatedData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
    setIsEditing(null);
    toast({ title: "Berhasil", description: "Perubahan menu telah disimpan." });
  };

  const startEdit = (menu: any) => {
    setIsEditing(menu.id);
    setFormData({
      label: menu.label,
      icon: menu.icon,
      href: menu.href,
      order: menu.order,
      position: menu.position
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manajer Menu</h1>
          <p className="text-muted-foreground">Sesuaikan navigasi peta Desa Lengkap Anda secara dinamis.</p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-1 shadow-md border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {isEditing ? 'Edit Menu' : 'Tambah Menu Baru'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={isEditing ? (e) => { e.preventDefault(); handleUpdate(isEditing); } : handleAddMenu} className="space-y-4">
              <div className="space-y-2">
                <Label>Label Menu</Label>
                <Input value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} placeholder="Misal: Statistik" required />
              </div>
              <div className="space-y-2">
                <Label>Ikon Lucide</Label>
                <Input value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} placeholder="User, Map, Layers, dsb." required />
              </div>
              <div className="space-y-2">
                <Label>Urutan Tampilan</Label>
                <Input type="number" value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value)})} required />
              </div>
              <div className="space-y-2">
                <Label>Posisi di Peta</Label>
                <Select value={formData.position} onValueChange={v => setFormData({...formData, position: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom">Bawah (Navigasi Utama)</SelectItem>
                    <SelectItem value="left">Kiri (Alat Peta)</SelectItem>
                    <SelectItem value="header">Atas (Header)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                 <Button type="submit" className="flex-1">
                  {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                  {isEditing ? 'Simpan' : 'Tambah'}
                </Button>
                {isEditing && (
                  <Button type="button" variant="outline" onClick={() => setIsEditing(null)}>
                    Batal
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-md border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Struktur Navigasi Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground animate-pulse">Menghubungkan ke database...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-[150px]">Label</TableHead>
                    <TableHead>Posisi</TableHead>
                    <TableHead>Ikon</TableHead>
                    <TableHead className="text-center">Urutan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menus.map((menu: any) => (
                    <TableRow key={menu.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium text-slate-700">{menu.label}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          menu.position === 'bottom' ? 'bg-blue-100 text-blue-700' :
                          menu.position === 'left' ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {menu.position}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-500 font-mono text-xs">{menu.icon}</TableCell>
                      <TableCell className="text-center font-semibold">{menu.order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => startEdit(menu)} className="h-8 w-8">
                            <Edit2 className="h-4 w-4 text-slate-600" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(menu.id)} className="h-8 w-8 hover:bg-red-50">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {menus.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                        <LayoutDashboard className="mx-auto h-12 w-12 opacity-10 mb-4" />
                        <p>Belum ada menu yang dikonfigurasi.<br/>Gunakan panel di kiri untuk menambah menu pertama.</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}