
import { useState } from "react";
import { PurchasingCenter } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";
import { PurchasingCenterForm } from "./PurchasingCenterForm";
import { PurchasingCenterTable } from "./PurchasingCenterTable";

export function PurchasingCenterTab() {
  const [open, setOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<PurchasingCenter | null>(null);
  const { toast } = useToast();
  const { data: centers, saveData: setCenters } = useLocalStorageSync<PurchasingCenter>('purchasing-centers', []);

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
  };

  const handleSave = (centerData: PurchasingCenter) => {
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

      <PurchasingCenterTable
        centers={centers}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <PurchasingCenterForm
        open={open}
        editingCenter={editingCenter}
        onClose={handleClose}
        onSave={handleSave}
      />
    </div>
  );
}
