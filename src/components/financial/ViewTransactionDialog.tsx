
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { BankTransaction } from "@/lib/types";
import { AlertTriangle } from "lucide-react";

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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes da Transação</DialogTitle>
          <DialogDescription>
            Visualize os detalhes completos da transação bancária.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {transaction.source === 'payment' && transaction.isDuplicate && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-700 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Pagamento em Duplicidade</span>
              </div>
              {transaction.duplicateJustification && (
                <p className="text-sm text-amber-600">
                  <strong>Justificativa:</strong> {transaction.duplicateJustification}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">Data</Label>
              <p>{format(new Date(transaction.date), 'dd/MM/yyyy')}</p>
            </div>
            <div>
              <Label className="font-medium">Tipo</Label>
              <p className={transaction.transactionType === 'credito' ? 'text-green-600' : 'text-red-600'}>
                {transaction.transactionType === 'credito' ? 'Crédito' : 'Débito'}
              </p>
            </div>
          </div>

          <div>
            <Label className="font-medium">Descrição</Label>
            <p>{transaction.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">Valor</Label>
              <p className={`font-bold ${transaction.transactionType === 'credito' ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(transaction.value)}
              </p>
            </div>
            <div>
              <Label className="font-medium">Status de Conciliação</Label>
              <p className={transaction.reconciliationStatus === 'conciliado' ? 'text-green-600' : 'text-amber-600'}>
                {transaction.reconciliationStatus === 'conciliado' ? 'Conciliado' : 'Pendente'}
              </p>
            </div>
          </div>

          {transaction.category && (
            <div>
              <Label className="font-medium">Categoria</Label>
              <p>{transaction.category}</p>
            </div>
          )}

          {transaction.resourceType && (
            <div>
              <Label className="font-medium">Tipo de Recurso</Label>
              <p>{transaction.resourceType}</p>
            </div>
          )}

          {transaction.source && (
            <div>
              <Label className="font-medium">Origem</Label>
              <p>{transaction.source === 'payment' ? 'Pagamento' : transaction.source === 'receivable' ? 'Recebimento' : 'Manual'}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">Criado em</Label>
              <p>{format(new Date(transaction.createdAt), 'dd/MM/yyyy HH:mm')}</p>
            </div>
            <div>
              <Label className="font-medium">Atualizado em</Label>
              <p>{format(new Date(transaction.updatedAt), 'dd/MM/yyyy HH:mm')}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
