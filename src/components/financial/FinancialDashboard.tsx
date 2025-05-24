
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PaymentAccount, 
  ReceivableAccount,
  FinancialSummary
} from "@/lib/types";
import { ActionCards } from "@/components/dashboard/ActionCards";
import { TrendingUp, TrendingDown, Calendar, DollarSign } from "lucide-react";

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
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
          <DollarSign className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Visão Geral Financeira
        </h2>
      </div>
      
      {/* Modern Financial Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-orange-800">Contas a Pagar Hoje</CardTitle>
              <div className="bg-orange-200 p-2 rounded-full">
                <Calendar className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-900">{formatCurrency(summary.paymentsToday)}</p>
            <p className="text-xs text-orange-600 mt-1">Vencimento hoje</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-800">Contas a Receber Hoje</CardTitle>
              <div className="bg-blue-200 p-2 rounded-full">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-900">{formatCurrency(summary.receivablesToday)}</p>
            <p className="text-xs text-blue-600 mt-1">Previsão hoje</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-red-800">Despesas do Mês</CardTitle>
              <div className="bg-red-200 p-2 rounded-full">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-900">{formatCurrency(summary.monthlyExpenses)}</p>
            <p className="text-xs text-red-600 mt-1">Total gasto</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-800">Receitas do Mês</CardTitle>
              <div className="bg-green-200 p-2 rounded-full">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-900">{formatCurrency(summary.monthlyRevenues)}</p>
            <p className="text-xs text-green-600 mt-1">Total recebido</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Action Cards */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Ações Rápidas
          </h2>
        </div>
        <ActionCards 
          onAddPayment={onAddPayment}
          onAddReceivable={onAddReceivable}
        />
      </div>
    </div>
  );
}
