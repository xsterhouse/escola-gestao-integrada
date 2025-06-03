
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
  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    responsible: "",
    address: "",
    city: "",
    description: "",
  });

  useEffect(() => {
    if (editingCenter) {
      setFormData({
        name: editingCenter.name,
        cnpj: editingCenter.cnpj || "",
        responsible: editingCenter.responsible || "",
        address: editingCenter.address || "",
        city: editingCenter.city || "",
        description: editingCenter.description || "",
      });
    } else {
      setFormData({
        name: "",
        cnpj: "",
        responsible: "",
        address: "",
        city: "",
        description: "",
      });
    }
  }, [editingCenter]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatCNPJ = (value: string) => {
    // Remove tudo que não é dígito
    const cleanValue = value.replace(/\D/g, '');
    
    // Aplica a máscara XX.XXX.XXX/XXXX-XX
    if (cleanValue.length <= 14) {
      return cleanValue
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return value;
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formattedValue = formatCNPJ(value);
    setFormData(prev => ({ ...prev, cnpj: formattedValue }));
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

    if (!formData.cnpj.trim()) {
      toast({
        title: "Erro",
        description: "CNPJ é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.responsible.trim()) {
      toast({
        title: "Erro",
        description: "Responsável é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.address.trim()) {
      toast({
        title: "Erro",
        description: "Endereço é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.city.trim()) {
      toast({
        title: "Erro",
        description: "Cidade é obrigatória.",
        variant: "destructive",
      });
      return;
    }

    const centerData: PurchasingCenter = {
      id: editingCenter?.id || uuidv4(),
      name: formData.name,
      code: formData.name.replace(/\s+/g, '').substring(0, 10).toUpperCase(),
      cnpj: formData.cnpj,
      responsible: formData.responsible,
      address: formData.address,
      city: formData.city,
      description: formData.description,
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
      cnpj: "",
      responsible: "",
      address: "",
      city: "",
      description: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingCenter ? "Editar Central" : "Nova Central"}</DialogTitle>
          <DialogDescription>
            {editingCenter
              ? "Atualize os dados da central de compras."
              : "Cadastre uma nova central de compras no sistema."}
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
            <Label htmlFor="cnpj">CNPJ *</Label>
            <Input
              id="cnpj"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleCNPJChange}
              placeholder="XX.XXX.XXX/XXXX-XX"
              maxLength={18}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsible">Responsável *</Label>
            <Input
              id="responsible"
              name="responsible"
              value={formData.responsible}
              onChange={handleChange}
              placeholder="Nome do responsável"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço *</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Endereço completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade *</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Cidade"
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
