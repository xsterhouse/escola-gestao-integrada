import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Check, FileText } from "lucide-react";
import { PlanItem } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generatePlanningReportPDF } from "@/lib/pdf-utils";

interface PlanningFormProps {}

const unitOptions = ["kg", "unidade", "litros", "pacote", "caixa", "lata", "dúzia"];

const PlanningForm: React.FC<PlanningFormProps> = () => {
  const { user, currentSchool } = useAuth();
  const [items, setItems] = useState<PlanItem[]>([]);
  const [item, setItem] = useState<Omit<PlanItem, "id">>({
    name: "",
    quantity: 0,
    unit: "",
    description: "",
  });
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [ataNumber, setAtaNumber] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setItem((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value,
    }));
  };

  const handleUnitChange = (value: string) => {
    setItem((prev) => ({ ...prev, unit: value }));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item.name || !item.quantity || !item.unit) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const newItem: PlanItem = {
      id: uuidv4(),
      ...item,
    };

    setItems((prev) => [...prev, newItem]);
    setItem({ name: "", quantity: 0, unit: "", description: "" });
    
    toast({
      title: "Item adicionado",
      description: `${newItem.name} foi adicionado ao planejamento.`,
    });
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    
    toast({
      title: "Item removido",
      description: "Item removido do planejamento.",
    });
  };

  const handleFinishPlanning = () => {
    if (items.length === 0) {
      toast({
        title: "Nenhum item adicionado",
        description: "Adicione pelo menos um item ao planejamento.",
        variant: "destructive",
      });
      return;
    }

    // Generate ATA number in format ATA-YYYY-XXXX
    const year = new Date().getFullYear();
    const sequence = Math.floor(1000 + Math.random() * 9000); // Simple simulation
    const generatedAtaNumber = `ATA-${year}-${sequence}`;
    
    setAtaNumber(generatedAtaNumber);
    setShowFinishDialog(true);
  };

  const handleConfirmFinish = () => {
    // Here we would save the planning to the backend
    console.log("Finalizing planning with ATA number:", ataNumber);
    
    toast({
      title: "Planejamento finalizado",
      description: `ATA gerada com sucesso: ${ataNumber}`,
    });
    
    setShowFinishDialog(false);
  };

  const handleGenerateReport = () => {
    if (!currentSchool || !user) return;
    
    const reportData = {
      ataNumber,
      schoolName: currentSchool.name,
      userName: user.name,
      date: new Date(),
      items,
    };
    
    generatePlanningReportPDF(reportData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Item ao Planejamento</CardTitle>
        <CardDescription>
          Preencha os detalhes do item que deseja adicionar ao planejamento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddItem} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nome do Item *
              </label>
              <Input
                id="name"
                name="name"
                value={item.name}
                onChange={handleInputChange}
                placeholder="Ex: Arroz"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="quantity" className="text-sm font-medium">
                  Quantidade *
                </label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.quantity || ""}
                  onChange={handleInputChange}
                  placeholder="Ex: 100"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="unit" className="text-sm font-medium">
                  Unidade *
                </label>
                <Select value={item.unit} onValueChange={handleUnitChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {unitOptions.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Descrição
            </label>
            <Textarea
              id="description"
              name="description"
              value={item.description}
              onChange={handleInputChange}
              placeholder="Ex: Arroz branco tipo 1, pacote de 5kg"
              rows={3}
            />
          </div>
          
          <div className="flex justify-between">
            <Button type="submit">
              <Plus size={16} className="mr-2" />
              Adicionar Item
            </Button>
            
            <Button 
              type="button" 
              variant="default" 
              onClick={handleFinishPlanning}
              disabled={items.length === 0}
            >
              <Check size={16} className="mr-2" />
              Finalizar Planejamento
            </Button>
          </div>
        </form>

        {/* Finish Planning Dialog */}
        <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Finalizar Planejamento</DialogTitle>
              <DialogDescription>
                Ao finalizar o planejamento, você não poderá mais adicionar ou editar itens.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Escola:</p>
                <p className="text-sm">{currentSchool?.name}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Usuário Responsável:</p>
                <p className="text-sm">{user?.name}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Data:</p>
                <p className="text-sm">{new Date().toLocaleDateString()}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Número da ATA:</p>
                <p className="text-sm font-bold">{ataNumber}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Total de Itens:</p>
                <p className="text-sm">{items.length}</p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFinishDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmFinish}>
                Confirmar Finalização
              </Button>
              <Button onClick={handleGenerateReport}>
                <FileText size={16} className="mr-2" />
                Gerar Relatório PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PlanningForm;
