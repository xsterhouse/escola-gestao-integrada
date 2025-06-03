
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";
import { Trash } from "lucide-react";

export function PurchasingCenterTab() {
  const [open, setOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<PurchasingCenter | null>(null);
  const { toast } = useToast();
  const { data: centers, saveData: setCenters } = useLocalStorageSync<PurchasingCenter>('purchasing-centers', []);

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

  const handleOpen = () => {
    setEditingCenter(null);
    setOpen(true);
  };

  const handleEdit = (center: PurchasingCenter) => {
    setEditingCenter(center);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCenter(null);
    setFormData({
      name: "",
      description: "",
    });
  };

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

    if (editingCenter) {
      const updatedCenters = centers.map(center =>
        center.id === editingCenter.id ? centerData : center
      );
      setCenters(updatedCenters);
      toast({
        title: "Central atualizada",
        description: "Central de compras atualizada com sucesso.",
      });
    } else {
      setCenters([...centers, centerData]);
      toast({
        title: "Central criada",
        description: "Central de compras criada com sucesso.",
      });
    }

    handleClose();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta central?")) {
      const updatedCenters = centers.filter(center => center.id !== id);
      setCenters(updatedCenters);
      toast({
        title: "Central excluída",
        description: "Central de compras excluída com sucesso.",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Centrais de Compras</h2>
        <Button onClick={handleOpen}>Adicionar Central</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {centers.map(center => (
            <TableRow key={center.id}>
              <TableCell className="font-medium">{center.name}</TableCell>
              <TableCell>{center.description}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(center)}>
                  Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(center.id)}>
                  <Trash className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
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
    </div>
  );
}
