
import { TenantHeader } from "./TenantHeader";
import { Sidebar } from "./Sidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

interface AppLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredPermission?: string;
}

export function AppLayout({ children, requireAuth = true, requiredPermission }: AppLayoutProps) {
  return (
    <ProtectedRoute requireAuth={requireAuth} requiredPermission={requiredPermission}>
      <div className="min-h-screen bg-gray-50 flex w-full">
        {/* Fixed Sidebar */}
        <div className="fixed left-0 top-0 h-full z-40">
          <Sidebar />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col ml-80">
          <TenantHeader />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
