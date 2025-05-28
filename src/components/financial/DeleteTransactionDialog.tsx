
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
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { BankTransaction } from "@/lib/types";
import { AlertTriangle } from "lucide-react";

interface DeleteTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: BankTransaction | null;
  onConfirm: (password: string, reason: string) => void;
}

export function DeleteTransactionDialog({
  isOpen,
  onClose,
  transaction,
  onConfirm,
}: DeleteTransactionDialogProps) {
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleConfirm = () => {
    if (!password.trim() || !reason.trim()) {
      return;
    }
    
    onConfirm(password, reason);
    
    setPassword("");
    setReason("");
  };

  const handleClose = () => {
    setPassword("");
    setReason("");
    onClose();
  };

  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Exclusão de Transação
          </DialogTitle>
          <DialogDescription>
            Esta ação é irreversível. Para excluir a transação, forneça sua senha e o motivo da exclusão.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Transação a ser excluída:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <Label className="font-medium">Data</Label>
                <p>{format(new Date(transaction.date), 'dd/MM/yyyy')}</p>
              </div>
              <div>
                <Label className="font-medium">Valor</Label>
                <p className="font-bold">{formatCurrency(transaction.value)}</p>
              </div>
              <div className="col-span-2">
                <Label className="font-medium">Descrição</Label>
                <p>{transaction.description}</p>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="password">Senha *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="reason">Motivo da Exclusão *</Label>
            <Textarea
              id="reason"
              placeholder="Explique o motivo da exclusão da transação..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!password.trim() || !reason.trim()}
            variant="destructive"
          >
            Confirmar Exclusão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
