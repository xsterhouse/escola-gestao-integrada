
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";

interface SystemUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => void;
  schools: any[];
}

interface PurchasingCenter {
  id: string;
  name: string;
  schoolIds?: string[];
}

export function SystemUserForm({ isOpen, onClose, onSave, schools }: SystemUserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    matricula: "",
    password: "",
    confirmPassword: "",
    schoolId: "",
    purchasingCenterIds: [] as string[],
    isLinkedToPurchasing: false,
    status: "active" as "active" | "blocked"
  });

  const { data: purchasingCenters } = useLocalStorageSync<PurchasingCenter>('purchasing-centers', []);

  // Filter purchasing centers based on selected school
  const availablePurchasingCenters = purchasingCenters.filter(center => 
    formData.schoolId ? center.schoolIds?.includes(formData.schoolId) : true
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSchoolChange = (schoolId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      schoolId,
      purchasingCenterIds: [], // Reset purchasing centers when school changes
      isLinkedToPurchasing: false
    }));
  };

  const handlePurchasingCenterChange = (centerId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      purchasingCenterIds: checked 
        ? [...prev.purchasingCenterIds, centerId]
        : prev.purchasingCenterIds.filter(id => id !== centerId),
      isLinkedToPurchasing: checked || prev.purchasingCenterIds.length > 1 || (prev.purchasingCenterIds.length === 1 && !prev.purchasingCenterIds.includes(centerId))
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert("Nome é obrigatório");
      return;
    }

    if (!formData.matricula.trim()) {
      alert("Matrícula é obrigatória");
      return;
    }

    if (!formData.password.trim()) {
      alert("Senha é obrigatória");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Senhas não coincidem");
      return;
    }

    if (formData.password.length < 6) {
      alert("Senha deve ter pelo menos 6 caracteres");
      return;
    }

    onSave(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: "",
      matricula: "",
      password: "",
      confirmPassword: "",
      schoolId: "",
      purchasingCenterIds: [],
      isLinkedToPurchasing: false,
      status: "active"
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Usuário do Sistema</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nome completo do usuário"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="matricula">Matrícula *</Label>
            <Input
              id="matricula"
              name="matricula"
              value={formData.matricula}
              onChange={handleInputChange}
              placeholder="Matrícula do usuário"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="school">Escola</Label>
            <Select value={formData.schoolId} onValueChange={handleSchoolChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma escola (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma escola</SelectItem>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.schoolId && availablePurchasingCenters.length > 0 && (
            <div className="space-y-2">
              <Label>Centrais de Compras</Label>
              <div className="space-y-2 border rounded-md p-3">
                {availablePurchasingCenters.map((center) => (
                  <div key={center.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`center-${center.id}`}
                      checked={formData.purchasingCenterIds.includes(center.id)}
                      onCheckedChange={(checked) => 
                        handlePurchasingCenterChange(center.id, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`center-${center.id}`}
                      className="text-sm font-normal"
                    >
                      {center.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Senha mínima 6 caracteres"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirme a senha"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Criar Usuário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
