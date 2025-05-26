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
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { User, School } from "@/lib/types";
import { UserRole } from "@/types/user";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Partial<User>) => void;
  initialData?: User;
  schools: School[];
}

export function UserForm({
  isOpen,
  onClose,
  onSave,
  initialData,
  schools,
}: UserFormProps) {
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
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Load user roles from localStorage
  const { data: userRoles } = useLocalStorageSync<UserRole>('userRoles', []);

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
      const userData: Omit<User, "id" | "createdAt" | "updatedAt"> = {
        name: formData.name,
        matricula: formData.matricula,
        email: formData.email,
        role: formData.role,
        profileId: formData.profileId,
        schoolId: formData.schoolId || null,
        permissions: [],
        status: "active",
      };

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {initialData ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
          <DialogDescription>
            {initialData 
              ? "Edite as informações do usuário." 
              : "Cadastre um novo usuário no sistema."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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

          {getSelectedProfile() && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Perfil: {getSelectedProfile()?.name}</span>
              </div>
              <p className="text-xs text-blue-700">{getSelectedProfile()?.description}</p>
              <p className="text-xs text-blue-600 mt-1">{getProfilePermissionsSummary()}</p>
            </div>
          )}

          {!initialData && (
            <>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Digite a senha"
                />
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
            </>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              style={{ backgroundColor: '#012340', color: 'white' }}
            >
              {isSubmitting ? "Salvando..." : (initialData ? "Atualizar" : "Criar Usuário")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
