import {
  LayoutDashboard,
  Settings,
  ShoppingBag,
  Users,
  School2,
  FileText,
  BarChart4,
  Coins
} from "lucide-react";
import { NavLink } from "@/components/ui/nav-link";
import { useAuth } from "@/contexts/AuthContext";

export function Sidebar() {
  const { user } = useAuth();

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      name: "Escolas",
      icon: School2,
      href: "/schools",
      permission: "view_schools"
    },
    {
      name: "Usuários",
      icon: Users,
      href: "/users",
      permission: "view_users"
    },
    {
      name: "Produtos",
      icon: ShoppingBag,
      href: "/products",
      permission: "view_products"
    },
    {
      name: "Estoque",
      icon: BarChart4,
      href: "/inventory",
      permission: "view_inventory"
    },
    {
      name: "Financeiro",
      icon: Coins,
      href: "/financial",
      permission: "view_financial"
    },
    {
      name: "Contratos",
      icon: FileText, // or another suitable icon
      href: "/contracts",
      permission: "view_contracts" // if you have a permission system
    },
    {
      name: "Configurações",
      icon: Settings,
      href: "/settings",
    },
  ];

  return (
    <div className="sidebar bg-sidebar-background w-64 flex-none h-full border-r border-sidebar-border">
      <div className="p-4">
        <h1 className="font-bold text-2xl text-sidebar-primary">Painel Admin</h1>
      </div>
      <ul className="space-y-2 p-4">
        {menuItems.map((item) => {
          if (item.permission && user && user.role !== "master" && !user.permissions.some(p => p.name === item.permission && p.hasAccess)) {
            return null;
          }
          return (
            <li key={item.name}>
              <NavLink href={item.href} icon={item.icon}>
                {item.name}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
