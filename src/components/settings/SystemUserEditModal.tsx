
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Edit } from "lucide-react";

interface School {
  id: string;
  name: string;
}

interface SystemUser {
  id: string;
  name: string;
  matricula: string;
  password: string;
  schoolId: string | null;
  isLinkedToPurchasing: boolean;
  status: "active" | "blocked";
  createdAt: Date;
  updatedAt: Date;
}

type SystemUserEditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<SystemUser>) => void;
  user: SystemUser;
  schools: School[];
};

export function SystemUserEditModal({
  isOpen,
  onClose,
  onSave,
  user,
  schools,
}: SystemUserEditModalProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    matricula: user.matricula,
    password: user.password,
    schoolId: user.schoolId || "",
    isLinkedToPurchasing: user.isLinkedToPurchasing,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const generatePassword = () => {
    const password = Math.floor(100000 + Math.random() * 900000).toString();
    setFormData(prev => ({ ...prev, password }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.matricula || !formData.password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length !== 6 || !/^\d{6}$/.test(formData.password)) {
      toast({
        title: "Senha inválida",
        description: "A senha deve ter exatamente 6 dígitos numéricos.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const userData = {
        name: formData.name,
        matricula: formData.matricula,
        password: formData.password,
        schoolId: formData.schoolId || null,
        isLinkedToPurchasing: formData.isLinkedToPurchasing,
      };

      onSave(userData);
      
      toast({
        title: "Usuário atualizado",
        description: "Os dados do usuário foram atualizados com sucesso.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao atualizar usuário",
        description: "Ocorreu um erro ao atualizar o usuário.",
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
            <Edit className="h-5 w-5" />
            Editar Usuário do Sistema
          </DialogTitle>
          <DialogDescription>
            Edite os dados do usuário {user.name}.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="school">Escola</Label>
            <Select value={formData.schoolId} onValueChange={(value) => setFormData(prev => ({ ...prev, schoolId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a escola (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma escola específica</SelectItem>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome do Usuário *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite o nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="matricula">Número da Matrícula *</Label>
            <Input
              id="matricula"
              value={formData.matricula}
              onChange={(e) => setFormData(prev => ({ ...prev, matricula: e.target.value }))}
              placeholder="Digite o número da matrícula"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Nova Senha (6 dígitos) *</Label>
            <div className="flex gap-2">
              <Input
                id="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Digite 6 dígitos"
                maxLength={6}
                pattern="[0-9]{6}"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={generatePassword}
                className="whitespace-nowrap"
              >
                Gerar
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              A senha deve ter exatamente 6 dígitos numéricos
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="purchasingCenter"
              checked={formData.isLinkedToPurchasing}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, isLinkedToPurchasing: checked as boolean }))
              }
            />
            <Label htmlFor="purchasingCenter" className="text-sm">
              Vincular à Central de Compras
            </Label>
          </div>
          
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
              {isSubmitting ? "Salvando..." : "Atualizar Usuário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
