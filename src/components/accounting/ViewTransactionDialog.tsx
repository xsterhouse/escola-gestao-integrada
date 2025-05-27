
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
import { format } from "date-fns";

interface BankTransaction {
  id: string;
  date: string;
  description: string;
  value: number;
  type: 'debit' | 'credit';
  reconciled: boolean;
  accountingEntryId?: string;
}

interface ViewTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: BankTransaction | null;
}

export function ViewTransactionDialog({
  isOpen,
  onClose,
  transaction,
}: ViewTransactionDialogProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes da Transação</DialogTitle>
          <DialogDescription>
            Visualize as informações completas da transação bancária.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data</Label>
              <Input value={format(new Date(transaction.date), 'dd/MM/yyyy')} readOnly />
            </div>
            <div>
              <Label>Tipo</Label>
              <Input value={transaction.type === 'credit' ? 'Crédito' : 'Débito'} readOnly />
            </div>
          </div>
          
          <div>
            <Label>Descrição</Label>
            <Input value={transaction.description} readOnly />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valor</Label>
              <Input 
                value={formatCurrency(transaction.value)} 
                readOnly 
                className={transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Input value={transaction.reconciled ? 'Conciliada' : 'Pendente'} readOnly />
            </div>
          </div>
          
          {transaction.accountingEntryId && (
            <div>
              <Label>Lançamento Vinculado</Label>
              <Input value={`#${transaction.accountingEntryId}`} readOnly />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
