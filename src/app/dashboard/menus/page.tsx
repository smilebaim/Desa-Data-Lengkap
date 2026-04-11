
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
import { Plus, Trash2, Edit2, Save, X, Settings2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    try {
      addDoc(collection(db, 'menus'), formData);
      setFormData({ label: '', icon: 'Layers', href: '#', order: menus.length, position: 'bottom' });
      toast({ title: "Berhasil", description: "Menu baru ditambahkan." });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal", description: "Terjadi kesalahan." });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      deleteDoc(doc(db, 'menus', id));
      toast({ title: "Berhasil", description: "Menu dihapus." });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal", description: "Gagal menghapus menu." });
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      updateDoc(doc(db, 'menus', id), formData);
      setIsEditing(null);
      toast({ title: "Berhasil", description: "Menu diperbarui." });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal", description: "Gagal memperbarui menu." });
    }
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
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajer Menu</h1>
          <p className="text-muted-foreground">Atur navigasi yang muncul di halaman utama.</p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form Tambah Menu */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Tambah Menu Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddMenu} className="space-y-4">
              <div className="space-y-2">
                <Label>Label</Label>
                <Input value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} placeholder="Contoh: Profil" required />
              </div>
              <div className="space-y-2">
                <Label>Ikon Lucide</Label>
                <Input value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} placeholder="User, Map, Layers, dsb." required />
              </div>
              <div className="space-y-2">
                <Label>Urutan</Label>
                <Input type="number" value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value)})} required />
              </div>
              <div className="space-y-2">
                <Label>Posisi</Label>
                <Select value={formData.position} onValueChange={v => setFormData({...formData, position: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom">Navigasi Bawah</SelectItem>
                    <SelectItem value="left">Toolbar Kiri</SelectItem>
                    <SelectItem value="header">Header</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Tambah
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tabel Daftar Menu */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Daftar Navigasi Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-10 text-center text-muted-foreground">Memuat...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>Posisi</TableHead>
                    <TableHead>Ikon</TableHead>
                    <TableHead>Urutan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menus.map((menu: any) => (
                    <TableRow key={menu.id}>
                      <TableCell className="font-medium">
                        {isEditing === menu.id ? (
                          <Input size={10} value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} />
                        ) : menu.label}
                      </TableCell>
                      <TableCell className="capitalize">{menu.position}</TableCell>
                      <TableCell className="font-mono text-xs">{menu.icon}</TableCell>
                      <TableCell>{menu.order}</TableCell>
                      <TableCell className="text-right">
                        {isEditing === menu.id ? (
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" onClick={() => handleUpdate(menu.id)}>
                              <Save className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setIsEditing(null)}>
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" onClick={() => startEdit(menu)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(menu.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {menus.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Belum ada menu dikonfigurasi.</TableCell>
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
