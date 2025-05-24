
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

type SidebarProps = {
  className?: string;
};

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionStart] = useState(new Date());
  const [sessionTime, setSessionTime] = useState("00:00:00");
  const { user, currentSchool, logout } = useAuth();
  const location = useLocation();
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
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

  // Get greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  // Format time for Brasília timezone
  const getBrasiliaTime = () => {
    return currentTime.toLocaleTimeString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Get date for Brasília timezone
  const getBrasiliaDate = () => {
    return currentTime.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'long',
      day: '2-digit',
      month: 'long'
    });
  };
  
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
      <SheetContent side="left" className="w-72 p-0" style={{ backgroundColor: '#012340' }}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">SIGRE</h2>
            
            {/* User Profile */}
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg mt-4">
              <div className="bg-white/10 p-2 rounded-full">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{getGreeting()}, {user?.name?.split(' ')[0]}</p>
                <p className="text-xs text-blue-200 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Digital Clock */}
          <div className="px-6 py-4 border-b border-white/10">
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-200" />
                <span className="text-xs text-blue-200">Brasília, Brasil</span>
              </div>
              <div className="text-lg font-mono font-bold text-white">
                {getBrasiliaTime()}
              </div>
              <div className="text-xs text-blue-200 capitalize">
                {getBrasiliaDate()}
              </div>
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="text-xs text-blue-200">Tempo de sessão</div>
                <div className="text-sm font-mono text-white">{sessionTime}</div>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-blue-200 uppercase tracking-wider">Módulos</h3>
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
                      {module.icon}
                      <span>{module.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>
              {user?.role === "master" && allowedAdminRoutes.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-blue-200 uppercase tracking-wider">Administração</h3>
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
                        {route.icon}
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
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full justify-start text-blue-100 hover:text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  // Desktop sidebar
  const DesktopSidebar = (
    <div
      className={cn(
        "hidden md:flex flex-col h-full border-r border-white/10",
        isCollapsed ? "w-20" : "w-80",
        className
      )}
      style={{ backgroundColor: '#012340' }}
    >
      {/* Header */}
      <div className={cn(
        "flex h-16 items-center border-b border-white/10",
        isCollapsed ? "justify-center px-4" : "justify-between px-6"
      )}>
        {!isCollapsed && (
          <h2 className="text-xl font-bold text-white">SIGRE</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expandir" : "Recolher"}
          className="h-9 w-9 text-white hover:bg-white/10"
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
              <p className="text-lg font-medium text-white">{getGreeting()}, {user?.name?.split(' ')[0]}</p>
              <p className="text-sm text-blue-200 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Digital Clock Section */}
      {!isCollapsed && (
        <div className="px-6 py-4 border-b border-white/10">
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-blue-200" />
              <span className="text-sm text-blue-200">Brasília, Brasil</span>
            </div>
            <div className="text-xl font-mono font-bold text-white mb-2">
              {getBrasiliaTime()}
            </div>
            <div className="text-sm text-blue-200 capitalize mb-4">
              {getBrasiliaDate()}
            </div>
            <div className="pt-3 border-t border-white/10">
              <div className="text-xs text-blue-200 mb-1">Tempo de sessão</div>
              <div className="text-sm font-mono text-white">{sessionTime}</div>
            </div>
          </div>
        </div>
      )}
      
      <ScrollArea className="flex-1 py-6">
        <div className="space-y-8 px-6">
          <TooltipProvider delayDuration={0}>
            <div className="space-y-4">
              {!isCollapsed && (
                <h3 className="text-sm font-medium text-blue-200 uppercase tracking-wider">
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
              <div className="space-y-4">
                {!isCollapsed && (
                  <h3 className="text-sm font-medium text-blue-200 uppercase tracking-wider">
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
      
      <div className="border-t border-white/10 p-6">
        {!isCollapsed ? (
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start text-blue-100 hover:text-white hover:bg-white/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        ) : (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="w-full text-blue-100 hover:text-white hover:bg-white/10"
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
