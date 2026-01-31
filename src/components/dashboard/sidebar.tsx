'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
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
} from 'lucide-react';
import { UserNav } from './user-nav';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['superadmin', 'admin', 'operator', 'village_staff'] },
  { href: '/dashboard/villages', label: 'Village Data', icon: Map, roles: ['superadmin', 'admin', 'operator'] },
  { href: '/dashboard/reports', label: 'Pelaporan', icon: FileText, roles: ['superadmin', 'admin', 'operator', 'village_staff'] },
  { href: '/dashboard/ai-suggestions', label: 'AI Suggestions', icon: Lightbulb, roles: ['superadmin', 'admin', 'operator'] },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['superadmin'] },
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
                DDC
              </span>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarMenu className="p-2">
          {navItems.map((item) =>
            user && item.roles.includes(user.role) ? (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
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
