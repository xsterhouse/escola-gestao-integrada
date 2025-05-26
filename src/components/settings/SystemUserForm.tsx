
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";

interface School {
  id: string;
  name: string;
}

interface PurchasingCenter {
  id: string;
  name: string;
  description: string;
  schoolIds: string[];
  status: "active" | "inactive";
}

interface SystemUser {
  name: string;
  matricula: string;
  password: string;
  schoolId: string | null;
  isLinkedToPurchasing: boolean;
  purchasingCenterIds: string[];
  status: "active" | "blocked";
}

type SystemUserFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: SystemUser) => void;
  schools: School[];
};

export function SystemUserForm({
  isOpen,
  onClose,
  onSave,
  schools,
}: SystemUserFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    matricula: "",
    password: "",
    schoolId: "",
    isLinkedToPurchasing: false,
    purchasingCenterIds: [] as string[],
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchasingCenters, setPurchasingCenters] = useState<PurchasingCenter[]>([]);
  const [availablePurchasingCenters, setAvailablePurchasingCenters] = useState<PurchasingCenter[]>([]);
  const { toast } = useToast();

  // Carregar centrais de compras do localStorage
  useEffect(() => {
    const storedPurchasingCenters = localStorage.getItem('purchasingCenters');
    if (storedPurchasingCenters) {
      const centers = JSON.parse(storedPurchasingCenters);
      setPurchasingCenters(centers);
    }
  }, []);

  // Filtrar centrais de compras disponíveis baseado na escola selecionada
  useEffect(() => {
    if (formData.schoolId && purchasingCenters.length > 0) {
      const filtered = purchasingCenters.filter(center => 
        center.schoolIds.includes(formData.schoolId) && center.status === "active"
      );
      setAvailablePurchasingCenters(filtered);
      
      // Limpar seleções de centrais de compras se a escola mudou
      setFormData(prev => ({ ...prev, purchasingCenterIds: [] }));
    } else {
      setAvailablePurchasingCenters([]);
      setFormData(prev => ({ ...prev, purchasingCenterIds: [] }));
    }
  }, [formData.schoolId, purchasingCenters]);

  const generatePassword = () => {
    const password = Math.floor(100000 + Math.random() * 900000).toString();
    setFormData(prev => ({ ...prev, password }));
  };

  const handlePurchasingCenterToggle = (centerId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      purchasingCenterIds: checked
        ? [...prev.purchasingCenterIds, centerId]
        : prev.purchasingCenterIds.filter(id => id !== centerId)
    }));
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

    if (!formData.schoolId) {
      toast({
        title: "Escola obrigatória",
        description: "Por favor, selecione uma escola para o usuário.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const userData: SystemUser = {
        name: formData.name,
        matricula: formData.matricula,
        password: formData.password,
        schoolId: formData.schoolId,
        isLinkedToPurchasing: formData.purchasingCenterIds.length > 0,
        purchasingCenterIds: formData.purchasingCenterIds,
        status: "active",
      };

      onSave(userData);
      
      // Reset form
      setFormData({
        name: "",
        matricula: "",
        password: "",
        schoolId: "",
        isLinkedToPurchasing: false,
        purchasingCenterIds: [],
      });
      
      toast({
        title: "Usuário criado",
        description: "O usuário do sistema foi criado com sucesso.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao criar usuário",
        description: "Ocorreu um erro ao criar o usuário.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Novo Usuário do Sistema
          </DialogTitle>
          <DialogDescription>
            Cadastre um novo usuário que terá acesso ao sistema. O usuário deve estar vinculado a uma escola.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="school">Escola *</Label>
            <Select value={formData.schoolId} onValueChange={(value) => setFormData(prev => ({ ...prev, schoolId: value }))}>
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
            <Label htmlFor="password">Senha (6 dígitos) *</Label>
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

          {formData.schoolId && availablePurchasingCenters.length > 0 && (
            <div className="space-y-3">
              <Label>Centrais de Compras Disponíveis</Label>
              <p className="text-sm text-gray-600">
                Selecione as centrais de compras que este usuário terá acesso:
              </p>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
                {availablePurchasingCenters.map((center) => (
                  <div key={center.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`center-${center.id}`}
                      checked={formData.purchasingCenterIds.includes(center.id)}
                      onCheckedChange={(checked) => 
                        handlePurchasingCenterToggle(center.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={`center-${center.id}`} className="text-sm">
                      {center.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.schoolId && availablePurchasingCenters.length === 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                Nenhuma central de compras ativa encontrada para esta escola. 
                O usuário será criado sem vinculação a centrais de compras.
              </p>
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
              {isSubmitting ? "Salvando..." : "Criar Usuário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
