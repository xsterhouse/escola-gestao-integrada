import { useState, useEffect } from "react";
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
import { UserRole } from "@/types/user";
import { saveUserPassword } from "@/contexts/AuthContext";
import { Eye, EyeOff, Shield, Users } from "lucide-react";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";

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
    matricula: initialData?.matricula || "",
    email: initialData?.email || "",
    role: initialData?.role || "user",
    profileId: initialData?.profileId || "",
    schoolId: initialData?.schoolId || "",
    password: "",
    confirmPassword: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Load user roles from localStorage
  const { data: userRoles } = useLocalStorageSync<UserRole>('userRoles', []);

  // Mock permissions - will be inherited from selected profile
  const [permissions, setPermissions] = useState<ModulePermission[]>([
    { id: "1", name: "Dashboard", description: "Painel principal", create: true, read: true, update: false, delete: false },
    { id: "2", name: "Produtos", description: "Gestão de produtos", create: false, read: true, update: false, delete: false },
    { id: "3", name: "Estoque", description: "Controle de estoque", create: false, read: true, update: false, delete: false },
  ]);

  const defaultModulePermissions: ModulePermission[] = [
    { id: "dashboard", name: "Dashboard", description: "Acesso ao painel principal", hasAccess: true, create: true, read: true, update: false, delete: false },
    { id: "planning", name: "Planejamento", description: "Gestão de planejamentos", hasAccess: true, create: false, read: true, update: false, delete: false },
    { id: "inventory", name: "Estoque", description: "Controle de estoque", hasAccess: true, create: false, read: true, update: false, delete: false },
  ];

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password, confirmPassword: password }));
    calculatePasswordStrength(password);
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (password: string) => {
    setFormData(prev => ({ ...prev, password }));
    calculatePasswordStrength(password);
  };

  const getSelectedProfile = () => {
    return userRoles.find(role => role.id === formData.profileId);
  };

  const getProfilePermissionsSummary = () => {
    const profile = getSelectedProfile();
    if (!profile || !profile.detailedPermissions) {
      return "Nenhuma permissão configurada";
    }
    
    const activeModules = profile.detailedPermissions.filter(p => 
      p.view || p.create || p.edit || p.delete || p.read
    ).length;
    
    return `${activeModules} módulos com permissões configuradas`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.matricula || !formData.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.profileId) {
      toast({
        title: "Perfil obrigatório",
        description: "Por favor, selecione um perfil para o usuário.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const userData: Partial<User> = {
        name: formData.name,
        matricula: formData.matricula,
        email: formData.email,
        role: formData.role,
        profileId: formData.profileId,
        schoolId: formData.schoolId || null,
        permissions: permissions.map(p => ({ 
          id: p.id, 
          name: p.name, 
          hasAccess: p.read || p.create || p.update || p.delete 
        })),
        status: "active",
      };

      if (!initialData) {
        userData.createdAt = new Date();
      }
      userData.updatedAt = new Date();

      // Save password if provided
      if (formData.password) {
        await saveUserPassword(formData.matricula, formData.password);
      }

      onSave(userData);
      
      // Reset form
      setFormData({
        name: "",
        matricula: "",
        email: "",
        role: "user",
        profileId: "",
        schoolId: "",
        password: "",
        confirmPassword: "",
      });
      
      toast({
        title: initialData ? "Usuário atualizado" : "Usuário criado",
        description: `O usuário foi ${initialData ? "atualizado" : "criado"} com sucesso.`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao salvar usuário",
        description: "Ocorreu um erro ao salvar o usuário.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength === 3) return "bg-yellow-500";
    if (passwordStrength === 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Fraca";
    if (passwordStrength === 3) return "Média";
    if (passwordStrength === 4) return "Forte";
    return "Muito Forte";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {initialData ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
          <DialogDescription>
            {initialData 
              ? "Edite as informações do usuário e suas permissões." 
              : "Cadastre um novo usuário no sistema."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Informações Básicas
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Digite o nome completo"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="matricula">Matrícula *</Label>
                <Input
                  id="matricula"
                  value={formData.matricula}
                  onChange={(e) => setFormData(prev => ({ ...prev, matricula: e.target.value }))}
                  placeholder="Digite a matrícula"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Digite o e-mail"
                required
              />
            </div>
          </div>

          {/* Perfil e Escola */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Perfil e Acesso
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profileId">Perfil do Usuário *</Label>
                <Select value={formData.profileId} onValueChange={(value) => setFormData(prev => ({ ...prev, profileId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {userRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.profileId && (
                  <p className="text-xs text-gray-600">
                    {getProfilePermissionsSummary()}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="school">Escola</Label>
                <Select value={formData.schoolId} onValueChange={(value) => setFormData(prev => ({ ...prev, schoolId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a escola" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as escolas</SelectItem>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {getSelectedProfile() && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Perfil Selecionado: {getSelectedProfile()?.name}</span>
                </div>
                <p className="text-sm text-blue-700">{getSelectedProfile()?.description}</p>
                <p className="text-xs text-blue-600 mt-1">{getProfilePermissionsSummary()}</p>
              </div>
            )}
          </div>

          {/* Senha */}
          {!initialData && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Senha de Acesso</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      placeholder="Digite a senha"
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generatePassword}
                    className="w-full"
                  >
                    Gerar Senha Automática
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirme a senha"
                  />
                </div>
              </div>
              
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Força da senha:</span>
                    <span className={`text-sm font-medium ${
                      passwordStrength <= 2 ? 'text-red-600' : 
                      passwordStrength === 3 ? 'text-yellow-600' : 
                      passwordStrength === 4 ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              style={{ backgroundColor: '#012340', color: 'white' }}
              onMouseOver={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#013a5c';
                }
              }}
              onMouseOut={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#012340';
                }
              }}
            >
              {isSubmitting ? "Salvando..." : (initialData ? "Atualizar Usuário" : "Criar Usuário")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
