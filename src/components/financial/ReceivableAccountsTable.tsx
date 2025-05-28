
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
import { Edit2, Trash2, CheckCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ReceivableAccountsTableProps {
  accounts: ReceivableAccount[];
  onEditReceivable: (account: ReceivableAccount) => void;
  onDeleteReceivable: (account: ReceivableAccount) => void;
  onOpenReceiptConfirm: (account: ReceivableAccount) => void;
}

export function ReceivableAccountsTable({
  accounts,
  onEditReceivable,
  onDeleteReceivable,
  onOpenReceiptConfirm,
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
              <TableCell colSpan={6} className="text-center">
                Nenhuma conta encontrada.
              </TableCell>
            </TableRow>
          ) : (
            accounts.map(account => {
              const originalValue = account.originalValue || account.value;
              const receivedAmount = account.receivedAmount || (account.status === 'recebido' ? account.value : 0);
              const remainingAmount = originalValue - receivedAmount;
              
              return (
                <TableRow key={account.id}>
                  <TableCell>{format(new Date(account.expectedDate), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{formatCurrency(originalValue)}</TableCell>
                  <TableCell className="text-green-600 font-medium">
                    {formatCurrency(receivedAmount)}
                  </TableCell>
                  <TableCell className="text-amber-600 font-medium">
                    {formatCurrency(remainingAmount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        account.status === 'recebido' ? 'bg-green-500' : 'bg-amber-500'
                      }`} />
                      <span className={account.status === 'recebido' ? 'text-green-600' : 'text-amber-600'}>
                        {account.status === 'recebido' ? 'Recebido' : 'Pendente'}
                      </span>
                      {account.isPartialPayment && (
                        <Badge variant="outline" className="text-xs">
                          <Info className="h-3 w-3 mr-1" />
                          Parcial
                        </Badge>
                      )}
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
