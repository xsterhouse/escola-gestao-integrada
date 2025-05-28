
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
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { PaymentAccount, BankAccount } from "@/lib/types";
import { AlertTriangle } from "lucide-react";

interface DuplicatePaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  account: PaymentAccount | null;
  bankAccounts: BankAccount[];
  onConfirm: (paymentData: { bankAccountId: string }, justification: string) => void;
}

export function DuplicatePaymentDialog({
  isOpen,
  onClose,
  account,
  bankAccounts,
  onConfirm,
}: DuplicatePaymentDialogProps) {
  const [selectedBankAccount, setSelectedBankAccount] = useState("");
  const [justification, setJustification] = useState("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleConfirm = () => {
    if (!selectedBankAccount || !justification.trim()) {
      return;
    }
    
    onConfirm({ bankAccountId: selectedBankAccount }, justification);
    
    setSelectedBankAccount("");
    setJustification("");
  };

  const handleClose = () => {
    setSelectedBankAccount("");
    setJustification("");
    onClose();
  };

  if (!account) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            Pagamento Duplicado Detectado
          </DialogTitle>
          <DialogDescription>
            Foi detectado que já existe um pagamento similar para este fornecedor. 
            Para prosseguir com o pagamento duplicado, forneça uma justificativa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="font-medium">Descrição</Label>
                <p>{account.description}</p>
              </div>
              <div>
                <Label className="font-medium">Fornecedor</Label>
                <p>{account.supplier}</p>
              </div>
              <div>
                <Label className="font-medium">Valor</Label>
                <p>{formatCurrency(account.value)}</p>
              </div>
              <div>
                <Label className="font-medium">Vencimento</Label>
                <p>{format(new Date(account.dueDate), 'dd/MM/yyyy')}</p>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="justification">Justificativa para Pagamento Duplicado *</Label>
            <Textarea
              id="justification"
              placeholder="Explique o motivo do pagamento duplicado..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="mt-1"
              rows={3}
            />
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
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedBankAccount || !justification.trim()}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Confirmar Pagamento Duplicado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
