
'use client';

import { useState, useMemo } from 'react';
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
  PieChart, Activity, Shield, MapPin, Filter, ShoppingCart, Camera, Image, Loader2, Car, Bus, Link as LinkIcon,
  Copy, CheckCheck, Sparkles
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const NAV_ICONS = [
  'Home', 'BarChart', 'Users', 'Database', 'Map', 'Navigation', 'Info', 'FileText',
  'PieChart', 'Activity', 'Shield', 'MapPin', 'Filter', 'ShoppingCart', 'Camera', 'Image', 'Car', 'Bus'
];

const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return <HelpCircle className={className} />;
  return <IconComponent className={className} />;
};

export default function PengaturanNavigasiUtamaPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const menuQuery = query(collection(db, 'menus'), orderBy('order', 'asc'));
  const { data: allMenus, isLoading } = useCollection(menuQuery);

  const pagesQuery = query(collection(db, 'pages'), orderBy('title', 'asc'));
  const { data: pages } = useCollection(pagesQuery);

  const menus = useMemo(() => 
    (allMenus || []).filter((m: any) => ['bottom', 'header', 'left'].includes(m.position)), 
    [allMenus]
  );

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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredIcons = NAV_ICONS.filter(icon => 
    icon.toLowerCase().includes(iconSearch.toLowerCase())
  );

  const resetForm = () => {
    setIsEditing(null);
    setFormData({ 
        label: '', 
        icon: 'Home', 
        href: '#', 
        order: (menus?.length || 0) + 1, 
        position: 'bottom' 
    });
    setIconSearch('');
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Tautan Disalin", description: "Gunakan tautan ini pada kolom Tautan (URL)." });
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
      .then(() => toast({ title: "Berhasil", description: "Menu telah dihapus." }))
      .catch(async () => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'delete' })));
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Konfigurasi Navigasi Global</h1>
        <p className="text-muted-foreground">Hubungkan halaman publikasi dan data statistik ke antarmuka peta interaktif.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-lg border-primary/10">
            <CardHeader className="bg-slate-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                {isEditing ? <Edit2 className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
                {isEditing ? 'Edit Item Navigasi' : 'Tambah Item Baru'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAction} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Label Tampilan</Label>
                  <Input value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} placeholder="Misal: Profil Desa" className="h-11" required />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Alamat Tautan (URL)</Label>
                  <div className="flex gap-2">
                    <div className="bg-slate-100 flex items-center px-3 rounded-xl border border-slate-200">
                      <LinkIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input value={formData.href} onChange={e => setFormData({...formData, href: e.target.value})} placeholder="/visualizations atau /p/ID_HALAMAN" className="h-11" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Ikon Menu</Label>
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
                      <div className="p-3 border-b border-slate-100"><Input placeholder="Cari ikon..." className="h-9" value={iconSearch} onChange={e => setIconSearch(e.target.value)} /></div>
                      <div className="p-2 grid grid-cols-5 gap-1 max-h-60 overflow-y-auto">
                        {filteredIcons.map(icon => (
                          <Button key={icon} type="button" variant="ghost" size="icon" onClick={() => setFormData({...formData, icon})} className={`h-10 w-10 rounded-xl ${formData.icon === icon ? 'bg-primary/10 text-primary' : ''}`}><DynamicIcon name={icon} className="h-5 w-5" /></Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Tata Letak</Label>
                  <Select value={formData.position} onValueChange={(v: any) => setFormData({...formData, position: v})}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header">Header Atas (Info Utama)</SelectItem>
                      <SelectItem value="left">Toolbar Kiri (Aksi Cepat)</SelectItem>
                      <SelectItem value="bottom">Dock Bawah (Navigasi Utama)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Urutan Tampilan</Label>
                  <Input type="number" value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value)})} className="h-11" required />
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Button type="submit" className="w-full h-12 shadow-lg shadow-primary/20" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEditing ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />)}
                    {isEditing ? 'Simpan Perubahan' : 'Tambahkan ke Peta'}
                  </Button>
                  {isEditing && <Button type="button" variant="ghost" className="w-full text-slate-500" onClick={resetForm}>Batalkan</Button>}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Quick References Section - PERFECTED */}
          <Card className="shadow-sm border-primary/20 bg-primary/5 rounded-[2rem]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4" /> Referensi Tautan Publik
              </CardTitle>
              <CardDescription className="text-[10px]">Klik ikon untuk menyalin alamat tujuan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pb-6">
              <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-primary/10 group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-8 w-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><BarChart className="h-4 w-4" /></div>
                  <span className="text-xs font-bold truncate">Dashboard Statistik</span>
                </div>
                <Button size="icon" variant="ghost" className="h-9 w-9 hover:bg-primary/5" onClick={() => handleCopy('/visualizations', 'viz')}>
                  {copiedId === 'viz' ? <CheckCheck className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />}
                </Button>
              </div>

              {pages?.map((page: any) => (
                <div key={page.id} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100 group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-8 w-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><FileText className="h-4 w-4" /></div>
                    <span className="text-xs font-medium truncate">{page.title}</span>
                  </div>
                  <Button size="icon" variant="ghost" className="h-9 w-9 hover:bg-slate-100" onClick={() => handleCopy(`/p/${page.id}`, page.id)}>
                    {copiedId === page.id ? <CheckCheck className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-8 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Daftar Navigasi Terdaftar</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="pl-6">Label & Ikon</TableHead>
                  <TableHead>Alamat Tautan</TableHead>
                  <TableHead>Posisi</TableHead>
                  <TableHead className="text-center">Urutan</TableHead>
                  <TableHead className="text-right pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-20" /></TableCell></TableRow>
                ) : menus.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-20 text-slate-400">Belum ada navigasi yang dikonfigurasi.</TableCell></TableRow>
                ) : menus.map((menu: any) => (
                  <TableRow key={menu.id} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-white border rounded-2xl flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform"><DynamicIcon name={menu.icon} className="h-5 w-5" /></div>
                        <span className="font-bold text-slate-700">{menu.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 font-mono truncate max-w-[140px]">{menu.href}</TableCell>
                    <TableCell>
                      <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${
                        menu.position === 'bottom' ? 'bg-green-50 text-green-700 border-green-100' : 
                        menu.position === 'header' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {menu.position === 'bottom' ? 'Dock Bawah' : menu.position === 'header' ? 'Header Atas' : 'Toolbar Kiri'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs">{menu.order}</TableCell>
                    <TableCell className="text-right space-x-1 pr-6">
                      <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-600 hover:bg-slate-100" onClick={() => { setIsEditing(menu.id); setFormData(menu); }}><Edit2 className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-9 w-9 text-red-500 hover:bg-red-50" onClick={() => handleDelete(menu.id)}><Trash2 className="h-4 w-4" /></Button>
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
