import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check, X } from "lucide-react";
import { BankAccount, BankTransaction } from "@/lib/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankAccounts: BankAccount[];
  onSave: (transaction: BankTransaction) => void;
}

export function NewTransactionModal({ 
  isOpen, 
  onClose, 
  bankAccounts,
  onSave 
}: NewTransactionModalProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [bankAccountId, setBankAccountId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [transactionType, setTransactionType] = useState<"credito" | "debito">("credito");
  
  // Filter bank accounts to ensure no empty IDs
  const validBankAccounts = bankAccounts.filter(account => 
    account.id && account.id.trim() !== '' && account.bankName && account.accountNumber
  );
  
  const handleSave = () => {
    if (!bankAccountId) {
      toast.error("Selecione uma conta bancária");
      return;
    }
    
    if (!description) {
      toast.error("Informe uma descrição para o lançamento");
      return;
    }
    
    if (!value || parseFloat(value) <= 0) {
      toast.error("Informe um valor válido para o lançamento");
      return;
    }
    
    // Create the new transaction
    const newTransaction: BankTransaction = {
      id: uuidv4(),
      schoolId: "current-school-id", // This should come from context in a real app
      bankAccountId,
      date,
      description,
      value: parseFloat(value),
      transactionType,
      reconciliationStatus: "nao_conciliado",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    onSave(newTransaction);
    toast.success("Lançamento criado com sucesso!");
    resetForm();
    onClose();
  };
  
  const resetForm = () => {
    setDate(new Date());
    setBankAccountId("");
    setDescription("");
    setValue("");
    setTransactionType("credito");
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Novo Lançamento Bancário</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'dd/MM/yyyy') : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bankAccount">Conta Bancária</Label>
              <Select value={bankAccountId} onValueChange={setBankAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {validBankAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.bankName} - {account.accountNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Informe uma descrição para o lançamento"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Valor</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                min="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0,00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={transactionType} onValueChange={(value: "credito" | "debito") => setTransactionType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credito">Crédito</SelectItem>
                  <SelectItem value="debito">Débito</SelectItem>
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
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
