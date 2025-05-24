
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, School } from "@/lib/types";
import { User as UserIcon, School as SchoolIcon, Shield, Calendar, Mail, Key } from "lucide-react";

type UserDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  schools: School[];
};

export function UserDetailsModal({
  isOpen,
  onClose,
  user,
  schools,
}: UserDetailsModalProps) {
  const getSchoolName = (schoolId: string | null) => {
    if (!schoolId) return "Todas as escolas";
    const school = schools.find(s => s.id === schoolId);
    return school ? school.name : "Escola não encontrada";
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "master":
        return "Admin Master";
      case "admin":
        return "Administrador";
      case "user":
        return "Usuário";
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "master":
        return "default";
      case "admin":
        return "secondary";
      case "user":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const moduleNames = {
    dashboard: "Dashboard",
    products: "Produtos",
    inventory: "Estoque",
    financial: "Financeiro",
    planning: "Planejamento",
    contracts: "Contratos",
    accounting: "Contabilidade",
    settings: "Configurações",
  };

  const permissionsWithAccess = user.permissions.filter(p => p.hasAccess);
  const permissionsWithoutAccess = user.permissions.filter(p => !p.hasAccess);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Detalhes do Usuário
          </DialogTitle>
          <DialogDescription>
            Informações completas do usuário no sistema
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nome Completo</p>
                  <p className="text-base">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">E-mail</p>
                  <p className="text-base flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Perfil</p>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge variant={user.status === "active" ? "default" : "secondary"}>
                    {user.status === "active" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Escola Vinculada */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <SchoolIcon className="h-4 w-4" />
                Escola Vinculada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base">{getSchoolName(user.schoolId)}</p>
              {user.schoolId && (
                <p className="text-sm text-gray-500 mt-1">
                  ID da Escola: {user.schoolId}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Permissões */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Permissões de Acesso
              </CardTitle>
              <CardDescription>
                Módulos do sistema que o usuário tem acesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {permissionsWithAccess.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-green-700 mb-2">✓ Com Acesso</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {permissionsWithAccess.map((permission) => (
                      <Badge key={permission.id} variant="default" className="justify-start">
                        {moduleNames[permission.name as keyof typeof moduleNames] || permission.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {permissionsWithoutAccess.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-red-700 mb-2">✗ Sem Acesso</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {permissionsWithoutAccess.map((permission) => (
                      <Badge key={permission.id} variant="outline" className="justify-start text-gray-500">
                        {moduleNames[permission.name as keyof typeof moduleNames] || permission.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Data de Criação</p>
                  <p className="text-base">{formatDate(user.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Última Atualização</p>
                  <p className="text-base">{formatDate(user.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">ID do Usuário</p>
                  <p className="text-base font-mono text-sm">{user.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
