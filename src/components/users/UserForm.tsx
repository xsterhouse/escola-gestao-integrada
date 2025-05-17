
import { useState } from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogHeader,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { School, User, Permission } from "@/lib/types";

type UserFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<User, "id" | "createdAt" | "updatedAt">) => void;
  initialData?: User;
  schools: School[];
};

export function UserForm({
  isOpen,
  onClose,
  onSave,
  initialData,
  schools = [], // Provide default empty array to prevent undefined errors
}: UserFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [role, setRole] = useState(initialData?.role || "user");
  const [schoolId, setSchoolId] = useState(initialData?.schoolId || "");
  const [permissions, setPermissions] = useState<Permission[]>(
    initialData?.permissions || [
      { id: "1", name: "dashboard", hasAccess: true },
      { id: "2", name: "products", hasAccess: false },
      { id: "3", name: "inventory", hasAccess: false },
      { id: "4", name: "financial", hasAccess: false },
      { id: "5", name: "planning", hasAccess: false },
      { id: "6", name: "contracts", hasAccess: false },
      { id: "7", name: "accounting", hasAccess: false },
      { id: "8", name: "settings", hasAccess: false },
    ]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handlePermissionChange = (permissionName: string, checked: boolean) => {
    setPermissions(
      permissions.map((permission) =>
        permission.name === permissionName
          ? { ...permission, hasAccess: checked }
          : permission
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !role) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    if (role !== "master" && !schoolId) {
      toast({
        title: "Escola obrigatória",
        description: "Por favor, selecione uma escola para o usuário.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      onSave({
        name,
        email,
        role,
        schoolId: role === "master" ? null : schoolId,
        permissions,
      });
      
      toast({
        title: initialData ? "Usuário atualizado" : "Usuário cadastrado",
        description: initialData 
          ? "O usuário foi atualizado com sucesso." 
          : "O usuário foi cadastrado com sucesso.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o usuário.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const moduleNames = {
    dashboard: "Painel",
    products: "Produtos",
    inventory: "Estoque",
    financial: "Financeiro",
    planning: "Planejamento",
    contracts: "Contratos",
    accounting: "Contabilidade",
    settings: "Configurações",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
          <DialogDescription>
            {initialData 
              ? "Atualize os dados do usuário no sistema." 
              : "Cadastre um novo usuário no sistema."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do usuário"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Tipo de Usuário *</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="master">Master (Acesso Total)</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="user">Usuário Comum</SelectItem>
                  <SelectItem value="viewer">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {role !== "master" && (
              <div className="space-y-2">
                <Label htmlFor="school">Escola *</Label>
                <Select
                  value={schoolId}
                  onValueChange={setSchoolId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a escola" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-3">
              <Label>Permissões de Acesso</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`permission-${permission.name}`}
                      checked={permission.hasAccess}
                      onCheckedChange={(checked) => 
                        handlePermissionChange(permission.name, !!checked)
                      }
                    />
                    <Label 
                      htmlFor={`permission-${permission.name}`}
                      className="text-sm cursor-pointer"
                    >
                      {moduleNames[permission.name as keyof typeof moduleNames]}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : initialData ? "Atualizar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
