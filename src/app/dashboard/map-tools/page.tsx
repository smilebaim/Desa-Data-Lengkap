
'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus, Trash2, Edit2, Save, Search, HelpCircle, Loader2,
  Layers, MapPin, Map as MapIcon, Info, Hexagon, FileJson, 
  Ruler, Waypoints, Circle as CircleIcon, Square, Landmark, 
  Construction, TreePine, Droplets, Zap, ShieldAlert, Navigation,
  Home, Users, School, Hospital, Warehouse, Factory, ShoppingBag,
  Wind, Activity, Camera, Car, Bus, Bike, Waves, Flame,
  Coffee, Wifi, ParkingCircle, TrainFront, Ship, Plane, Fish, 
  Wheat, Sprout, Mountain, Cloud, Sun, Moon, Battery, Recycle,
  Store, Utensils, Bed, Heart, Stethoscope, Briefcase, GraduationCap,
  Music, Film, Baby, Banknote, BookOpen, Building2, ClipboardList,
  FlameKindling, Globe, HardHat, Library, Mail, Microscope, Radio,
  Satellite, Smartphone, Telescope, Tractor, Truck, Umbrella, Wallet
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const MapEditor = dynamic(() => import('./map-editor'), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400 border border-dashed">Memuat Peta Editor...</div>
});

const FEATURE_ICONS = [
  'MapPin', 'Landmark', 'Construction', 'TreePine', 'Droplets', 'Zap', 
  'ShieldAlert', 'Navigation', 'Info', 'Home', 'Users', 'School', 
  'Hospital', 'Warehouse', 'Factory', 'ShoppingBag', 'Trash2', 'Wind',
  'Activity', 'Camera', 'Car', 'Bus', 'Bike', 'Waves', 'Flame',
  'Coffee', 'Wifi', 'ParkingCircle', 'TrainFront', 'Ship', 'Plane',
  'Fish', 'Wheat', 'Sprout', 'Mountain', 'Cloud', 'Sun', 'Moon',
  'Battery', 'Recycle', 'Store', 'Utensils', 'Bed', 'Heart',
  'Stethoscope', 'Briefcase', 'GraduationCap', 'Music', 'Film',
  'Baby', 'Banknote', 'BookOpen', 'Building2', 'ClipboardList',
  'FlameKindling', 'Globe', 'HardHat', 'Library', 'Mail', 'Microscope',
  'Radio', 'Satellite', 'Smartphone', 'Telescope', 'Tractor', 'Truck',
  'Umbrella', 'Wallet'
];

const CATEGORIES = [
  { value: 'infrastructure', label: 'Infrastruktur' },
  { value: 'natural_resource', label: 'Sumber Daya Alam' },
  { value: 'public_facility', label: 'Fasilitas Umum' },
  { value: 'danger_zone', label: 'Area Rawan' },
  { value: 'village_boundary', label: 'Batas Wilayah' }
];

const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return <HelpCircle className={className} />;
  return <IconComponent className={className} />;
};

export default function SpasialManagementPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const villageQuery = useMemo(() => query(collection(db, 'villages'), orderBy('name', 'asc')), [db]);
  const { data: villages, isLoading: isVillagesLoading } = useCollection(villageQuery);

  const featureQuery = useMemo(() => query(collection(db, 'features'), orderBy('name', 'asc')), [db]);
  const { data: features, isLoading: isFeaturesLoading } = useCollection(featureQuery);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  
  const [currentFeature, setCurrentFeature] = useState<any>({
    name: '',
    type: '',
    category: 'infrastructure',
    icon: 'MapPin',
    geometry: null,
    properties: {}
  });

  const handleSaveFeature = async () => {
    if (!currentFeature.name || !currentFeature.geometry) {
      return toast({ title: "Galat", description: "Lengkapi nama dan gambar objek di peta.", variant: "destructive" });
    }
    
    setIsSubmitting(true);
    const isBoundary = currentFeature.category === 'village_boundary';
    const collName = isBoundary ? 'villages' : 'features';
    const collRef = collection(db, collName);
    
    const dataToSave = isBoundary 
      ? {
          name: currentFeature.name,
          province: 'Jawa Barat',
          population: 0,
          area: currentFeature.properties.area || 0,
          location: Array.isArray(currentFeature.geometry) ? currentFeature.geometry[0] : currentFeature.geometry,
          boundary: Array.isArray(currentFeature.geometry) ? currentFeature.geometry : []
        }
      : currentFeature;

    addDoc(collRef, dataToSave)
      .then(() => {
        toast({ title: "Berhasil", description: "Data spasial telah disinkronkan ke peta utama." });
        setCurrentFeature({ name: '', type: '', category: 'infrastructure', icon: 'MapPin', geometry: null, properties: {} });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: collRef.path, operation: 'create', requestResourceData: dataToSave }));
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleDelete = async (coll: string, id: string) => {
    const docRef = doc(db, coll, id);
    deleteDoc(docRef)
      .then(() => toast({ title: "Berhasil", description: "Objek dihapus dari database." }))
      .catch(async () => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'delete' })));
  };

  const filteredIcons = FEATURE_ICONS.filter(icon => 
    icon.toLowerCase().includes(iconSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manajemen Spasial Lanjutan</h1>
        <p className="text-muted-foreground">Gunakan alat gambar di peta untuk mendefinisikan aset, jalan, dan batas wilayah desa.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-lg border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg">Atribut Objek</CardTitle>
              <CardDescription>Detail teknis untuk objek yang akan disimpan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Nama Objek</Label>
                <Input 
                  placeholder="Misal: Jembatan Ciujung" 
                  value={currentFeature.name}
                  onChange={e => setCurrentFeature({...currentFeature, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Kategori Layer</Label>
                <Select 
                  value={currentFeature.category} 
                  onValueChange={(v) => setCurrentFeature({...currentFeature, category: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Ikon Penanda</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between h-11">
                      <div className="flex items-center gap-3">
                        <DynamicIcon name={currentFeature.icon} className="h-4 w-4 text-primary" />
                        <span className="text-sm">{currentFeature.icon}</span>
                      </div>
                      <Search className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0" align="start">
                    <div className="p-2 border-b"><Input placeholder="Cari ikon..." value={iconSearch} onChange={e => setIconSearch(e.target.value)} /></div>
                    <div className="p-1 grid grid-cols-5 gap-1 max-h-60 overflow-y-auto">
                      {filteredIcons.map(icon => (
                        <Button 
                          key={icon} 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setCurrentFeature({...currentFeature, icon})}
                          className={currentFeature.icon === icon ? 'bg-primary/10' : ''}
                        >
                          <DynamicIcon name={icon} className="h-4 w-4" />
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metadata Geometris</p>
                <div className="flex justify-between items-center text-xs">
                  <span>Tipe:</span>
                  <span className="font-bold text-primary uppercase">{currentFeature.type || 'Belum Digambar'}</span>
                </div>
                {currentFeature.properties.area && (
                  <div className="flex justify-between items-center text-xs">
                    <span>Luas:</span>
                    <span className="font-bold text-primary">{currentFeature.properties.area} km²</span>
                  </div>
                )}
                {currentFeature.properties.radius && (
                  <div className="flex justify-between items-center text-xs">
                    <span>Radius:</span>
                    <span className="font-bold text-primary">{Math.round(currentFeature.properties.radius)} m</span>
                  </div>
                )}
              </div>

              <Button 
                className="w-full h-12 shadow-lg" 
                disabled={isSubmitting || !currentFeature.geometry}
                onClick={handleSaveFeature}
              >
                {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                Simpan ke Database
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <Card className="overflow-hidden shadow-xl border-none">
            <CardHeader className="bg-white border-b flex flex-row items-center justify-between py-4 px-6">
              <CardTitle className="text-lg flex items-center gap-2">
                <Navigation className="h-5 w-5 text-primary" />
                Interaktif GIS Canvas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <MapEditor onDrawCreated={(data) => {
                 setCurrentFeature({
                   ...currentFeature,
                   type: data.type,
                   geometry: data.geometry,
                   properties: data.properties
                 });
                 toast({ title: "Geometri Berhasil Ditangkap", description: `Tipe ${data.type} terdeteksi.` });
               }} />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Katalog Data Spasial</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="all_features">
                <TabsList className="mx-6 mb-4">
                  <TabsTrigger value="all_features">Objek Tambahan</TabsTrigger>
                  <TabsTrigger value="villages">Batas Wilayah</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all_features">
                  <Table>
                    <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Kategori</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {isFeaturesLoading ? <TableRow><TableCell colSpan={3} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></TableCell></TableRow> : features?.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center py-10 text-slate-400">Tidak ada objek tambahan.</TableCell></TableRow> : features?.map((f: any) => (
                        <TableRow key={f.id}>
                          <TableCell className="font-bold flex items-center gap-2">
                            <DynamicIcon name={f.icon || 'MapPin'} className="h-4 w-4 text-primary" />
                            {f.name}
                          </TableCell>
                          <TableCell><span className="text-[10px] bg-slate-100 px-2 py-1 rounded-full font-bold uppercase">{f.category}</span></TableCell>
                          <TableCell className="text-right">
                            <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete('features', f.id)}><Trash2 className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="villages">
                   <Table>
                    <TableHeader><TableRow><TableHead>Nama Desa</TableHead><TableHead>Provinsi</TableHead><TableHead className="text-center">Luas</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {isVillagesLoading ? <TableRow><TableCell colSpan={4} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></TableCell></TableRow> : villages?.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-10 text-slate-400">Tidak ada data desa.</TableCell></TableRow> : villages?.map((v: any) => (
                        <TableRow key={v.id}>
                          <TableCell className="font-bold">{v.name}</TableCell>
                          <TableCell className="text-xs">{v.province}</TableCell>
                          <TableCell className="text-center text-xs font-mono">{v.area} km²</TableCell>
                          <TableCell className="text-right">
                            <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete('villages', v.id)}><Trash2 className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
