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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { User, School, ModulePermission } from "@/lib/types";
import { Eye, EyeOff, Shield } from "lucide-react";

type ModernUserFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Partial<User>) => void;
  initialData?: User;
  schools: School[];
};

export function ModernUserForm({
  isOpen,
  onClose,
  onSave,
  initialData,
  schools,
}: ModernUserFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    role: initialData?.role || "user",
    schoolId: initialData?.schoolId || "",
    password: "",
    confirmPassword: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Mock permissions
  const [permissions, setPermissions] = useState<ModulePermission[]>([
    { id: "1", name: "Dashboard", description: "Painel principal", create: true, read: true, update: false, delete: false },
    { id: "2", name: "Produtos", description: "Gestão de produtos", create: false, read: true, update: false, delete: false },
    { id: "3", name: "Estoque", description: "Controle de estoque", create: false, read: true, update: false, delete: false },
    { id: "4", name: "Financeiro", description: "Gestão financeira", create: false, read: false, update: false, delete: false },
    { id: "5", name: "Planejamento", description: "Planejamento escolar", create: false, read: false, update: false, delete: false },
    { id: "6", name: "Contratos", description: "Gestão de contratos", create: false, read: false, update: false, delete: false },
    { id: "7", name: "Configurações", description: "Configurações do sistema", create: false, read: false, update: false, delete: false },
  ]);

  // Filter schools to ensure no empty values
  const validSchools = schools.filter(school => school.id && school.id.trim() !== "");

  const validatePassword = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    setPasswordStrength(strength);
    return strength >= 3;
  };

  const handlePasswordChange = (password: string) => {
    setFormData(prev => ({ ...prev, password }));
    validatePassword(password);
  };

  const handlePermissionToggle = (permissionId: string, type: "create" | "read" | "update" | "delete") => {
    setPermissions(prev => 
      prev.map(permission => 
        permission.id === permissionId
          ? { ...permission, [type]: !permission[type] }
          : permission
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.role) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (!initialData) { // Novo usuário
      if (!formData.password) {
        toast({
          title: "Senha obrigatória",
          description: "Por favor, defina uma senha para o usuário.",
          variant: "destructive",
        });
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Senhas não coincidem",
          description: "A confirmação da senha deve ser igual à senha.",
          variant: "destructive",
        });
        return;
      }

      if (!validatePassword(formData.password)) {
        toast({
          title: "Senha fraca",
          description: "A senha deve ter pelo menos 8 caracteres e incluir maiúscula, minúscula e número.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      const userData: Partial<User> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        schoolId: formData.schoolId || null,
        permissions: permissions.map(p => ({ 
          id: p.id, 
          name: p.name.toLowerCase(), 
          hasAccess: p.read || p.create || p.update || p.delete 
        })),
      };

      onSave(userData);
      
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

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Fraca";
    if (passwordStrength <= 3) return "Média";
    return "Forte";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {initialData ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
          <DialogDescription>
            {initialData 
              ? "Atualize os dados do usuário no sistema." 
              : "Cadastre um novo usuário no sistema."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Dados Básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome completo do usuário"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Perfil *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="school">Escola</Label>
                <Select value={formData.schoolId} onValueChange={(value) => setFormData(prev => ({ ...prev, schoolId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a escola" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma escola específica</SelectItem>
                    {validSchools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Senha (apenas para novos usuários) */}
            {!initialData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      placeholder="Senha do usuário"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {formData.password && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-full bg-gray-200 rounded">
                          <div 
                            className={`h-full rounded transition-all ${getPasswordStrengthColor()}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{getPasswordStrengthText()}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula e número.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirme a senha"
                    required
                  />
                </div>
              </div>
            )}

            {/* Permissões */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <Label className="text-base font-medium">Permissões do Sistema</Label>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {permissions.map((permission) => (
                  <div key={permission.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{permission.name}</h4>
                        <p className="text-sm text-gray-600">{permission.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={permission.read}
                          onCheckedChange={() => handlePermissionToggle(permission.id, "read")}
                        />
                        <Label className="text-sm">Visualizar</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={permission.create}
                          onCheckedChange={() => handlePermissionToggle(permission.id, "create")}
                        />
                        <Label className="text-sm">Criar</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={permission.update}
                          onCheckedChange={() => handlePermissionToggle(permission.id, "update")}
                        />
                        <Label className="text-sm">Editar</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={permission.delete}
                          onCheckedChange={() => handlePermissionToggle(permission.id, "delete")}
                        />
                        <Label className="text-sm">Excluir</Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
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
