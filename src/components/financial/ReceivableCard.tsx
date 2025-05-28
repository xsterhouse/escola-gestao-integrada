
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReceivableAccount } from "@/lib/types";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Calendar, DollarSign, Building } from "lucide-react";
import { ReceivableAccountsTable } from "./ReceivableAccountsTable";

interface ReceivableCardProps {
  groupKey: string;
  accounts: ReceivableAccount[];
  groupType: 'description' | 'origin' | 'resourceType';
  onEditReceivable: (account: ReceivableAccount) => void;
  onDeleteReceivable: (account: ReceivableAccount) => void;
  onOpenReceiptConfirm: (account: ReceivableAccount) => void;
}

export function ReceivableCard({
  groupKey,
  accounts,
  groupType,
  onEditReceivable,
  onDeleteReceivable,
  onOpenReceiptConfirm,
}: ReceivableCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalValue = accounts.reduce((sum, account) => sum + account.value, 0);
  const totalReceived = accounts
    .filter(account => account.status === 'recebido')
    .reduce((sum, account) => sum + (account.receivedAmount || account.value), 0);
  const totalPending = accounts
    .filter(account => account.status === 'pendente')
    .reduce((sum, account) => sum + account.value, 0);

  const receivedCount = accounts.filter(account => account.status === 'recebido').length;
  const pendingCount = accounts.filter(account => account.status === 'pendente').length;

  const getIcon = () => {
    switch (groupType) {
      case 'description':
        return <DollarSign className="h-5 w-5" />;
      case 'origin':
        return <Building className="h-5 w-5" />;
      case 'resourceType':
        return <Calendar className="h-5 w-5" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  const getGroupLabel = () => {
    switch (groupType) {
      case 'description':
        return 'Descrição';
      case 'origin':
        return 'Origem';
      case 'resourceType':
        return 'Tipo de Recurso';
      default:
        return 'Grupo';
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              {getIcon()}
            </div>
            <div>
              <CardTitle className="text-lg">{groupKey}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {getGroupLabel()} • {accounts.length} {accounts.length === 1 ? 'conta' : 'contas'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-600 border-green-200">
              {receivedCount} recebidas
            </Badge>
            <Badge variant="outline" className="text-amber-600 border-amber-200">
              {pendingCount} pendentes
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-2"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-lg font-bold">{formatCurrency(totalValue)}</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600">Recebido</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(totalReceived)}</p>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <p className="text-sm text-amber-600">Pendente</p>
            <p className="text-lg font-bold text-amber-600">{formatCurrency(totalPending)}</p>
          </div>
        </div>

        {isExpanded && (
          <ReceivableAccountsTable
            accounts={accounts}
            onEditReceivable={onEditReceivable}
            onDeleteReceivable={onDeleteReceivable}
            onOpenReceiptConfirm={onOpenReceiptConfirm}
          />
        )}
      </CardContent>
    </Card>
  );
}
