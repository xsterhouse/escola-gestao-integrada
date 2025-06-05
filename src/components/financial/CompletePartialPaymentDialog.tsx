
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReceivableAccount, BankAccount } from "@/lib/types";
import { toast } from "sonner";

interface CompletePartialPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  receivable: ReceivableAccount | null;
  bankAccounts: BankAccount[];
  onConfirm: (data: { bankAccountId: string; remainingAmount: number }) => void;
}

export function CompletePartialPaymentDialog({
  isOpen,
  onClose,
  receivable,
  bankAccounts,
  onConfirm,
}: CompletePartialPaymentDialogProps) {
  const [selectedBankAccount, setSelectedBankAccount] = useState("");
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleConfirm = () => {
    if (!selectedBankAccount) {
      toast.error("Selecione uma conta bancária");
      return;
    }

    if (!receivable) return;

    const originalValue = receivable.originalValue || receivable.value;
    const receivedAmount = receivable.receivedAmount || 0;
    const remainingAmount = originalValue - receivedAmount;

    onConfirm({
      bankAccountId: selectedBankAccount,
      remainingAmount,
    });
  };

  if (!receivable) return null;

  const originalValue = receivable.originalValue || receivable.value;
  const receivedAmount = receivable.receivedAmount || 0;
  const remainingAmount = originalValue - receivedAmount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Quitar Pagamento Parcial</DialogTitle>
          <DialogDescription>
            Complete o pagamento do valor restante desta receita.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Valor Original</Label>
              <div className="p-2 bg-gray-50 rounded border">
                {formatCurrency(originalValue)}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Já Recebido</Label>
              <div className="p-2 bg-green-50 text-green-700 rounded border">
                {formatCurrency(receivedAmount)}
              </div>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-orange-600">Valor a Receber</Label>
            <div className="p-3 bg-orange-50 text-orange-700 rounded border text-lg font-semibold">
              {formatCurrency(remainingAmount)}
            </div>
          </div>
          
          <div>
            <Label htmlFor="bank-account">Conta Bancária de Destino</Label>
            <Select value={selectedBankAccount} onValueChange={setSelectedBankAccount}>
              <SelectTrigger id="bank-account">
                <SelectValue placeholder="Selecione a conta bancária" />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.bankName} - {account.accountType === 'movimento' ? 'Movimento' : 'Aplicação'}
                    {account.managementType && ` (${account.managementType})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Descrição</Label>
            <div className="p-2 bg-gray-50 rounded border text-sm">
              {receivable.description} - Quitação do Saldo Restante
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
            Confirmar Quitação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
