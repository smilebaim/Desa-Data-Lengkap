
'use client';

import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  LogOut, LayoutDashboard, Menu as MenuIcon, Shield, MousePointer2, 
  Loader2, Map as MapIcon, BarChart3, Landmark, FileText, X, Settings
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { href: '/dashboard', label: 'Ringkasan', icon: LayoutDashboard },
    { href: '/dashboard/villages', label: 'Manajemen Desa', icon: Landmark },
    { href: '/dashboard/pages', label: 'Manajemen Halaman', icon: FileText },
    { href: '/dashboard/map-tools', label: 'Editor Spasial', icon: MapIcon },
    { href: '/dashboard/menus', label: 'Navigasi Publik', icon: MenuIcon },
    { href: '/dashboard/visualizations', label: 'Statistik & Data', icon: BarChart3 },
    { href: '/dashboard/settings', label: 'Pengaturan App', icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3 bg-slate-950/50">
        <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="text-left">
          <h2 className="font-bold text-sm tracking-tight text-white">Sistem Informasi Desa</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Admin Panel</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-4 text-left">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-bold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : 'group-hover:text-primary transition-colors'}`} />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950/30 space-y-3">
        <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/50 rounded-lg mb-4 text-left">
          <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-primary capitalize">
            {profile?.name?.[0] || user.email?.[0] || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{profile?.name || 'Administrator'}</p>
            <p className="text-[9px] text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
        
        <Link href="/" className="flex items-center gap-3 px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors">
          <MousePointer2 className="h-4 w-4" />
          Buka Peta Publik
        </Link>
        <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-xl h-10" onClick={handleLogout}>
          <LogOut className="mr-3 h-4 w-4" />
          Keluar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 shadow-xl">
        <SidebarContent />
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-white text-sm uppercase tracking-widest">SID Admin</span>
          </div>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <MenuIcon className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 border-none">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>
        <main className="flex-1 overflow-auto bg-slate-50 p-6 md:p-10">
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
