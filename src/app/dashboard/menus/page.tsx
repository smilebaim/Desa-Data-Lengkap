
'use client';

import { useState, useMemo, useCallback } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus, Trash2, Edit2, Save, Search, HelpCircle, 
  Home, BarChart, Users, Database, Map, Navigation, Info, FileText,
  PieChart, Activity, Shield, MapPin, Filter, ShoppingCart, Camera, Image, Loader2, Link as LinkIcon,
  Copy, CheckCheck, Sparkles, TrendingUp, X
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const NAV_ICONS = [
  'Home', 'BarChart', 'Users', 'Database', 'Map', 'Navigation', 'Info', 'FileText',
  'PieChart', 'Activity', 'Shield', 'MapPin', 'Filter', 'ShoppingCart', 'Camera', 'Image', 'TrendingUp', 'Landmark'
];

const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return <HelpCircle className={className} />;
  return <IconComponent className={className} />;
};

export default function PengaturanNavigasiUtamaPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  // Memoize kueri agar tidak terjadi infinite reload
  const menuQuery = useMemo(() => query(collection(db, 'menus'), orderBy('order', 'asc')), [db]);
  const { data: allMenus, isLoading } = useCollection(menuQuery);

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    icon: 'Home',
    href: '#',
    order: 0,
    position: 'bottom' as 'bottom' | 'header' | 'left'
  });
  const [iconSearch, setIconSearch] = useState('');

  const resetForm = useCallback(() => {
    setIsEditing(null);
    setFormData({ label: '', icon: 'Home', href: '#', order: (allMenus?.length || 0) + 1, position: 'bottom' });
    setIconSearch('');
  }, [allMenus?.length]);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const dataToSave = { ...formData, order: Number(formData.order) };

    try {
      if (isEditing) {
        const docRef = doc(db, 'menus', isEditing);
        await updateDoc(docRef, dataToSave);
        toast({ title: "Berhasil", description: "Item navigasi diperbarui." });
      } else {
        const collRef = collection(db, 'menus');
        await addDoc(collRef, dataToSave);
        toast({ title: "Berhasil", description: "Navigasi baru ditambahkan." });
      }
      resetForm();
    } catch (error) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ 
        path: 'menus', 
        operation: isEditing ? 'update' : 'create', 
        requestResourceData: dataToSave 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id || !confirm('Hapus item navigasi ini?')) return;
    const docRef = doc(db, 'menus', id);
    try {
      await deleteDoc(docRef);
      toast({ title: "Berhasil", description: "Navigasi dihapus." });
    } catch (error) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'delete' }));
    }
  };

  const startEdit = (menu: any) => {
    setIsEditing(menu.id);
    setFormData({
      label: menu.label || '',
      icon: menu.icon || 'Home',
      href: menu.href || '#',
      order: menu.order || 0,
      position: menu.position || 'bottom'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredIcons = NAV_ICONS.filter(icon => 
    icon.toLowerCase().includes(iconSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Konfigurasi Navigasi Global</h1>
        <p className="text-muted-foreground">Kelola item navigasi untuk menghubungkan halaman publik ke peta interaktif.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-4">
          <Card className="shadow-lg border-primary/10 sticky top-6">
            <CardHeader className="bg-slate-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                {isEditing ? <Edit2 className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
                {isEditing ? 'Perbarui Navigasi' : 'Tambah Navigasi Baru'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAction} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500">Label Menu</Label>
                  <Input value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} placeholder="Misal: Profil Desa" className="h-11" required />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500">Alamat Tautan (HREF)</Label>
                  <Input value={formData.href} onChange={e => setFormData({...formData, href: e.target.value})} placeholder="/visualizations atau /p/ID_HALAMAN" className="h-11" required />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500">Ikon Lucide</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between gap-3 h-11 border-slate-200">
                        <div className="flex items-center gap-3">
                          <DynamicIcon name={formData.icon} className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{formData.icon}</span>
                        </div>
                        <Search className="h-4 w-4 text-slate-400" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-0 rounded-2xl shadow-2xl" align="start">
                      <div className="p-3 border-b"><Input placeholder="Cari ikon..." className="h-9" value={iconSearch} onChange={e => setIconSearch(e.target.value)} /></div>
                      <div className="p-2 grid grid-cols-5 gap-1 max-h-60 overflow-y-auto">
                        {filteredIcons.map(icon => (
                          <Button key={icon} type="button" variant="ghost" size="icon" onClick={() => setFormData({...formData, icon})} className={`h-10 w-10 rounded-xl ${formData.icon === icon ? 'bg-primary/10 text-primary' : ''}`}><DynamicIcon name={icon} className="h-5 w-5" /></Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500">Posisi Tampilan</Label>
                  <Select value={formData.position} onValueChange={(v: any) => setFormData({...formData, position: v})}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header">Header Atas</SelectItem>
                      <SelectItem value="left">Toolbar Kiri</SelectItem>
                      <SelectItem value="bottom">Dock Bawah</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500">Urutan Sortir</Label>
                  <Input type="number" value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value)})} className="h-11" required />
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Button type="submit" className="w-full h-12 shadow-lg" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEditing ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />)}
                    {isEditing ? 'Simpan Perubahan' : 'Tambahkan Menu'}
                  </Button>
                  {isEditing && <Button type="button" variant="ghost" className="w-full" onClick={resetForm}>Batalkan Edit</Button>}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-8 shadow-sm border-slate-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="pl-6">Identitas Menu</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead className="text-center">Urutan</TableHead>
                <TableHead className="text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary opacity-20" /></TableCell></TableRow>
              ) : allMenus?.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-400">Belum ada item navigasi yang terdaftar.</TableCell></TableRow>
              ) : allMenus?.map((menu: any) => (
                <TableRow key={menu.id} className="hover:bg-slate-50/50 group">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-white border rounded-2xl flex items-center justify-center text-primary shadow-sm"><DynamicIcon name={menu.icon} className="h-5 w-5" /></div>
                      <span className="font-bold text-slate-700">{menu.label}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 truncate max-w-[150px]">{menu.href}</TableCell>
                  <TableCell>
                    <span className="text-[9px] font-black uppercase px-2 py-1 rounded-full border bg-slate-100 text-slate-500">{menu.position}</span>
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs">{menu.order}</TableCell>
                  <TableCell className="text-right space-x-1 pr-6">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-600 hover:bg-slate-100" onClick={() => startEdit(menu)}><Edit2 className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDelete(menu.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
