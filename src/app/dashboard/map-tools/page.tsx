'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Zap, Flame, AlertTriangle, Radio
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
  const menuQuery = query(collection(db, 'menus'), orderBy('order', 'asc'));
  const { data: allMenus, isLoading } = useCollection(menuQuery);
  const { toast } = useToast();

  const tools = useMemo(() => 
    (allMenus || []).filter((m: any) => m.position === 'left'), 
    [allMenus]
  );

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  const [formData, setFormData] = useState({
    label: '',
    icon: 'Layers',
    href: '#',
    order: 0,
    position: 'left' as const
  });

  const filteredIcons = TOOL_ICONS.filter(icon => 
    icon.toLowerCase().includes(iconSearch.toLowerCase())
  );

  const resetForm = () => {
    setIsEditing(null);
    setFormData({ 
        label: '', 
        icon: 'Layers', 
        href: '#', 
        order: (tools?.length || 0) + 1, 
        position: 'left' 
    });
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
          toast({ title: "Berhasil", description: "Alat peta telah diperbarui." });
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
          toast({ title: "Berhasil", description: "Alat peta baru telah ditambahkan." });
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
        toast({ title: "Berhasil", description: "Alat telah dihapus." });
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
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Alat Samping Peta</h1>
        <p className="text-muted-foreground">Konfigurasi panel alat geospasial yang muncul di sisi kiri peta.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        <Card className="lg:col-span-4 shadow-sm border-slate-200 sticky top-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {isEditing ? <Edit2 className="h-5 w-5 text-accent" /> : <Plus className="h-5 w-5 text-accent" />}
              {isEditing ? 'Edit Alat' : 'Tambah Alat'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAction} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Label Alat</Label>
                <Input value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} placeholder="Misal: Lapisan" required />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Pilih Ikon</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between gap-2 h-11 border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-accent/10 rounded-lg">
                          <DynamicIcon name={formData.icon} className="h-4 w-4 text-accent" />
                        </div>
                        <span className="text-sm font-medium">{formData.icon}</span>
                      </div>
                      <Search className="h-4 w-4 text-slate-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0" align="start">
                    <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                      <Input 
                        placeholder="Cari ikon alat..." 
                        className="h-9 bg-white" 
                        value={iconSearch} 
                        onChange={e => setIconSearch(e.target.value)} 
                      />
                    </div>
                    <div className="p-2 grid grid-cols-5 gap-1 max-h-60 overflow-y-auto">
                      {filteredIcons.map(icon => (
                        <Button 
                          key={icon} 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setFormData({...formData, icon})}
                          className={`h-10 w-10 ${formData.icon === icon ? 'bg-accent/10 text-accent' : ''}`}
                        >
                          <DynamicIcon name={icon} className="h-4 w-4" />
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Urutan Tampil</Label>
                <Input type="number" value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value)})} required />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button type="submit" className="w-full h-11 bg-slate-900 hover:bg-slate-800 shadow-md text-white" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEditing ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />)}
                  {isEditing ? 'Simpan Perubahan' : 'Tambah Alat Baru'}
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
          <CardHeader>
            <CardTitle className="text-lg">Daftar Alat Peta Samping</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[300px]">Label & Ikon</TableHead>
                  <TableHead className="text-center">Urutan</TableHead>
                  <TableHead className="text-right pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-16"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-20" /></TableCell></TableRow>
                ) : tools.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-16 text-slate-400 italic">Belum ada alat peta yang dikonfigurasi di panel kiri.</TableCell></TableRow>
                ) : tools.map((tool: any) => (
                  <TableRow key={tool.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-accent/5 rounded-xl flex items-center justify-center text-accent border border-accent/10">
                          <DynamicIcon name={tool.icon} className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{tool.label}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-tight">Posisi: Samping Kiri</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-[10px] font-mono font-bold text-slate-600">
                        {tool.order}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-1 pr-6">
                      <Button size="icon" variant="ghost" className="h-9 w-9 hover:text-accent hover:bg-accent/5" onClick={() => { setIsEditing(tool.id); setFormData(tool); }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-9 w-9 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(tool.id)}>
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
