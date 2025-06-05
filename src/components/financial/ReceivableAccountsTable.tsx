
import { ReceivableAccount } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Edit2, Trash2, CheckCircle, Info, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PartialPaymentBadge } from "./PartialPaymentBadge";

interface ReceivableAccountsTableProps {
  accounts: ReceivableAccount[];
  onEditReceivable: (account: ReceivableAccount) => void;
  onDeleteReceivable: (account: ReceivableAccount) => void;
  onOpenReceiptConfirm: (account: ReceivableAccount) => void;
  onCompletePartialPayment?: (account: ReceivableAccount) => void;
}

export function ReceivableAccountsTable({
  accounts,
  onEditReceivable,
  onDeleteReceivable,
  onOpenReceiptConfirm,
  onCompletePartialPayment,
}: ReceivableAccountsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data Prevista</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Valor Original</TableHead>
            <TableHead>Valor Recebido</TableHead>
            <TableHead>Saldo Restante</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                Nenhuma conta encontrada.
              </TableCell>
            </TableRow>
          ) : (
            accounts.map(account => {
              const originalValue = account.originalValue || account.value;
              const receivedAmount = account.receivedAmount || (account.status === 'recebido' ? account.value : 0);
              const remainingAmount = originalValue - receivedAmount;
              const isPartialPayment = account.isPartialPayment && remainingAmount > 0;
              
              return (
                <TableRow key={account.id}>
                  <TableCell>{format(new Date(account.expectedDate), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{account.description}</span>
                      {isPartialPayment && <PartialPaymentBadge />}
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(originalValue)}</TableCell>
                  <TableCell className="text-green-600 font-medium">
                    {formatCurrency(receivedAmount)}
                  </TableCell>
                  <TableCell className={remainingAmount > 0 ? "text-amber-600 font-medium" : "text-gray-500"}>
                    {formatCurrency(remainingAmount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        account.status === 'recebido' && remainingAmount === 0 
                          ? 'bg-green-500' 
                          : isPartialPayment 
                            ? 'bg-orange-500'
                            : 'bg-amber-500'
                      }`} />
                      <span className={
                        account.status === 'recebido' && remainingAmount === 0 
                          ? 'text-green-600' 
                          : isPartialPayment 
                            ? 'text-orange-600'
                            : 'text-amber-600'
                      }>
                        {account.status === 'recebido' && remainingAmount === 0 
                          ? 'Quitado' 
                          : isPartialPayment 
                            ? 'Pgt Parcial'
                            : 'Pendente'
                        }
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {account.status === 'pendente' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onOpenReceiptConfirm(account)}
                          title="Registrar Recebimento"
                          className="h-8 w-8"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {isPartialPayment && onCompletePartialPayment && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onCompletePartialPayment(account)}
                          title="Quitar Saldo Restante"
                          className="h-8 w-8 text-orange-600 hover:text-orange-700"
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onEditReceivable(account)}
                        title="Editar"
                        className="h-8 w-8"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onDeleteReceivable(account)}
                        title={account.status === 'recebido' ? 'Remover Recebimento' : 'Excluir'}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
