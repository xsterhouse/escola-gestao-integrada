
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
    description: "",
  });

  useEffect(() => {
    if (editingCenter) {
      setFormData({
        name: editingCenter.name,
        description: editingCenter.description || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
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

    const centerData: PurchasingCenter = {
      id: editingCenter?.id || uuidv4(),
      name: formData.name,
      code: formData.name.replace(/\s+/g, '').substring(0, 10).toUpperCase(),
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
      description: "",
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
