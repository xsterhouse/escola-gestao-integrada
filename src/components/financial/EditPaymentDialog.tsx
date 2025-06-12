
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check, X } from "lucide-react";
import { PaymentAccount } from "@/lib/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface EditPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentAccount | null;
  onSave: (payment: PaymentAccount) => void;
  resourceCategories: string[];
  expenseTypes: string[];
}

export function EditPaymentDialog({ 
  isOpen, 
  onClose, 
  payment,
  onSave,
  resourceCategories,
  expenseTypes
}: EditPaymentDialogProps) {
  const { currentSchool } = useAuth();
  const [formData, setFormData] = useState({
    description: "",
    supplier: "",
    dueDate: new Date(),
    value: "",
    expenseType: "",
    resourceCategory: "",
  });

  useEffect(() => {
    if (payment) {
      setFormData({
        description: payment.description,
        supplier: payment.supplier,
        dueDate: new Date(payment.dueDate),
        value: payment.value.toString(),
        expenseType: payment.expenseType,
        resourceCategory: payment.resourceCategory,
      });
    } else {
      // Reset form for new payment
      setFormData({
        description: "",
        supplier: "",
        dueDate: new Date(),
        value: "",
        expenseType: "",
        resourceCategory: "",
      });
    }
  }, [payment, isOpen]);
  
  const handleSave = () => {
    if (!formData.description) {
      toast.error("Informe uma descrição");
      return;
    }
    
    if (!formData.supplier) {
      toast.error("Informe o fornecedor");
      return;
    }
    
    if (!formData.value || parseFloat(formData.value) <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    
    const paymentData: PaymentAccount = {
      id: payment?.id || `payment_${Date.now()}`,
      schoolId: currentSchool?.id || '',
      description: formData.description,
      supplier: formData.supplier,
      dueDate: formData.dueDate,
      value: parseFloat(formData.value),
      expenseType: formData.expenseType,
      resourceCategory: formData.resourceCategory,
      status: payment?.status || 'a_pagar',
      createdAt: payment?.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    onSave(paymentData);
    onClose();
  };
  
  const isNewPayment = !payment;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isNewPayment ? "Nova Conta a Pagar" : "Editar Conta a Pagar"}
          </DialogTitle>
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
              <Label htmlFor="supplier">Fornecedor</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                placeholder="Informe o fornecedor"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Data de Vencimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? format(formData.dueDate, 'dd/MM/yyyy') : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => date && setFormData({...formData, dueDate: date})}
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
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expenseType">Tipo de Despesa</Label>
              <Select 
                value={formData.expenseType} 
                onValueChange={(value) => setFormData({...formData, expenseType: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {expenseTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="resourceCategory">Categoria de Recurso</Label>
              <Select 
                value={formData.resourceCategory} 
                onValueChange={(value) => setFormData({...formData, resourceCategory: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {resourceCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Check className="mr-2 h-4 w-4" />
            {isNewPayment ? "Criar" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
