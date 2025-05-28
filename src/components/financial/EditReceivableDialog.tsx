
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check, X } from "lucide-react";
import { ReceivableAccount } from "@/lib/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EditReceivableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  receivable: ReceivableAccount | null;
  onSave: (receivable: ReceivableAccount) => void;
}

export function EditReceivableDialog({ 
  isOpen, 
  onClose, 
  receivable,
  onSave
}: EditReceivableDialogProps) {
  const [formData, setFormData] = useState({
    description: "",
    origin: "",
    expectedDate: new Date(),
    value: "",
    resourceType: "",
    notes: "",
  });

  useEffect(() => {
    if (receivable) {
      setFormData({
        description: receivable.description,
        origin: receivable.origin,
        expectedDate: new Date(receivable.expectedDate),
        value: receivable.value.toString(),
        resourceType: receivable.resourceType,
        notes: receivable.notes || "",
      });
    }
  }, [receivable]);
  
  const handleSave = () => {
    if (!receivable) return;
    
    if (!formData.description) {
      toast.error("Informe uma descrição");
      return;
    }
    
    if (!formData.origin) {
      toast.error("Informe a origem");
      return;
    }
    
    if (!formData.value || parseFloat(formData.value) <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    
    const updatedReceivable: ReceivableAccount = {
      ...receivable,
      description: formData.description,
      origin: formData.origin,
      expectedDate: formData.expectedDate,
      value: parseFloat(formData.value),
      resourceType: formData.resourceType,
      notes: formData.notes,
      updatedAt: new Date()
    };
    
    onSave(updatedReceivable);
    onClose();
    toast.success("Conta a receber atualizada com sucesso!");
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Editar Conta a Receber</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Informe a descrição"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">Origem</Label>
              <Input
                id="origin"
                value={formData.origin}
                onChange={(e) => setFormData({...formData, origin: e.target.value})}
                placeholder="Informe a origem"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expectedDate">Data Prevista</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.expectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expectedDate ? format(formData.expectedDate, 'dd/MM/yyyy') : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.expectedDate}
                    onSelect={(date) => date && setFormData({...formData, expectedDate: date})}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="value">Valor</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              min="0"
              value={formData.value}
              onChange={(e) => setFormData({...formData, value: e.target.value})}
              placeholder="0,00"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="resourceType">Tipo de Recurso</Label>
            <Select 
              value={formData.resourceType} 
              onValueChange={(value) => setFormData({...formData, resourceType: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PNAE">PNAE</SelectItem>
                <SelectItem value="PNATE">PNATE</SelectItem>
                <SelectItem value="Recursos Próprios">Recursos Próprios</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Observações (opcional)"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Check className="mr-2 h-4 w-4" />
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
