
'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus, Trash2, Edit2, Save, Search, HelpCircle, Loader2,
  Layers, Filter, Settings, Shield, MapPin, 
  Navigation, Layout, Camera, Image,
  Database, Globe, Compass, Info, MousePointer2,
  Maximize, Minimize, ZoomIn, ZoomOut, Target,
  Eye, EyeOff, Ruler, Grid, Map as MapIcon,
  Wind, Thermometer, Cloud, Droplets,
  Zap, Flame, AlertTriangle, Radio, Hexagon
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

// Dynamic imports for Map components to avoid SSR issues
const MapEditor = dynamic(() => import('./map-editor'), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Memuat Peta Editor...</div>
});

const TOOL_ICONS = [
  'Layers', 'Filter', 'Search', 'Settings', 'Shield', 'MapPin', 
  'Navigation', 'Layout', 'Camera', 'Image', 'Database', 'Globe', 
  'Compass', 'Info', 'MousePointer2', 'Maximize', 'Minimize', 
  'ZoomIn', 'ZoomOut', 'Target', 'Eye', 'EyeOff', 'Ruler', 
  'Grid', 'Map', 'Wind', 'Thermometer', 'Cloud', 'Droplets',
  'Zap', 'Flame', 'AlertTriangle', 'Radio'
];

const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return <HelpCircle className={className} />;
  return <IconComponent className={className} />;
};

export default function PengaturanAlatPetaPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  // Data for Sidebar Tools
  const menuQuery = query(collection(db, 'menus'), orderBy('order', 'asc'));
  const { data: allMenus, isLoading: isMenusLoading } = useCollection(menuQuery);
  const leftTools = useMemo(() => (allMenus || []).filter((m: any) => m.position === 'left'), [allMenus]);

  // Data for Villages
  const villageQuery = query(collection(db, 'villages'), orderBy('name', 'asc'));
  const { data: villages, isLoading: isVillagesLoading } = useCollection(villageQuery);

  const [activeTab, setActiveTab] = useState('config');
  const [isEditingTool, setIsEditingTool] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  
  const [toolFormData, setToolFormData] = useState({
    label: '',
    icon: 'Layers',
    href: '#',
    order: 0,
    position: 'left' as const
  });

  const [villageFormData, setVillageFormData] = useState<any>({
    name: '',
    province: '',
    population: 0,
    location: { lat: -2.5489, lng: 118.0149 },
    boundary: []
  });

  const filteredIcons = TOOL_ICONS.filter(icon => 
    icon.toLowerCase().includes(iconSearch.toLowerCase())
  );

  const handleToolAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const collRef = collection(db, 'menus');
    const data = { ...toolFormData, order: Number(toolFormData.order) };

    if (isEditingTool) {
      const docRef = doc(db, 'menus', isEditingTool);
      updateDoc(docRef, data)
        .then(() => {
          toast({ title: "Berhasil", description: "Alat peta diperbarui." });
          setIsEditingTool(null);
          setToolFormData({ label: '', icon: 'Layers', href: '#', order: leftTools.length + 1, position: 'left' });
        })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: data }));
        })
        .finally(() => setIsSubmitting(false));
    } else {
      addDoc(collRef, data)
        .then(() => {
          toast({ title: "Berhasil", description: "Alat peta baru ditambahkan." });
          setToolFormData({ label: '', icon: 'Layers', href: '#', order: leftTools.length + 1, position: 'left' });
        })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: collRef.path, operation: 'create', requestResourceData: data }));
        })
        .finally(() => setIsSubmitting(false));
    }
  };

  const handleVillageSave = async () => {
    if (!villageFormData.name) return toast({ title: "Galat", description: "Nama desa harus diisi.", variant: "destructive" });
    
    setIsSubmitting(true);
    const collRef = collection(db, 'villages');
    
    addDoc(collRef, villageFormData)
      .then(() => {
        toast({ title: "Berhasil", description: "Data desa dan poligon wilayah disimpan." });
        setVillageFormData({ name: '', province: '', population: 0, location: { lat: -2.5489, lng: 118.0149 }, boundary: [] });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: collRef.path, operation: 'create', requestResourceData: villageFormData }));
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleDelete = async (coll: string, id: string) => {
    const docRef = doc(db, coll, id);
    deleteDoc(docRef)
      .then(() => toast({ title: "Berhasil", description: "Item telah dihapus." }))
      .catch(async () => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'delete' })));
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pusat Manajemen Peta</h1>
        <p className="text-muted-foreground">Kelola alat navigasi dan data wilayah poligon desa secara terintegrasi.</p>
      </div>

      <Tabs defaultValue="config" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="config" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Settings className="h-4 w-4 mr-2" />
            Konfigurasi Alat
          </TabsTrigger>
          <TabsTrigger value="villages" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Hexagon className="h-4 w-4 mr-2" />
            Input Poligon Desa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="animate-in fade-in duration-500">
          <div className="grid gap-8 lg:grid-cols-12 items-start">
            <Card className="lg:col-span-4 shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Tambah/Edit Alat Samping</CardTitle>
                <CardDescription>Ikon yang muncul di panel kiri peta publik.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleToolAction} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">Label Alat</Label>
                    <Input value={toolFormData.label} onChange={e => setToolFormData({...toolFormData, label: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">Ikon</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between h-11">
                          <div className="flex items-center gap-3">
                            <DynamicIcon name={toolFormData.icon} className="h-4 w-4 text-accent" />
                            <span>{toolFormData.icon}</span>
                          </div>
                          <Search className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-0">
                        <div className="p-2 border-b"><Input placeholder="Cari..." value={iconSearch} onChange={e => setIconSearch(e.target.value)} /></div>
                        <div className="p-1 grid grid-cols-5 gap-1 max-h-60 overflow-y-auto">
                          {filteredIcons.map(icon => (
                            <Button key={icon} variant="ghost" size="icon" onClick={() => setToolFormData({...toolFormData, icon})}><DynamicIcon name={icon} className="h-4 w-4" /></Button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">Urutan</Label>
                    <Input type="number" value={toolFormData.order} onChange={e => setToolFormData({...toolFormData, order: parseInt(e.target.value)})} />
                  </div>
                  <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2" />}
                    {isEditingTool ? 'Simpan Perubahan' : 'Tambah Alat'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-8 shadow-sm border-slate-200">
              <CardHeader><CardTitle className="text-lg">Daftar Alat Samping Aktif</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead>Label</TableHead><TableHead className="text-center">Urutan</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {isMenusLoading ? <TableRow><TableCell colSpan={3} className="text-center py-10">Memuat...</TableCell></TableRow> : leftTools.map((tool: any) => (
                      <TableRow key={tool.id}>
                        <TableCell><div className="flex items-center gap-3"><DynamicIcon name={tool.icon} className="h-5 w-5 text-accent" /><b>{tool.label}</b></div></TableCell>
                        <TableCell className="text-center">{tool.order}</TableCell>
                        <TableCell className="text-right">
                          <Button size="icon" variant="ghost" onClick={() => { setIsEditingTool(tool.id); setToolFormData(tool); }}><Edit2 className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete('menus', tool.id)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="villages" className="animate-in slide-in-from-bottom-2 duration-500">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-6">
              <Card className="overflow-hidden shadow-lg border-slate-200">
                <CardHeader className="bg-slate-50/50 border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapIcon className="h-5 w-5 text-primary" />
                    Editor Spasial Desa
                  </CardTitle>
                  <CardDescription>Gunakan alat poligon di sebelah kiri peta untuk menggambar batas wilayah desa.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 relative">
                   <MapEditor 
                    onDrawCreated={(data: any) => {
                      setVillageFormData({
                        ...villageFormData,
                        boundary: data.boundary,
                        location: data.center
                      });
                      toast({ title: "Poligon Terdeteksi", description: "Batas wilayah desa telah terekam." });
                    }}
                   />
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader><CardTitle className="text-lg">Desa Terdaftar</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader><TableRow><TableHead>Nama Desa</TableHead><TableHead>Provinsi</TableHead><TableHead className="text-right">Populasi</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {isVillagesLoading ? <TableRow><TableCell colSpan={4} className="text-center py-10">Memuat...</TableCell></TableRow> : villages?.map((v: any) => (
                        <TableRow key={v.id}>
                          <TableCell className="font-bold">{v.name}</TableCell>
                          <TableCell>{v.province || '-'}</TableCell>
                          <TableCell className="text-right">{v.population?.toLocaleString() || 0}</TableCell>
                          <TableCell className="text-right">
                            <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete('villages', v.id)}><Trash2 className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <Card className="shadow-xl border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">Data Atribut Desa</CardTitle>
                  <CardDescription>Lengkapi informasi administratif setelah menggambar poligon.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">Nama Desa</Label>
                    <Input 
                      className="bg-white" 
                      placeholder="Contoh: Desa Sukamaju" 
                      value={villageFormData.name} 
                      onChange={e => setVillageFormData({...villageFormData, name: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">Provinsi</Label>
                    <Input 
                      className="bg-white" 
                      value={villageFormData.province} 
                      onChange={e => setVillageFormData({...villageFormData, province: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">Estimasi Populasi</Label>
                    <Input 
                      type="number" 
                      className="bg-white" 
                      value={villageFormData.population} 
                      onChange={e => setVillageFormData({...villageFormData, population: parseInt(e.target.value)})} 
                    />
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-slate-200 text-[10px] space-y-1">
                    <p className="font-bold text-slate-500 uppercase tracking-widest">Status Spasial</p>
                    <div className="flex justify-between items-center">
                      <span>Titik Pusat:</span>
                      <span className="font-mono">{villageFormData.location.lat.toFixed(4)}, {villageFormData.location.lng.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Titik Poligon:</span>
                      <span className={`font-mono font-bold ${villageFormData.boundary.length > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {villageFormData.boundary.length} Titik
                      </span>
                    </div>
                  </div>
                  <Button className="w-full h-12 shadow-lg" onClick={handleVillageSave} disabled={isSubmitting || villageFormData.boundary.length === 0}>
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                    Simpan Data Desa
                  </Button>
                </CardContent>
              </Card>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-800">
                <Info className="h-5 w-5 shrink-0" />
                <p className="text-xs leading-relaxed">
                  <b>Tips:</b> Klik ikon poligon pada toolbar peta, kemudian klik pada peta untuk membuat titik-titik batas desa. Klik titik pertama kembali untuk menutup poligon.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
