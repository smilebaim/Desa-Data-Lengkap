'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus, Trash2, Edit2, Save, Search, HelpCircle, 
  Home, BarChart, Users, Database, Map, Navigation, Info, FileText,
  PieChart, Activity, Shield, MapPin, Filter, GraduationCap, 
  Briefcase, HeartPulse, Wheat, Droplets, Zap, 
  Car, Bike, Bus, ShoppingCart, Camera, Image, Loader2
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const RECOMMENDED_ICONS = [
  'Home', 'BarChart', 'Users', 'Database', 'Map', 'Navigation', 'Info', 'FileText',
  'PieChart', 'Activity', 'Shield', 'MapPin', 'Filter', 'GraduationCap', 'Briefcase',
  'HeartPulse', 'Wheat', 'Droplets', 'Zap', 'ShoppingCart', 'Camera', 'Image', 'Car', 'Bus'
];

const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return <HelpCircle className={className} />;
  return <IconComponent className={className} />;
};

export default function NavigasiUtamaPage() {
  const db = useFirestore();
  // Menggunakan kueri sederhana untuk menghindari kebutuhan indeks komposit yang belum terdaftar
  const allMenusQuery = query(collection(db, 'menus'), orderBy('order', 'asc'));
  const { data: allMenus, isLoading } = useCollection(allMenusQuery);
  const { toast } = useToast();

  // Filter sisi klien untuk stabilitas
  const menus = useMemo(() => 
    (allMenus || []).filter((m: any) => m.position === 'bottom'), 
    [allMenus]
  );

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    icon: 'Home',
    href: '#',
    order: 0,
    position: 'bottom' as const
  });
  const [iconSearch, setIconSearch] = useState('');

  const filteredIcons = RECOMMENDED_ICONS.filter(icon => 
    icon.toLowerCase().includes(iconSearch.toLowerCase())
  );

  const resetForm = () => {
    setIsEditing(null);
    setFormData({ label: '', icon: 'Home', href: '#', order: (menus?.length || 0) + 1, position: 'bottom' });
    setIconSearch('');
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const collRef = collection(db, 'menus');
    const data = { ...formData, order: Number(formData.order) };

    if (isEditing) {
      const docRef = doc(db, 'menus', isEditing);
      updateDoc(docRef, data)
        .then(() => {
          toast({ title: "Berhasil", description: "Navigasi telah diperbarui." });
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
          toast({ title: "Berhasil", description: "Navigasi baru telah ditambahkan." });
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
    const docRef = doc(db, 'menus', id);
    deleteDoc(docRef)
      .then(() => {
        toast({ title: "Berhasil", description: "Item navigasi telah dihapus." });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ 
          path: docRef.path, 
          operation: 'delete' 
        }));
      });
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Navigasi Utama</h1>
        <p className="text-muted-foreground">Kelola tombol akses cepat yang muncul di bilah navigasi bawah peta.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        <Card className="lg:col-span-4 shadow-sm border-slate-200 sticky top-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {isEditing ? <Edit2 className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
              {isEditing ? 'Edit Item' : 'Tambah Navigasi'}
            </CardTitle>
            <CardDescription>Atur label dan ikon yang mewakili fitur Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAction} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Label Menu</Label>
                <Input value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} placeholder="Misal: Beranda" required />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Pilih Ikon</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between gap-2 h-11 border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-slate-100 rounded-lg">
                          <DynamicIcon name={formData.icon} className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{formData.icon}</span>
                      </div>
                      <Search className="h-4 w-4 text-slate-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0" align="start">
                    <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input 
                          placeholder="Cari ikon..." 
                          className="pl-9 h-9 bg-white" 
                          value={iconSearch} 
                          onChange={e => setIconSearch(e.target.value)} 
                        />
                      </div>
                    </div>
                    <div className="p-2 grid grid-cols-5 gap-1 max-h-60 overflow-y-auto">
                      {filteredIcons.map(icon => (
                        <Button 
                          key={icon} 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setFormData({...formData, icon})} 
                          className={`h-10 w-10 transition-all ${formData.icon === icon ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100'}`}
                        >
                          <DynamicIcon name={icon} className="h-5 w-5" />
                        </Button>
                      ))}
                      {filteredIcons.length === 0 && (
                        <div className="col-span-5 py-6 text-center text-xs text-slate-400">Tidak ada ikon ditemukan</div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Urutan Tampilan</Label>
                <Input type="number" value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value)})} required min="0" />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button type="submit" className="w-full h-11 shadow-md" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEditing ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />)}
                  {isEditing ? 'Simpan Perubahan' : 'Tambahkan Item'}
                </Button>
                {isEditing && (
                  <Button type="button" variant="ghost" className="w-full text-slate-500" onClick={resetForm}>
                    Batal Edit
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-8 shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Pratinjau Urutan</CardTitle>
              <CardDescription>Atur item untuk pengalaman pengguna yang optimal.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-16 text-center">No</TableHead>
                  <TableHead>Ikon & Label</TableHead>
                  <TableHead className="text-center">Urutan</TableHead>
                  <TableHead className="text-right pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-20" />
                    <p className="mt-2 text-xs text-slate-400 font-medium">Memuat navigasi...</p>
                  </TableCell></TableRow>
                ) : menus.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-16 text-slate-400">Belum ada item navigasi ditambahkan.</TableCell></TableRow>
                ) : menus.map((menu: any, idx: number) => (
                  <TableRow key={menu.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="text-center text-xs font-bold text-slate-400">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-slate-100 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                          <DynamicIcon name={menu.icon} className="h-5 w-5" />
                        </div>
                        <span className="font-semibold text-slate-700">{menu.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-[10px] font-black text-slate-500">
                        {menu.order}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-1 pr-6">
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary hover:bg-primary/5" onClick={() => { setIsEditing(menu.id); setFormData(menu); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-red-500 hover:bg-red-50" onClick={() => handleDelete(menu.id)}>
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