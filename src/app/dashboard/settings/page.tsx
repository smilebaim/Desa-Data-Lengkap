
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore, useDoc } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { 
  Save, Loader2, Sparkles, Shield, Image as ImageIcon, 
  Search, HelpCircle, Palette, Globe, Monitor, Type
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ICON_OPTIONS = [
  'Shield', 'Landmark', 'Map', 'Globe', 'Navigation', 'Info', 'Mountain', 
  'Home', 'Flag', 'Layers', 'Activity', 'Zap', 'Compass', 'TreePine'
];

const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return <HelpCircle className={className} />;
  return <IconComponent className={className} />;
};

export default function AppSettingsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const settingsRef = useMemo(() => doc(db, 'settings', 'global'), [db]);
  const { data: settings, isLoading } = useDoc(settingsRef);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  const [formData, setFormData] = useState({
    appName: 'Desa Lengkap',
    appSlogan: 'Informasi Spasial Nasional',
    logoType: 'icon' as 'icon' | 'image',
    logoIcon: 'Shield',
    logoUrl: ''
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        appName: settings.appName || 'Desa Lengkap',
        appSlogan: settings.appSlogan || 'Informasi Spasial Nasional',
        logoType: settings.logoType || 'icon',
        logoIcon: settings.logoIcon || 'Shield',
        logoUrl: settings.logoUrl || ''
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await setDoc(settingsRef, formData, { merge: true });
      toast({ title: "Berhasil", description: "Pengaturan identitas telah diperbarui global." });
    } catch (e) {
      toast({ title: "Galat", description: "Gagal menyimpan pengaturan.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredIcons = ICON_OPTIONS.filter(icon => 
    icon.toLowerCase().includes(iconSearch.toLowerCase())
  );

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pengaturan Identitas App</h1>
        <p className="text-muted-foreground">Kelola bagaimana publik melihat nama, slogan, dan logo aplikasi Anda.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-xl border-primary/10 overflow-hidden">
            <CardHeader className="bg-slate-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Konfigurasi Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Nama Aplikasi</Label>
                <Input value={formData.appName} onChange={e => setFormData({...formData, appName: e.target.value})} className="h-11" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Slogan / Tagline</Label>
                <Input value={formData.appSlogan} onChange={e => setFormData({...formData, appSlogan: e.target.value})} className="h-11" />
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase text-slate-500">Tipe Logo</Label>
                <Tabs value={formData.logoType} onValueChange={(v: any) => setFormData({...formData, logoType: v})}>
                  <TabsList className="grid grid-cols-2 h-11">
                    <TabsTrigger value="icon" className="gap-2"><Type className="h-4 w-4" /> Ikon Lucide</TabsTrigger>
                    <TabsTrigger value="image" className="gap-2"><ImageIcon className="h-4 w-4" /> Gambar URL</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="icon" className="pt-4 space-y-3">
                    <Label className="text-[10px] text-slate-400 font-bold uppercase">Pilih Ikon</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between h-12">
                          <div className="flex items-center gap-3">
                            <DynamicIcon name={formData.logoIcon} className="h-5 w-5 text-primary" />
                            <span className="font-medium">{formData.logoIcon}</span>
                          </div>
                          <Search className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-0" align="start">
                        <div className="p-3 border-b"><Input placeholder="Cari ikon..." value={iconSearch} onChange={e => setIconSearch(e.target.value)} /></div>
                        <div className="p-2 grid grid-cols-5 gap-1 max-h-60 overflow-y-auto">
                          {filteredIcons.map(icon => (
                            <Button key={icon} variant="ghost" size="icon" onClick={() => setFormData({...formData, logoIcon: icon})} className={formData.logoIcon === icon ? 'bg-primary/10 text-primary' : ''}>
                              <DynamicIcon name={icon} className="h-5 w-5" />
                            </Button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TabsContent>

                  <TabsContent value="image" className="pt-4 space-y-3">
                    <Label className="text-[10px] text-slate-400 font-bold uppercase">URL Gambar Logo</Label>
                    <Input placeholder="https://..." value={formData.logoUrl} onChange={e => setFormData({...formData, logoUrl: e.target.value})} className="h-12" />
                    <p className="text-[10px] text-muted-foreground italic">Gunakan URL gambar PNG atau SVG dengan latar transparan.</p>
                  </TabsContent>
                </Tabs>
              </div>

              <Button onClick={handleSave} className="w-full h-12 shadow-lg" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                Terapkan Perubahan Global
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card className="shadow-2xl border-none bg-slate-900 overflow-hidden rounded-[2rem] sticky top-6">
            <CardHeader className="bg-white/5 border-b border-white/10 px-8 py-6">
              <CardTitle className="text-white flex items-center gap-3 text-base">
                <Monitor className="h-5 w-5 text-primary" />
                Pratinjau Visual (Halaman Utama)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-slate-950/20">
               <div className="relative h-[400px] w-full flex items-center justify-center p-12">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=2013')] bg-cover bg-center opacity-30 blur-[2px]" />
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 to-slate-950" />
                  
                  {/* Mockup Header */}
                  <div className="relative z-10 w-full max-w-md bg-slate-950/40 backdrop-blur-3xl border border-white/10 p-4 rounded-full flex items-center justify-between gap-4">
                     <div className="flex items-center gap-3 pl-2">
                        <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                           {formData.logoType === 'icon' ? (
                             <DynamicIcon name={formData.logoIcon} className="h-4 w-4 text-white" />
                           ) : formData.logoUrl ? (
                             <img src={formData.logoUrl} alt="Logo" className="h-5 w-5 object-contain" />
                           ) : (
                             <Shield className="h-4 w-4 text-white" />
                           )}
                        </div>
                        <div className="text-left">
                           <h2 className="text-xs font-black uppercase tracking-tight text-white leading-none">{formData.appName}</h2>
                           <p className="text-[8px] text-primary/80 font-bold uppercase tracking-widest mt-1">{formData.appSlogan}</p>
                        </div>
                     </div>
                     <div className="h-8 w-8 bg-white/10 rounded-full flex items-center justify-center mr-1">
                        <LucideIcons.Menu className="h-4 w-4 text-white/60" />
                     </div>
                  </div>

                  <div className="mt-16 w-full max-w-xs space-y-4">
                    <Separator className="bg-white/5" />
                    <div className="flex items-center justify-between text-[10px] text-white/30 uppercase font-black tracking-widest">
                       <span>Device Target:</span>
                       <div className="flex gap-2">
                          <Monitor className="h-3 w-3" />
                          <Globe className="h-3 w-3" />
                       </div>
                    </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
