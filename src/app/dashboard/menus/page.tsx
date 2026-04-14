
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
  Copy, CheckCheck
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
        <p className="text-muted-foreground">Hubungkan halaman statistik dan halaman dinamis Anda ke antarmuka peta publik.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {isEditing ? <Edit2 className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
                {isEditing ? 'Edit Menu' : 'Tambah Menu'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAction} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Label Menu</Label>
                  <Input value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} placeholder="Misal: Data Statistik" required />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Tautan (URL)</Label>
                  <div className="flex gap-2">
                    <div className="bg-slate-100 flex items-center px-3 rounded-lg border border-slate-200">
                      <LinkIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input value={formData.href} onChange={e => setFormData({...formData, href: e.target.value})} placeholder="/visualizations atau /p/id" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Pilih Ikon</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between gap-2 h-11 border-slate-200">
                        <div className="flex items-center gap-3">
                          <DynamicIcon name={formData.icon} className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{formData.icon}</span>
                        </div>
                        <Search className="h-4 w-4 text-slate-400" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-0" align="start">
                      <div className="p-3 border-b border-slate-100"><Input placeholder="Cari ikon..." className="h-9" value={iconSearch} onChange={e => setIconSearch(e.target.value)} /></div>
                      <div className="p-2 grid grid-cols-5 gap-1 max-h-60 overflow-y-auto">
                        {filteredIcons.map(icon => (
                          <Button key={icon} type="button" variant="ghost" size="icon" onClick={() => setFormData({...formData, icon})} className={`h-10 w-10 ${formData.icon === icon ? 'bg-primary/10 text-primary' : ''}`}><DynamicIcon name={icon} className="h-5 w-5" /></Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Posisi Tampilan</Label>
                  <Select value={formData.position} onValueChange={(v: any) => setFormData({...formData, position: v})}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header">Atas (Header Info)</SelectItem>
                      <SelectItem value="left">Samping (Toolbar Kiri)</SelectItem>
                      <SelectItem value="bottom">Bawah (Bar Utama)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Urutan</Label>
                  <Input type="number" value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value)})} required />
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Button type="submit" className="w-full h-11 shadow-md" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEditing ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />)}
                    {isEditing ? 'Simpan' : 'Tambah'}
                  </Button>
                  {isEditing && <Button type="button" variant="ghost" className="w-full text-slate-500" onClick={resetForm}>Batal</Button>}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Reference Links Section */}
          <Card className="shadow-sm border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                <LinkIcon className="h-4 w-4" /> Referensi Tautan Cepat
              </CardTitle>
              <CardDescription className="text-[10px]">Klik ikon untuk menyalin tautan halaman statistik atau halaman dinamis.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-primary/10">
                <div className="flex items-center gap-2 overflow-hidden">
                  <BarChart className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-xs font-bold truncate">Dashboard Statistik Utama</span>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleCopy('/visualizations', 'viz')}>
                  {copiedId === 'viz' ? <CheckCheck className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>

              {pages?.map((page: any) => (
                <div key={page.id} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs truncate">{page.title}</span>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleCopy(`/p/${page.id}`, page.id)}>
                    {copiedId === page.id ? <CheckCheck className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-8 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Item Navigasi Terdaftar</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Tautan</TableHead>
                  <TableHead>Posisi</TableHead>
                  <TableHead className="text-center">Urutan</TableHead>
                  <TableHead className="text-right pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-16"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-20" /></TableCell></TableRow>
                ) : menus.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-16 text-slate-400">Belum ada navigasi ditambahkan.</TableCell></TableRow>
                ) : menus.map((menu: any) => (
                  <TableRow key={menu.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-slate-100 rounded-lg flex items-center justify-center text-primary"><DynamicIcon name={menu.icon} className="h-5 w-5" /></div>
                        <span className="font-semibold text-slate-700">{menu.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 font-mono truncate max-w-[150px]">{menu.href}</TableCell>
                    <TableCell><span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${menu.position === 'bottom' ? 'bg-green-100 text-green-700' : menu.position === 'header' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{menu.position === 'bottom' ? 'Bawah' : menu.position === 'header' ? 'Atas' : 'Samping'}</span></TableCell>
                    <TableCell className="text-center font-mono text-xs">{menu.order}</TableCell>
                    <TableCell className="text-right space-x-1 pr-6">
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary" onClick={() => { setIsEditing(menu.id); setFormData(menu); }}><Edit2 className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-red-500" onClick={() => handleDelete(menu.id)}><Trash2 className="h-4 w-4" /></Button>
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
