import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PaymentAccount, 
  ReceivableAccount,
  FinancialSummary
} from "@/lib/types";
import { ActionCards } from "@/components/dashboard/ActionCards";

interface FinancialDashboardProps {
  summary: FinancialSummary;
  payables: PaymentAccount[];
  receivables: ReceivableAccount[];
  onAddPayment?: (payment: PaymentAccount) => void;
  onAddReceivable?: (receivable: ReceivableAccount) => void;
}

export function FinancialDashboard({ 
  summary, 
  payables, 
  receivables,
  onAddPayment,
  onAddReceivable
}: FinancialDashboardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold tracking-tight">Visão Geral</h2>
      
      {/* Financial Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Contas a Pagar Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.paymentsToday)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Contas a Receber Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.receivablesToday)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Despesas no Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.monthlyExpenses)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Receitas no Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.monthlyRevenues)}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Action Cards */}
      <h2 className="text-xl font-semibold tracking-tight mt-8">Ações Rápidas</h2>
      <ActionCards 
        onAddPayment={onAddPayment}
        onAddReceivable={onAddReceivable}
      />
      
      {/* Other Dashboard Sections */}
      {/* You can add charts, recent transactions, etc. */}
    </div>
  );
}
