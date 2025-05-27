
import { useState } from 'react';
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
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  permission: string;
  children?: NavItem[];
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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { hasPermission } = useAuth();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const toggleSubMenu = (name: string) => {
    setOpenSubMenu(openSubMenu === name ? null : name);
  };

  const renderNavItems = (items: NavItem[], isSubMenu = false) => {
    return items.map((item) => {
      if (!hasPermission(item.permission)) {
        return null;
      }

      const isActive = location.pathname.startsWith(item.href);
      const isSubMenuActive = openSubMenu === item.name;

      if (item.children) {
        return (
          <li key={item.name}>
            <button
              onClick={() => toggleSubMenu(item.name)}
              className={`flex items-center justify-between w-full p-2 text-sm font-medium transition duration-200 rounded-md hover:bg-gray-700 hover:text-white group ${
                isActive || isSubMenuActive ? 'text-white bg-gray-800' : 'text-gray-400'
              }`}
            >
              <div className="flex items-center">
                <item.icon className="w-4 h-4 mr-2" />
                {item.name}
              </div>
              {isSubMenuActive ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            {isSubMenuActive && (
              <ul className="pl-4">
                {renderNavItems(item.children, true)}
              </ul>
            )}
          </li>
        );
      }

      return (
        <li key={item.name}>
          <Link
            to={item.href}
            onClick={onClose}
            className={`flex items-center p-2 text-sm font-medium transition duration-200 rounded-md hover:bg-gray-700 hover:text-white group ${
              isActive ? 'text-white bg-gray-800' : 'text-gray-400'
            }`}
          >
            <item.icon className="w-4 h-4 mr-2" />
            {item.name}
          </Link>
        </li>
      );
    });
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-transform duration-300 ease-in-out w-64 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:z-auto`}
      >
        <div className="flex items-center justify-between h-16 border-b border-gray-800 px-4">
          <span className="text-lg font-semibold">Controle Escolar</span>
          <button
            className="md:hidden text-gray-500 hover:text-gray-300 focus:outline-none"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="py-4 px-4">
          <ul className="space-y-1">
            {renderNavItems(navigationItems)}
          </ul>
        </nav>
      </div>
    </>
  );
}
