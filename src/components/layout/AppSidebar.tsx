
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  GraduationCap, 
  Settings, 
  Package, 
  Archive, 
  ClipboardList, 
  FileText, 
  DollarSign, 
  Calculator,
  History,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  permission: string;
}

const navigationItems: NavItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: Home, 
    permission: 'dashboard' 
  },
  { 
    name: 'Escolas', 
    href: '/schools', 
    icon: GraduationCap, 
    permission: 'schools' 
  },
  { 
    name: 'Usuários', 
    href: '/users', 
    icon: Users, 
    permission: 'users' 
  },
  { 
    name: 'Produtos', 
    href: '/products', 
    icon: Package, 
    permission: 'products' 
  },
  { 
    name: 'Estoque', 
    href: '/inventory', 
    icon: Archive, 
    permission: 'inventory' 
  },
  { 
    name: 'Planejamento', 
    href: '/planning', 
    icon: ClipboardList, 
    permission: 'planning' 
  },
  { 
    name: 'Contratos', 
    href: '/contracts', 
    icon: FileText, 
    permission: 'contracts' 
  },
  { 
    name: 'Financeiro', 
    href: '/financial', 
    icon: DollarSign, 
    permission: 'financial' 
  },
  { 
    name: 'Contabilidade', 
    href: '/accounting', 
    icon: Calculator, 
    permission: 'accounting' 
  },
  { 
    name: 'Histórico', 
    href: '/transaction-history', 
    icon: History, 
    permission: 'financial' 
  },
  { 
    name: 'Configurações', 
    href: '/settings', 
    icon: Settings, 
    permission: 'settings' 
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { hasPermission } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <h2 className="text-lg font-semibold">SIGRE</h2>
        <p className="text-sm text-sidebar-foreground/70">Sistema Escolar</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                if (!hasPermission(item.permission)) {
                  return null;
                }

                const isActive = location.pathname === item.href;

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.href}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
