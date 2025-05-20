
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  X, 
  ChevronDown, 
  LayoutDashboard, 
  Package, 
  Store, 
  DollarSign, 
  ClipboardList, 
  FileText, 
  BookOpen, 
  Settings, 
  Building, 
  Users, 
  ShoppingCart, 
  Shield, 
  LogOut,
  School
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type SidebarProps = {
  className?: string;
};

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, currentSchool, logout } = useAuth();
  const location = useLocation();
  
  // Define the system modules with the new order
  const modules = [
    {
      id: "dashboard",
      name: "Painel",
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: "/dashboard",
      permission: "dashboard",
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
      icon: <Store className="h-5 w-5" />,
      path: "/inventory",
      permission: "inventory",
    },
    {
      id: "financial",
      name: "Financeiro",
      icon: <DollarSign className="h-5 w-5" />,
      path: "/financial",
      permission: "financial",
    },
    {
      id: "contracts",
      name: "Contratos",
      icon: <FileText className="h-5 w-5" />,
      path: "/contracts",
      permission: "contracts",
    },
    {
      id: "planning",
      name: "Planejamento",
      icon: <ClipboardList className="h-5 w-5" />,
      path: "/planning",
      permission: "planning",
    },
    {
      id: "contracts_old",
      name: "Contratos",
      icon: <FileText className="h-5 w-5" />,
      path: "/contracts_old",
      permission: "contracts_old",
    },
  ];

  // These routes are only visible to the master user - reordered
  const adminRoutes = [
    {
      id: "settings",
      name: "Configurações",
      icon: <Settings className="h-5 w-5" />,
      path: "/settings",
      permission: "settings",
    },
    {
      id: "accounting",
      name: "Contabilidade",
      icon: <BookOpen className="h-5 w-5" />,
      path: "/accounting",
      permission: "accounting",
    },
  ];

  // Function to check if user has permission for a module
  const hasPermission = (permission: string) => {
    if (!user) return false;
    if (user.role === "master") return true;
    return user.permissions.some(p => p.name === permission && p.hasAccess);
  };

  // Filter modules based on permissions
  const allowedModules = modules.filter(module => hasPermission(module.permission));
  const allowedAdminRoutes = adminRoutes.filter(route => hasPermission(route.permission));

  // Function to check if route is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Mobile sidebar
  const MobileSidebar = (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-[#012340]">
        <div className="flex flex-col h-full">
          <div className="px-6 py-4 border-b border-[#01356b]">
            <h2 className="text-lg font-semibold text-white">SIGRE</h2>
            {currentSchool && (
              <div className="flex items-center gap-2 mt-2 text-sm text-blue-300">
                <School className="h-4 w-4" />
                <p className="truncate">{currentSchool.name}</p>
              </div>
            )}
          </div>
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-8">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-blue-300">Módulos</h3>
                <nav className="space-y-4"> {/* Increased spacing between items */}
                  {allowedModules.map((module) => (
                    <Link
                      key={module.id}
                      to={module.path}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                        isActive(module.path)
                          ? "bg-[#01356b] text-white font-medium"
                          : "text-blue-100 hover:bg-[#01356b] hover:text-white"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      {module.icon}
                      <span>{module.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>
              {user?.role === "master" && allowedAdminRoutes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-blue-300">Administração</h3>
                  <nav className="space-y-4"> {/* Increased spacing between items */}
                    {allowedAdminRoutes.map((route) => (
                      <Link
                        key={route.id}
                        to={route.path}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                          isActive(route.path)
                            ? "bg-[#01356b] text-white font-medium"
                            : "text-blue-100 hover:bg-[#01356b] hover:text-white"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        {route.icon}
                        <span>{route.name}</span>
                      </Link>
                    ))}
                  </nav>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="px-6 py-4 border-t border-[#01356b]">
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-blue-300 truncate">{user?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="text-blue-100 hover:text-white hover:bg-[#01356b]"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  // Desktop sidebar
  const DesktopSidebar = (
    <div
      className={cn(
        "hidden md:flex flex-col h-full bg-[#012340] border-r border-[#01356b]",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className={cn(
        "flex h-14 items-center px-4 bg-[#01183a] border-b border-[#01356b]",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && <h2 className="text-lg font-semibold text-white">SIGRE</h2>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expandir" : "Recolher"}
          className="h-9 w-9 text-white hover:bg-[#01356b]"
        >
          {isCollapsed ? <ChevronDown className="h-5 w-5 rotate-90" /> : <ChevronDown className="h-5 w-5 -rotate-90" />}
        </Button>
      </div>
      
      <ScrollArea className="flex-1 py-4">
        <div className="space-y-8 px-3">
          <TooltipProvider delayDuration={0}>
            {currentSchool && !isCollapsed && (
              <div className="px-3 py-2 mb-4 flex items-center gap-2 rounded-md bg-[#01356b]/50">
                <School className="h-5 w-5 text-blue-300" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{currentSchool.name}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              {!isCollapsed && (
                <h3 className="px-4 text-xs font-medium text-blue-300 uppercase tracking-wider">
                  Módulos
                </h3>
              )}
              <nav className="space-y-4"> {/* Increased spacing between items */}
                {allowedModules.map((module) => (
                  <Tooltip key={module.id} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        to={module.path}
                        className={cn(
                          "flex items-center rounded-md px-3 py-2.5 text-sm transition-colors",
                          isActive(module.path)
                            ? "bg-[#01356b] text-white font-medium"
                            : "text-blue-100 hover:bg-[#01356b] hover:text-white",
                          isCollapsed ? "justify-center" : "gap-3"
                        )}
                      >
                        {module.icon}
                        {!isCollapsed && <span>{module.name}</span>}
                      </Link>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right">
                        {module.name}
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </nav>
            </div>
            
            {user?.role === "master" && allowedAdminRoutes.length > 0 && (
              <div className="space-y-2">
                {!isCollapsed && (
                  <h3 className="px-4 text-xs font-medium text-blue-300 uppercase tracking-wider mt-6">
                    Administração
                  </h3>
                )}
                <nav className="space-y-4"> {/* Increased spacing between items */}
                  {allowedAdminRoutes.map((route) => (
                    <Tooltip key={route.id} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Link
                          to={route.path}
                          className={cn(
                            "flex items-center rounded-md px-3 py-2.5 text-sm transition-colors",
                            isActive(route.path)
                              ? "bg-[#01356b] text-white font-medium"
                              : "text-blue-100 hover:bg-[#01356b] hover:text-white",
                            isCollapsed ? "justify-center" : "gap-3"
                          )}
                        >
                          {route.icon}
                          {!isCollapsed && <span>{route.name}</span>}
                        </Link>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right">
                          {route.name}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  ))}
                </nav>
              </div>
            )}
          </TooltipProvider>
        </div>
      </ScrollArea>
      
      <div className={cn(
        "border-t border-[#01356b] p-4", 
        isCollapsed && "flex flex-col items-center"
      )}>
        {currentSchool && !isCollapsed && (
          <p className="text-xs text-blue-300 truncate mb-2">
            {currentSchool.name}
          </p>
        )}
        <div className={cn(
          "flex items-center gap-2",
          isCollapsed && "flex-col"
        )}>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-blue-300 truncate">{user?.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "sm"}
            onClick={logout}
            title="Sair"
            className="text-blue-100 hover:text-white hover:bg-[#01356b]"
          >
            {isCollapsed ? <LogOut className="h-4 w-4" /> : "Sair"}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {MobileSidebar}
      {DesktopSidebar}
    </>
  );
}
