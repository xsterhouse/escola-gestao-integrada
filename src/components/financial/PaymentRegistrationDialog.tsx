
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { PaymentAccount, BankAccount } from "@/lib/types";

interface PaymentRegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  account: PaymentAccount | null;
  bankAccounts: BankAccount[];
  onConfirm: (paymentData: { bankAccountId: string }) => void;
}

export function PaymentRegistrationDialog({
  isOpen,
  onClose,
  account,
  bankAccounts,
  onConfirm,
}: PaymentRegistrationDialogProps) {
  const [selectedBankAccount, setSelectedBankAccount] = useState("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleConfirm = () => {
    if (!selectedBankAccount) {
      return;
    }

    onConfirm({ bankAccountId: selectedBankAccount });
    setSelectedBankAccount("");
  };

  const handleClose = () => {
    setSelectedBankAccount("");
    onClose();
  };

  if (!account) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
          <DialogDescription>
            Confirme os detalhes e selecione a conta bancária para registrar o pagamento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Descrição</Label>
              <Input value={account.description} readOnly />
            </div>
            <div>
              <Label>Fornecedor</Label>
              <Input value={account.supplier} readOnly />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Vencimento</Label>
              <Input value={format(new Date(account.dueDate), 'dd/MM/yyyy')} readOnly />
            </div>
            <div>
              <Label>Valor</Label>
              <Input value={formatCurrency(account.value)} readOnly />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data de Pagamento</Label>
              <Input value={format(new Date(), 'dd/MM/yyyy')} readOnly />
            </div>
            <div>
              <Label htmlFor="bankAccount">Conta Bancária *</Label>
              <Select value={selectedBankAccount} onValueChange={setSelectedBankAccount}>
                <SelectTrigger id="bankAccount">
                  <SelectValue placeholder="Selecione a conta bancária" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.filter(account => account.id && account.bankName).map(bankAccount => (
                    <SelectItem key={bankAccount.id} value={bankAccount.id}>
                      {bankAccount.bankName} - {bankAccount.accountType === 'movimento' ? 'Movimento' : 'Aplicação'}
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

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedBankAccount}>
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
