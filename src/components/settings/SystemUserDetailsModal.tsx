
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User as UserIcon, School as SchoolIcon, Building2, Calendar, Mail, Key } from "lucide-react";

interface SystemUser {
  id: string;
  name: string;
  matricula: string;
  password: string;
  schoolId: string | null;
  purchasingCenterIds?: string[];
  isLinkedToPurchasing: boolean;
  status: "active" | "blocked";
  createdAt: Date;
  updatedAt: Date;
}

interface School {
  id: string;
  name: string;
}

interface PurchasingCenter {
  id: string;
  name: string;
  schoolIds: string[];
}

type SystemUserDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: SystemUser;
  schools: School[];
  purchasingCenters: PurchasingCenter[];
};

export function SystemUserDetailsModal({
  isOpen,
  onClose,
  user,
  schools,
  purchasingCenters,
}: SystemUserDetailsModalProps) {
  const getSchoolName = (schoolId: string | null) => {
    if (!schoolId) return "Nenhuma escola vinculada";
    const school = schools.find(s => s.id === schoolId);
    return school ? school.name : "Escola não encontrada";
  };

  const getUserPurchasingCenters = () => {
    if (!user.purchasingCenterIds || user.purchasingCenterIds.length === 0) {
      return [];
    }
    
    return purchasingCenters.filter(center => 
      user.purchasingCenterIds!.includes(center.id)
    );
  };

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      if (!dateObj || isNaN(dateObj.getTime())) {
        return "Data inválida";
      }
      
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj);
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Data inválida";
    }
  };

  const userPurchasingCenters = getUserPurchasingCenters();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Detalhes do Usuário do Sistema
          </DialogTitle>
          <DialogDescription>
            Informações completas do usuário do sistema
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
                  <p className="text-sm font-medium text-gray-500">Matrícula</p>
                  <p className="text-base flex items-center gap-1">
                    <Key className="h-4 w-4" />
                    {user.matricula}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge variant={user.status === "active" ? "default" : "destructive"}>
                    {user.status === "active" ? "Ativo" : "Bloqueado"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Vinculado à Central</p>
                  <Badge variant={user.isLinkedToPurchasing ? "default" : "secondary"}>
                    {user.isLinkedToPurchasing ? "Sim" : "Não"}
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

          {/* Centrais de Compras */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Centrais de Compras Vinculadas
              </CardTitle>
              <CardDescription>
                Centrais de compras que o usuário tem acesso
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userPurchasingCenters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {userPurchasingCenters.map((center) => (
                    <Badge key={center.id} variant="outline" className="justify-start p-2">
                      <Building2 className="h-3 w-3 mr-1" />
                      {center.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Building2 className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Nenhuma central de compras vinculada</p>
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
