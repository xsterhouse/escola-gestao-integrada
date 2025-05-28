
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface ReceiptRegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  account: ReceivableAccount | null;
  bankAccounts: BankAccount[];
  onConfirm: (receiptData: { 
    bankAccountId: string; 
    isPartial: boolean; 
    partialAmount?: number; 
    remainingBalance?: number;
  }) => void;
}

export function ReceiptRegistrationDialog({
  isOpen,
  onClose,
  account,
  bankAccounts,
  onConfirm,
}: ReceiptRegistrationDialogProps) {
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>("");
  const [isPartialPayment, setIsPartialPayment] = useState<boolean>(false);
  const [partialAmount, setPartialAmount] = useState<string>("");

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

    if (!account) return;

    if (isPartialPayment) {
      const partial = parseFloat(partialAmount);
      if (!partial || partial <= 0 || partial > account.value) {
        toast.error("Valor parcial inválido");
        return;
      }
      
      const remainingBalance = account.value - partial;
      onConfirm({ 
        bankAccountId: selectedBankAccount, 
        isPartial: true, 
        partialAmount: partial,
        remainingBalance 
      });
    } else {
      onConfirm({ 
        bankAccountId: selectedBankAccount, 
        isPartial: false 
      });
    }
    
    setSelectedBankAccount("");
    setIsPartialPayment(false);
    setPartialAmount("");
  };

  // Get selected bank account details
  const selectedAccountData = bankAccounts.find(acc => acc.id === selectedBankAccount);

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
                <Label>Valor Total</Label>
                <Input value={formatCurrency(account.value)} readOnly />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="partialPayment"
                  checked={isPartialPayment}
                  onCheckedChange={(checked) => setIsPartialPayment(checked as boolean)}
                />
                <Label htmlFor="partialPayment">Recebimento Parcial</Label>
              </div>

              {isPartialPayment && (
                <div className="space-y-2">
                  <Label htmlFor="partialAmount">Valor a Receber</Label>
                  <Input
                    id="partialAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={account.value}
                    value={partialAmount}
                    onChange={(e) => setPartialAmount(e.target.value)}
                    placeholder="Digite o valor parcial"
                  />
                  {partialAmount && parseFloat(partialAmount) > 0 && parseFloat(partialAmount) < account.value && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-700">
                        <strong>Saldo Restante:</strong> {formatCurrency(account.value - parseFloat(partialAmount))}
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        Uma nova conta a receber será criada automaticamente para o saldo restante.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data de Recebimento</Label>
                <Input value={format(new Date(), 'dd/MM/yyyy')} readOnly />
              </div>
              <div>
                <Label htmlFor="bankAccount">Conta Bancária *</Label>
                <Select value={selectedBankAccount} onValueChange={setSelectedBankAccount}>
                  <SelectTrigger id="bankAccount" className={selectedBankAccount ? "ring-2 ring-blue-500 bg-blue-50" : ""}>
                    <SelectValue placeholder="Selecione a conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.bankName} - {account.description} ({account.managementType || 'Sem gestão'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedAccountData && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-800">
                      {selectedAccountData.bankName}
                    </p>
                    <p className="text-sm text-blue-600">
                      <span className="font-medium">Tipo:</span> {selectedAccountData.accountType === 'movimento' ? 'Movimento' : 'Aplicação'}
                    </p>
                    <p className="text-sm text-blue-600">
                      <span className="font-medium">Gestão:</span> {selectedAccountData.managementType || 'Não informado'}
                    </p>
                    <p className="text-sm text-blue-600">
                      <span className="font-medium">Saldo Atual:</span> {formatCurrency(selectedAccountData.currentBalance)}
                    </p>
                    {selectedAccountData.description && (
                      <p className="text-sm text-blue-600">
                        <span className="font-medium">Descrição:</span> {selectedAccountData.description}
                      </p>
                    )}
                  </div>
                )}
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
