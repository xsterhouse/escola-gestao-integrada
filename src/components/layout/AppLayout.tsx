
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";

type AppLayoutProps = {
  children: ReactNode;
  requireAuth?: boolean;
  requiredPermission?: string;
};

export function AppLayout({ 
  children, 
  requireAuth = true,
  requiredPermission 
}: AppLayoutProps) {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Check if user is authenticated when required
  if (requireAuth && !isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check for specific permission when required
  if (
    requireAuth && 
    requiredPermission && 
    user && 
    user.role !== "master" &&
    !user.permissions.some(p => p.name === requiredPermission && p.hasAccess)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full h-12 w-12 animate-spin"></div>
          <p className="text-lg font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
