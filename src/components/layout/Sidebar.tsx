import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  School,
  Users,
  Settings,
  Package,
  ChevronLeft,
  ChevronRight,
  BoxIcon,
  FileText,
  CircleDollarSign,
  ClipboardList,
} from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

const sidebarWidth = 240;
const sidebarCollapsedWidth = 70;

export function Sidebar() {
  const location = useLocation();
  const { isMobile } = useMobile();
  const [collapsed, setCollapsed] = useState(isMobile);
  const { user } = useAuth();

  const menuItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: <BoxIcon className="h-5 w-5" />,
      path: "/dashboard",
      permission: "dashboard",
    },
    {
      id: "schools",
      name: "Escolas",
      icon: <School className="h-5 w-5" />,
      path: "/schools",
      permission: "schools",
    },
    {
      id: "users",
      name: "Usuários",
      icon: <Users className="h-5 w-5" />,
      path: "/users",
      permission: "users",
    },
    {
      id: "products",
      name: "Produtos",
      icon: <Package className="h-5 w-5" />,
      path: "/products",
      permission: "products",
    },
    {
      id: "inventory",
      name: "Estoque",
      icon: <BoxIcon className="h-5 w-5" />,
      path: "/inventory",
      permission: "inventory",
    },
    {
      id: "financial",
      name: "Financeiro",
      icon: <CircleDollarSign className="h-5 w-5" />,
      path: "/financial",
      permission: "financial",
    },
    {
      id: "planning",
      name: "Planejamento",
      icon: <ClipboardList className="h-5 w-5" />,
      path: "/planning",
      permission: "planning",
    },
    {
      id: "contracts",
      name: "Contratos",
      icon: <FileText className="h-5 w-5" />,
      path: "/contracts",
      permission: "contracts",
    },
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-secondary border-r",
        collapsed ? "w-[70px]" : "w-[240px]",
        "transition-all duration-300 ease-in-out",
        "md:block hidden"
      )}
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <span className="font-bold text-xl">
            {user?.schoolId ? "Painel Escolar" : "Painel Administrativo"}
          </span>
        )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
      <div className="flex-1 space-y-1">
        {menuItems.map((item) => {
          if (user?.role === "master" || user?.permissions.some((p) => p.name === item.permission && p.hasAccess)) {
            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-md hover:bg-secondary/50",
                  location.pathname === item.path ? "bg-secondary/50" : ""
                )}
              >
                <div className="flex items-center">
                  {item.icon}
                  {!collapsed && <span className="ml-2">{item.name}</span>}
                </div>
              </Link>
            );
          }
          return null;
        })}
      </div>
      <div className="p-4">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
