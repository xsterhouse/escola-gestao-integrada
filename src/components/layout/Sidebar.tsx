
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, ChevronDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type SidebarProps = {
  className?: string;
};

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, currentSchool, logout } = useAuth();
  const location = useLocation();
  
  // Define the system modules
  const modules = [
    {
      id: "dashboard",
      name: "Painel",
      icon: "dashboard",
      path: "/dashboard",
      permission: "dashboard",
    },
    {
      id: "products",
      name: "Produtos",
      icon: "products",
      path: "/products",
      permission: "products",
    },
    {
      id: "inventory",
      name: "Estoque",
      icon: "stock",
      path: "/inventory",
      permission: "inventory",
    },
    {
      id: "financial",
      name: "Financeiro",
      icon: "finance",
      path: "/financial",
      permission: "financial",
    },
    {
      id: "planning",
      name: "Planejamento",
      icon: "planning",
      path: "/planning",
      permission: "planning",
    },
    {
      id: "contracts",
      name: "Contratos",
      icon: "contracts",
      path: "/contracts",
      permission: "contracts",
    },
    {
      id: "accounting",
      name: "Contabilidade",
      icon: "contabilidade",
      path: "/accounting",
      permission: "accounting",
    },
  ];

  // These routes are only visible to the master user
  const adminRoutes = [
    {
      id: "schools",
      name: "Escolas",
      icon: "users",
      path: "/schools",
      permission: "settings",
    },
    {
      id: "users",
      name: "Usuários",
      icon: "settings",
      path: "/users",
      permission: "settings",
    },
    {
      id: "settings",
      name: "Configurações",
      icon: "settings",
      path: "/settings",
      permission: "settings",
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
      <SheetContent side="left" className="w-72 p-0">
        <div className="flex flex-col h-full">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">SIGRE</h2>
            {currentSchool && (
              <p className="text-sm text-muted-foreground truncate">{currentSchool.name}</p>
            )}
          </div>
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Módulos</h3>
                <nav className="space-y-1">
                  {allowedModules.map((module) => (
                    <Link
                      key={module.id}
                      to={module.path}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        isActive(module.path)
                          ? "bg-accent text-accent-foreground font-medium"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <span>{module.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>
              {user?.role === "master" && allowedAdminRoutes.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Administração</h3>
                  <nav className="space-y-1">
                    {allowedAdminRoutes.map((route) => (
                      <Link
                        key={route.id}
                        to={route.path}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                          isActive(route.path)
                            ? "bg-accent text-accent-foreground font-medium"
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <span>{route.name}</span>
                      </Link>
                    ))}
                  </nav>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="px-6 py-4 border-t">
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
              >
                Sair
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
        "hidden md:flex flex-col h-full border-r bg-background",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className={cn(
        "flex h-14 items-center border-b px-4",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && <h2 className="text-lg font-semibold">SIGRE</h2>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expandir" : "Recolher"}
          className="h-9 w-9"
        >
          {isCollapsed ? <ChevronDown className="h-5 w-5 rotate-90" /> : <ChevronDown className="h-5 w-5 -rotate-90" />}
        </Button>
      </div>
      
      <ScrollArea className="flex-1 py-2">
        <div className="space-y-4 px-2">
          <TooltipProvider delayDuration={0}>
            <div className="space-y-1">
              {!isCollapsed && (
                <h3 className="px-4 text-xs font-medium text-muted-foreground">
                  Módulos
                </h3>
              )}
              <nav className="space-y-1">
                {allowedModules.map((module) => (
                  <Tooltip key={module.id} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        to={module.path}
                        className={cn(
                          "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                          isActive(module.path)
                            ? "bg-accent text-accent-foreground font-medium"
                            : "hover:bg-accent hover:text-accent-foreground",
                          isCollapsed && "justify-center"
                        )}
                      >
                        {isCollapsed ? (
                          <span className="text-base">{module.name[0]}</span>
                        ) : (
                          <span>{module.name}</span>
                        )}
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
              <div className="space-y-1">
                {!isCollapsed && (
                  <h3 className="px-4 text-xs font-medium text-muted-foreground">
                    Administração
                  </h3>
                )}
                <nav className="space-y-1">
                  {allowedAdminRoutes.map((route) => (
                    <Tooltip key={route.id} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Link
                          to={route.path}
                          className={cn(
                            "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                            isActive(route.path)
                              ? "bg-accent text-accent-foreground font-medium"
                              : "hover:bg-accent hover:text-accent-foreground",
                            isCollapsed && "justify-center"
                          )}
                        >
                          {isCollapsed ? (
                            <span className="text-base">{route.name[0]}</span>
                          ) : (
                            <span>{route.name}</span>
                          )}
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
        "border-t p-4", 
        isCollapsed && "flex flex-col items-center"
      )}>
        {currentSchool && !isCollapsed && (
          <p className="text-xs text-muted-foreground truncate mb-2">
            {currentSchool.name}
          </p>
        )}
        <div className={cn(
          "flex items-center gap-2",
          isCollapsed && "flex-col"
        )}>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
          <Button
            variant="outline"
            size={isCollapsed ? "icon" : "sm"}
            onClick={logout}
            title="Sair"
          >
            {isCollapsed ? <X className="h-4 w-4" /> : "Sair"}
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
