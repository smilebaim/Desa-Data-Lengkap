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
  Search, HelpCircle, Palette, Globe, Monitor, Type, Menu
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
      toast({ title: "Berhasil", description: "Identitas aplikasi telah diperbarui secara global." });
    } catch (e) {
      toast({ title: "Galat", description: "Gagal menyimpan konfigurasi branding.", variant: "destructive" });
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
      <div className="flex flex-col gap-1 text-left">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Identitas & Branding App</h1>
        <p className="text-muted-foreground">Konfigurasikan logo, nama, dan slogan aplikasi secara global.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-5 space-y-6 text-left">
          <Card className="shadow-xl border-primary/10 overflow-hidden">
            <CardHeader className="bg-slate-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Branding Global
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
                <Label className="text-xs font-bold uppercase text-slate-500">Tipe Logo Utama</Label>
                <Tabs value={formData.logoType} onValueChange={(v: any) => setFormData({...formData, logoType: v})}>
                  <TabsList className="grid grid-cols-2 h-11">
                    <TabsTrigger value="icon" className="gap-2"><Type className="h-4 w-4" /> Ikon</TabsTrigger>
                    <TabsTrigger value="image" className="gap-2"><ImageIcon className="h-4 w-4" /> Gambar</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="icon" className="pt-4 space-y-3">
                    <Label className="text-[10px] text-slate-400 font-bold uppercase">Pilih Ikon Lucide</Label>
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
                    <Label className="text-[10px] text-slate-400 font-bold uppercase">URL Gambar Logo (PNG/SVG)</Label>
                    <Input placeholder="https://..." value={formData.logoUrl} onChange={e => setFormData({...formData, logoUrl: e.target.value})} className="h-12" />
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
            <CardHeader className="bg-white/5 border-b border-white/10 px-8 py-6 text-left">
              <CardTitle className="text-white flex items-center gap-3 text-base">
                <Monitor className="h-5 w-5 text-primary" />
                Pratinjau Visual (Live)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-slate-950/20">
               <div className="relative h-[400px] w-full flex items-center justify-center p-12">
                  <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/setting/1200/800')] bg-cover bg-center opacity-30 blur-[2px]" />
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 to-slate-950" />
                  
                  <div className="relative z-10 w-full max-w-md bg-slate-950/40 backdrop-blur-2xl border border-white/10 p-1.5 rounded-full flex items-center justify-between gap-4">
                     <div className="flex items-center gap-3 pl-3">
                        <div className="h-9 w-9 bg-primary rounded-full flex items-center justify-center shadow-lg">
                           {formData.logoType === 'icon' ? (
                             <DynamicIcon name={formData.logoIcon} className="h-4 w-4 text-white" />
                           ) : formData.logoUrl ? (
                             <img src={formData.logoUrl} alt="Logo" className="h-5 w-5 object-contain" />
                           ) : (
                             <Shield className="h-4 w-4 text-white" />
                           )}
                        </div>
                        <div className="text-left">
                           <h2 className="text-[11px] font-black uppercase tracking-tight text-white leading-none">{formData.appName}</h2>
                           <p className="text-[7px] text-primary/80 font-bold uppercase tracking-widest mt-1">{formData.appSlogan}</p>
                        </div>
                     </div>
                     <div className="h-8 w-8 bg-white/10 rounded-full flex items-center justify-center mr-1">
                        <Menu className="h-3.5 w-3.5 text-white/60" />
                     </div>
                  </div>

                  <div className="mt-16 w-full max-w-xs space-y-4">
                    <Separator className="bg-white/10" />
                    <div className="flex items-center justify-between text-[10px] text-white/30 uppercase font-black tracking-widest">
                       <span>Target Perangkat:</span>
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
