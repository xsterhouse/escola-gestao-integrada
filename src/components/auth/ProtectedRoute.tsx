
import { useAuth } from "@/contexts/AuthContext";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requireAuth?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requiredPermission, 
  requireAuth = true 
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const { canAccessModule } = useUserPermissions();

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check specific permission if required
  if (requiredPermission && user) {
    const hasAccess = canAccessModule(user, requiredPermission);
    
    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Acesso Negado
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Você não tem permissão para acessar este módulo.
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Shield className="h-4 w-4" />
                  <span>Usuário: {user.name}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Tipo: {user.userType}
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Entre em contato com o administrador para solicitar acesso.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return <>{children}</>;
}
