
'use client';

import { useState } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus, Trash2, Edit2, Save, Search, HelpCircle,
  Settings, Layers, Filter, Search as SearchIcon, 
  MapPin, Navigation, Layout, Camera, Image,
  Shield, Database, Globe, Compass
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const TOOL_ICONS = [
  'Layers', 'Filter', 'Search', 'Settings', 'Shield', 'MapPin', 
  'Navigation', 'Layout', 'Camera', 'Image', 'Database', 'Globe', 'Compass'
];

const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return <HelpCircle className={className} />;
  return <IconComponent className={className} />;
};

export default function AlatPetaPage() {
  const db = useFirestore();
  const menuQuery = query(
    collection(db, 'menus'), 
    where('position', 'in', ['left', 'header']),
    orderBy('order', 'asc')
  );
  const { data: tools, isLoading } = useCollection(menuQuery);
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    icon: 'Layers',
    href: '#',
    order: 0,
    position: 'left' as 'left' | 'header'
  });
  const [iconSearch, setIconSearch] = useState('');

  const filteredIcons = TOOL_ICONS.filter(icon => 
    icon.toLowerCase().includes(iconSearch.toLowerCase())
  );

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    const collRef = collection(db, 'menus');
    const data = { ...formData, order: Number(formData.order) };

    if (isEditing) {
      const docRef = doc(db, 'menus', isEditing);
      updateDoc(docRef, data).catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: data }));
      });
      setIsEditing(null);
    } else {
      addDoc(collRef, data).catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: collRef.path, operation: 'create', requestResourceData: data }));
      });
    }

    setFormData({ label: '', icon: 'Layers', href: '#', order: (tools?.length || 0) + 1, position: 'left' });
    toast({ title: "Berhasil", description: "Alat peta telah diperbarui." });
  };

  const handleDelete = async (id: string) => {
    const docRef = doc(db, 'menus', id);
    deleteDoc(docRef).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'delete' }));
    });
    toast({ title: "Berhasil", description: "Alat peta dihapus." });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Alat & Header Peta</h1>
        <p className="text-muted-foreground">Kelola alat bantu di sisi kiri dan tombol informasi di header peta.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Alat' : 'Tambah Alat'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAction} className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Alat / Label</Label>
                <Input value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} placeholder="Misal: Lapisan" required />
              </div>
              
              <div className="space-y-2">
                <Label>Ikon Alat</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start gap-2 h-10">
                      <DynamicIcon name={formData.icon} className="h-4 w-4 text-primary" />
                      <span>{formData.icon}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2" align="start">
                    <div className="grid grid-cols-4 gap-1 p-1">
                      {filteredIcons.map(icon => (
                        <Button key={icon} type="button" variant="ghost" size="icon" onClick={() => setFormData({...formData, icon})}>
                          <DynamicIcon name={icon} className="h-4 w-4" />
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Posisi</Label>
                <Select value={formData.position} onValueChange={(v: any) => setFormData({...formData, position: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Sisi Kiri (Alat Peta)</SelectItem>
                    <SelectItem value="header">Header Atas (Informasi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Urutan</Label>
                <Input type="number" value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value)})} required />
              </div>

              <Button type="submit" className="w-full">
                {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                Simpan
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>Daftar Alat Peta Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Posisi</TableHead>
                  <TableHead className="text-center">Ikon</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-10">Memuat data...</TableCell></TableRow>
                ) : tools.map((tool: any) => (
                  <TableRow key={tool.id}>
                    <TableCell className="font-medium">{tool.label}</TableCell>
                    <TableCell>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${tool.position === 'left' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        {tool.position === 'left' ? 'Kiri' : 'Header'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <DynamicIcon name={tool.icon} className="h-5 w-5 mx-auto text-slate-500" />
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => { setIsEditing(tool.id); setFormData(tool); }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(tool.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
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
