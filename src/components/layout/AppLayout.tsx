
import { TenantHeader } from "./TenantHeader";
import { Sidebar } from "./Sidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { OfflineIndicator } from "@/components/ui/offline-indicator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AppLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredPermission?: string;
}

export function AppLayout({ children, requireAuth = true, requiredPermission }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <ProtectedRoute requireAuth={requireAuth} requiredPermission={requiredPermission}>
      <div className="min-h-screen bg-gray-50 flex w-full">
        {/* Desktop Sidebar - Hidden on mobile */}
        {!isMobile && (
          <div className="fixed left-0 top-0 h-full z-40">
            <Sidebar />
          </div>
        )}
        
        {/* Mobile Sidebar */}
        {isMobile && (
          <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
            <SheetContent side="left" className="p-0 w-80">
              <Sidebar />
            </SheetContent>
          </Sheet>
        )}
        
        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col ${!isMobile ? 'ml-80' : ''}`}>
          {/* Mobile Header with Menu Button */}
          {isMobile && (
            <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-2">
              <div className="flex items-center justify-between">
                <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                </Sheet>
                <h1 className="text-lg font-semibold text-gray-900">SIGRE</h1>
                <div className="w-10" /> {/* Spacer for centering */}
              </div>
            </div>
          )}
          
          {/* Tenant Header - Responsive */}
          <div className={`${isMobile ? 'px-2' : ''}`}>
            <TenantHeader />
          </div>
          
          {/* Main Content */}
          <main className={`flex-1 overflow-auto ${isMobile ? 'px-2 py-2' : 'px-0 py-0'}`}>
            {children}
          </main>
        </div>
        
        {/* Offline Indicator */}
        <OfflineIndicator />
      </div>
    </ProtectedRoute>
  );
}
