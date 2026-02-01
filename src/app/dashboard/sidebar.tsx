'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Map,
  FileText,
  Lightbulb,
  Settings,
  LogOut,
  Mountain,
  Shield,
  User,
  LayoutGrid,
  Building2,
  Landmark,
  BarChart,
} from 'lucide-react';
import { UserNav } from './user-nav';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['superadmin', 'admin', 'operator', 'village_staff'] },
  { href: '/dashboard/villages', label: 'Village Data', icon: Map, roles: ['superadmin', 'admin', 'operator'] },
  { href: '/dashboard/reports', label: 'Pelaporan', icon: FileText, roles: ['superadmin', 'admin', 'operator', 'village_staff'] },
  // { href: '/dashboard/ai-suggestions', label: 'AI Suggestions', icon: Lightbulb, roles: ['superadmin', 'admin', 'operator'] },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['superadmin'] },
];

const devNavItems = [
    { href: '/dashboarddev', label: 'Peta Interaktif', icon: Shield, roles: ['superadmin', 'admin', 'operator', 'village_staff'] },
    { href: '/dashboarddev/profil', label: 'Profil', icon: User, roles: ['superadmin', 'admin', 'operator', 'village_staff'] },
    { href: '/dashboarddev/tata-ruang', label: 'Tata Ruang', icon: LayoutGrid, roles: ['superadmin', 'admin', 'operator', 'village_staff'] },
    { href: '/dashboarddev/pembangunan', label: 'Pembangunan', icon: Building2, roles: ['superadmin', 'admin', 'operator', 'village_staff'] },
    { href: '/dashboarddev/dana-desa', label: 'Dana Desa', icon: Landmark, roles: ['superadmin', 'admin', 'operator', 'village_staff'] },
    { href: '/dashboarddev/indeks', label: 'Indeks', icon: BarChart, roles: ['superadmin', 'admin', 'operator', 'village_staff'] },
];


export function DashboardSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarHeader className="border-b border-sidebar-border">
          <Link href="/dashboard" className="block">
             <div className="inline-flex items-center justify-center gap-2">
              <Mountain className="h-8 w-8 text-primary" />
              <span className="font-headline text-2xl font-bold text-sidebar-foreground">
                DL
              </span>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarMenu className="p-2">
          {navItems.map((item) =>
            user && item.roles.includes(user.role) ? (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : null
          )}
        </SidebarMenu>
        <SidebarSeparator />
        <div className="px-4 pt-2 pb-1 text-xs font-semibold text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
          Modul Publik
        </div>
        <SidebarMenu className="p-2">
          {devNavItems.map((item) =>
            user && item.roles.includes(user.role) ? (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : null
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t border-sidebar-border">
          <SidebarMenuButton onClick={logout} tooltip="Logout">
              <LogOut />
              <span>Logout</span>
          </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
