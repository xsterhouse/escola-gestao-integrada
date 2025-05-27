
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ReceivableAccount } from "@/lib/types";

interface EditReceivableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  account: ReceivableAccount | null;
  onSave: (updatedAccount: ReceivableAccount) => void;
}

export function EditReceivableDialog({
  isOpen,
  onClose,
  account,
  onSave,
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
    if (account) {
      setFormData({
        description: account.description,
        origin: account.origin,
        expectedDate: new Date(account.expectedDate),
        value: account.value.toString(),
        resourceType: account.resourceType,
        notes: account.notes || "",
      });
    }
  }, [account]);

  const handleSave = () => {
    if (account) {
      const updatedAccount: ReceivableAccount = {
        ...account,
        description: formData.description,
        origin: formData.origin,
        expectedDate: formData.expectedDate,
        value: parseFloat(formData.value),
        resourceType: formData.resourceType,
        notes: formData.notes,
        updatedAt: new Date(),
      };
      
      onSave(updatedAccount);
      onClose();
    }
  };

  if (!account) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Conta a Receber</DialogTitle>
          <DialogDescription>
            Altere os dados da receita conforme necessário.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Input 
                id="description" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="origin">Origem</Label>
              <Input 
                id="origin" 
                value={formData.origin}
                onChange={(e) => setFormData({...formData, origin: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="expectedDate">Data Prevista</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal`}
                  >
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
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="value">Valor</Label>
              <Input 
                id="value" 
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="resourceType">Tipo de Recurso</Label>
              <Select 
                value={formData.resourceType} 
                onValueChange={(value) => setFormData({...formData, resourceType: value})}
              >
                <SelectTrigger id="resourceType">
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
          </div>
          
          <div>
            <Label htmlFor="notes">Observações</Label>
            <Input 
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
