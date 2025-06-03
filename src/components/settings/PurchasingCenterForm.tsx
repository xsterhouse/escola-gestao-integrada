
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { PurchasingCenter } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

type PurchasingCenterFormProps = {
  open: boolean;
  editingCenter: PurchasingCenter | null;
  onClose: () => void;
  onSave: (center: PurchasingCenter) => void;
};

export function PurchasingCenterForm({
  open,
  editingCenter,
  onClose,
  onSave,
}: PurchasingCenterFormProps) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (editingCenter) {
      setFormData({
        name: editingCenter.name,
        description: editingCenter.description || "",
        email: editingCenter.email || "",
        password: "",
        confirmPassword: "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [editingCenter]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da central é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Erro",
        description: "E-mail é obrigatório para acesso ao sistema.",
        variant: "destructive",
      });
      return;
    }

    if (!editingCenter && !formData.password.trim()) {
      toast({
        title: "Erro",
        description: "Senha é obrigatória para nova central.",
        variant: "destructive",
      });
      return;
    }

    if (!editingCenter && formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "Senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (!editingCenter && formData.password.length < 6) {
      toast({
        title: "Erro",
        description: "Senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    const centerData: PurchasingCenter = {
      id: editingCenter?.id || uuidv4(),
      name: formData.name,
      code: formData.name.replace(/\s+/g, '').substring(0, 10).toUpperCase(),
      description: formData.description,
      email: formData.email,
      password: formData.password || editingCenter?.password || "",
      schoolIds: editingCenter?.schoolIds || [],
      status: "active",
      createdAt: editingCenter?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(centerData);
  };

  const handleClose = () => {
    onClose();
    setFormData({
      name: "",
      description: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingCenter ? "Editar Central" : "Nova Central"}</DialogTitle>
          <DialogDescription>
            {editingCenter
              ? "Atualize os dados da central de compras."
              : "Cadastre uma nova central de compras no sistema. Esta central terá acesso ao sistema com suas próprias credenciais."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Central *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nome da central"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descrição da central"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail de Acesso *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@exemplo.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {editingCenter ? "Nova Senha (deixe em branco para manter atual)" : "Senha *"}
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Senha mínima 6 caracteres"
                required={!editingCenter}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {!editingCenter && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {editingCenter ? "Atualizar" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
