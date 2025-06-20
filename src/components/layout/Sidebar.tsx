
import { useState, useEffect } from "react";
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
  User,
  Clock
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";

type SidebarProps = {
  className?: string;
};

interface PurchasingCenter {
  id: string;
  name: string;
  description: string;
  schoolIds: string[];
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sessionStart] = useState(new Date());
  const [sessionTime, setSessionTime] = useState("00:00:00");
  const [userPurchasingCenter, setUserPurchasingCenter] = useState<string | null>(null);
  const { user, currentSchool, logout } = useAuth();
  const location = useLocation();
  
  // Carregar dados das centrais de compras
  const { data: purchasingCenters } = useLocalStorageSync<PurchasingCenter>('purchasingCenters', []);
  
  // Encontrar a central de compras do usuário/escola atual
  useEffect(() => {
    // Não mostrar central de compras para usuário master
    if (user?.role === "master") {
      setUserPurchasingCenter(null);
      return;
    }

    if (currentSchool && purchasingCenters.length > 0) {
      const center = purchasingCenters.find(pc => 
        pc.schoolIds.includes(currentSchool.id) && pc.status === "active"
      );
      setUserPurchasingCenter(center?.name || null);
    } else {
      setUserPurchasingCenter(null);
    }
  }, [currentSchool, purchasingCenters, user?.role]);
  
  // Update session time every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      
      // Calculate session time
      const timeDiff = now.getTime() - sessionStart.getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      setSessionTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionStart]);

  // Define the system modules with the new order
  const modules = [
    {
      id: "dashboard",
      name: "Painel",
      icon: LayoutDashboard,
      path: "/dashboard",
      permission: "dashboard",
    },
    {
      id: "products",
      name: "Produtos",
      icon: Package,
      path: "/products",
      permission: "products",
    },
    {
      id: "inventory",
      name: "Estoque",
      icon: Store,
      path: "/inventory",
      permission: "inventory",
    },
    {
      id: "financial",
      name: "Financeiro",
      icon: DollarSign,
      path: "/financial",
      permission: "financial",
    },
    {
      id: "planning",
      name: "Planejamento",
      icon: ClipboardList,
      path: "/planning",
      permission: "planning",
    },
    {
      id: "contracts",
      name: "Contratos",
      icon: FileText,
      path: "/contracts",
      permission: "contracts",
    },
  ];

  // These routes are only visible to the master user - reordered
  const adminRoutes = [
    {
      id: "settings",
      name: "Configurações",
      icon: Settings,
      path: "/settings",
      permission: "settings",
    },
    {
      id: "accounting",
      name: "Contabilidade",
      icon: BookOpen,
      path: "/accounting",
      permission: "accounting",
    },
  ];

  // Function to check if user has permission for a module
  const hasPermission = (permission: string) => {
    if (!user) return false;
    if (user.role === "master") return true;
    // Fix the permission check
    return user.permissions?.includes(permission) || false;
  };

  // Filter modules based on permissions
  const allowedModules = modules.filter(module => hasPermission(module.permission));
  const allowedAdminRoutes = adminRoutes.filter(route => hasPermission(route.permission));

  // Function to check if route is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Function to get display text for current context
  const getContextDisplay = () => {
    if (user?.role === "master") {
      return {
        primary: "Sistema Global",
        secondary: "Administrador Master"
      };
    }
    
    return {
      primary: currentSchool?.name || "Nenhuma escola",
      secondary: userPurchasingCenter ? `Central: ${userPurchasingCenter}` : null
    };
  };

  const contextDisplay = getContextDisplay();

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
      <SheetContent side="left" className="w-72 p-0" style={{ backgroundColor: '#012340' }}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-6 border-b border-white/10">
            <div className="flex flex-col gap-4 mb-4">
              <h2 className="text-xl font-bold text-white text-left">SIGRE</h2>
              <div className="flex items-center gap-3 justify-center">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-blue-200 truncate text-center">
                    {contextDisplay.primary}
                  </p>
                  {contextDisplay.secondary && (
                    <p className="text-xs text-blue-300 truncate text-center mt-1">
                      {contextDisplay.secondary}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <div className="bg-white/10 p-2 rounded-full">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-blue-200 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Session Time */}
          <div className="px-6 py-4 border-b border-white/10">
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-200" />
                <span className="text-xs text-blue-200">Tempo de sessão</span>
              </div>
              <div className="text-lg font-mono font-bold text-white">
                {sessionTime}
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xs font-medium text-blue-200 uppercase tracking-wider">Módulos</h3>
                <nav className="space-y-3">
                  {allowedModules.map((module) => (
                    <Link
                      key={module.id}
                      to={module.path}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all duration-200",
                        isActive(module.path)
                          ? "bg-white/15 text-white font-medium shadow-lg"
                          : "text-blue-100 hover:bg-white/10 hover:text-white"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <module.icon className="h-5 w-5" />
                      <span>{module.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>
              {user?.role === "master" && allowedAdminRoutes.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-medium text-blue-200 uppercase tracking-wider">Administração</h3>
                  <nav className="space-y-3">
                    {allowedAdminRoutes.map((route) => (
                      <Link
                        key={route.id}
                        to={route.path}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all duration-200",
                          isActive(route.path)
                            ? "bg-white/15 text-white font-medium shadow-lg"
                            : "text-blue-100 hover:bg-white/10 hover:text-white"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <route.icon className="h-5 w-5" />
                        <span>{route.name}</span>
                      </Link>
                    ))}
                  </nav>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="px-6 py-4 border-t border-white/10">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="h-8 w-8 text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  // Desktop sidebar - now properly fixed
  const DesktopSidebar = (
    <div
      className={cn(
        "flex flex-col h-screen border-r border-white/10 transition-all duration-300 bg-[#012340]",
        isCollapsed ? "w-20" : "w-80",
        className
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex h-16 items-center border-b border-white/10 transition-all duration-300 relative",
        isCollapsed ? "justify-center px-4" : "justify-between px-6"
      )}>
        {!isCollapsed ? (
          <div className="flex flex-col items-start w-full">
            <h2 className="text-lg font-bold text-white">SIGRE</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex flex-col items-start">
                <p className="text-xs text-blue-200 truncate">
                  {contextDisplay.primary}
                </p>
                {contextDisplay.secondary && (
                  <p className="text-xs text-blue-300 truncate">
                    {contextDisplay.secondary}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 p-2 rounded-full">
            <Building className="h-5 w-5 text-white" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expandir" : "Recolher"}
          className="h-9 w-9 text-white hover:bg-white/10 z-10"
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px'
          }}
        >
          {isCollapsed ? <ChevronDown className="h-5 w-5 rotate-90" /> : <ChevronDown className="h-5 w-5 -rotate-90" />}
        </Button>
      </div>

      {/* User Profile Section */}
      {!isCollapsed && (
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
            <div className="bg-white/10 p-3 rounded-full">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-medium text-white truncate">{user?.name}</p>
              <p className="text-sm text-blue-200 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Session Time Section */}
      {!isCollapsed && (
        <div className="px-6 py-4 border-b border-white/10">
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-blue-200" />
              <span className="text-xs text-blue-200">Tempo de sessão</span>
            </div>
            <div className="text-xl font-mono font-bold text-white">
              {sessionTime}
            </div>
          </div>
        </div>
      )}
      
      <ScrollArea className="flex-1 py-6">
        <div className="space-y-8 px-6">
          <TooltipProvider delayDuration={0}>
            <div className="space-y-4">
              {!isCollapsed && (
                <h3 className="text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Módulos
                </h3>
              )}
              <nav className="space-y-3">
                {allowedModules.map((module) => (
                  <Tooltip key={module.id} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        to={module.path}
                        className={cn(
                          "flex items-center rounded-lg px-4 py-3 text-sm transition-all duration-200",
                          isActive(module.path)
                            ? "bg-white/15 text-white font-medium shadow-lg"
                            : "text-blue-100 hover:bg-white/10 hover:text-white",
                          isCollapsed ? "justify-center" : "gap-3"
                        )}
                      >
                        <module.icon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && <span className="truncate">{module.name}</span>}
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
              <div className="space-y-4">
                {!isCollapsed && (
                  <h3 className="text-xs font-medium text-blue-200 uppercase tracking-wider">
                    Administração
                  </h3>
                )}
                <nav className="space-y-3">
                  {allowedAdminRoutes.map((route) => (
                    <Tooltip key={route.id} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Link
                          to={route.path}
                          className={cn(
                            "flex items-center rounded-lg px-4 py-3 text-sm transition-all duration-200",
                            isActive(route.path)
                              ? "bg-white/15 text-white font-medium shadow-lg"
                              : "text-blue-100 hover:bg-white/10 hover:text-white",
                            isCollapsed ? "justify-center" : "gap-3"
                          )}
                        >
                          <route.icon className="h-5 w-5 flex-shrink-0" />
                          {!isCollapsed && <span className="truncate">{route.name}</span>}
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
      
      <div className="border-t border-white/10 p-6">
        {!isCollapsed ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="h-8 w-8 text-white hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        ) : (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="h-8 w-8 text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Sair
            </TooltipContent>
          </Tooltip>
        )}
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
