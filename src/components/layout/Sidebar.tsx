import {
  LayoutDashboard,
  Building,
  Users,
  ShoppingCart,
  PackageOpen,
  DollarSign,
  CalendarRange,
  FileText,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(isOpen);

  useEffect(() => {
    setShowSidebar(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    setShowSidebar(false);
  };

  // Conditionally render based on screen size and open state
  if (isMobile && !showSidebar) {
    return null;
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      permission: "dashboard",
    },
    {
      name: "Escolas",
      href: "/schools",
      icon: Building,
      permission: "master", // Only master users can access
    },
    {
      name: "Usuários",
      href: "/users",
      icon: Users,
      permission: "master", // Only master users can access
    },
    {
      name: "Produtos",
      href: "/products",
      icon: ShoppingCart,
      permission: "products",
    },
    {
      name: "Estoque",
      href: "/inventory",
      icon: PackageOpen,
      permission: "inventory",
    },
    {
      name: "Financeiro",
      href: "/financial",
      icon: DollarSign,
      permission: "financial",
    },
    {
      name: "Planejamento",
      href: "/planning",
      icon: CalendarRange,
      permission: "planning",
    },
    {
      name: "Contratos",
      href: "/contracts",
      icon: FileText,
      permission: "contracts",
    },
    {
      name: "Configurações",
      href: "/settings",
      icon: Settings,
      permission: "settings",
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col gap-4 py-4 border-r bg-secondary text-secondary-foreground w-60",
        isMobile ? "fixed inset-y-0 left-0 z-50" : "",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "transition-transform duration-300 ease-in-out"
      )}
    >
      <div className="px-4">
        <span className="font-bold text-lg">SIGRE</span>
      </div>
      <nav className="flex flex-col gap-1 px-2">
        {navigation.map((item) => {
          if (item.permission === "master" && user?.role !== "master") {
            return null;
          }

          if (
            user &&
            !user.permissions.find((p) => p.name === item.permission)?.hasAccess
          ) {
            return null;
          }

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium hover:bg-secondary/50",
                  isActive ? "bg-secondary/50" : "transparent"
                )
              }
              onClick={isMobile ? handleClose : undefined}
            >
              <item.icon className="size-4" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
