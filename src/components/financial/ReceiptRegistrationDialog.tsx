
import { useState } from "react";
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
import { ReceivableAccount, BankAccount } from "@/lib/types";
import { format } from "date-fns";

interface ReceiptRegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  account: ReceivableAccount | null;
  bankAccounts: BankAccount[];
  onConfirm: (receiptData: { bankAccountId: string }) => void;
}

export function ReceiptRegistrationDialog({
  isOpen,
  onClose,
  account,
  bankAccounts,
  onConfirm,
}: ReceiptRegistrationDialogProps) {
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleConfirm = () => {
    if (selectedBankAccount) {
      onConfirm({ bankAccountId: selectedBankAccount });
      setSelectedBankAccount("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Recebimento</DialogTitle>
          <DialogDescription>
            Confirme os detalhes para registrar o recebimento.
          </DialogDescription>
        </DialogHeader>
        
        {account && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Descrição</Label>
                <Input value={account.description} readOnly />
              </div>
              <div>
                <Label>Origem</Label>
                <Input value={account.origin} readOnly />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data Prevista</Label>
                <Input value={format(new Date(account.expectedDate), 'dd/MM/yyyy')} readOnly />
              </div>
              <div>
                <Label>Valor</Label>
                <Input value={formatCurrency(account.value)} readOnly />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data de Recebimento</Label>
                <Input value={format(new Date(), 'dd/MM/yyyy')} readOnly />
              </div>
              <div>
                <Label htmlFor="bankAccount">Conta Bancária *</Label>
                <Select value={selectedBankAccount} onValueChange={setSelectedBankAccount}>
                  <SelectTrigger id="bankAccount">
                    <SelectValue placeholder="Selecione a conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.bankName} - {account.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="attachment">Anexar Comprovante (opcional)</Label>
              <Input id="attachment" type="file" />
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={!selectedBankAccount}>
            Confirmar Recebimento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
