
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialHeader } from "@/components/financial/FinancialHeader";
import { BankReconciliation } from "@/components/financial/BankReconciliation";
import { PayableAccounts } from "@/components/financial/PayableAccounts";
import { ReceivableAccounts } from "@/components/financial/ReceivableAccounts";
import { FinancialDashboard } from "@/components/financial/FinancialDashboard";
import { FinancialReports } from "@/components/financial/FinancialReports";
import { 
  BankAccount, 
  BankTransaction, 
  PaymentAccount, 
  ReceivableAccount,
  FinancialSummary
} from "@/lib/types";

export default function Financial() {
  // State for all financial data
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [receivableAccounts, setReceivableAccounts] = useState<ReceivableAccount[]>([]);
  
  // Financial summary data
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    initialBalance: 0,
    totalRevenues: 0,
    totalExpenses: 0,
    finalBalance: 0,
    paymentsToday: 0,
    receivablesToday: 0,
    monthlyExpenses: 0,
    monthlyRevenues: 0
  });
  
  // Calculate financial summary based on current data
  const calculateFinancialSummary = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const initialBalance = bankAccounts.reduce((sum, account) => sum + account.initialBalance, 0);
    const totalRevenues = receivableAccounts
      .filter(account => account.status === 'recebido')
      .reduce((sum, account) => sum + account.value, 0);
    const totalExpenses = paymentAccounts
      .filter(account => account.status === 'pago')
      .reduce((sum, account) => sum + account.value, 0);
    const finalBalance = initialBalance + totalRevenues - totalExpenses;
    
    // Today's payments and receivables
    const isSameDay = (date1: Date, date2: Date) => {
      return date1.getDate() === date2.getDate() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getFullYear() === date2.getFullYear();
    };
    
    const paymentsToday = paymentAccounts
      .filter(payment => payment.status === 'a_pagar' && isSameDay(new Date(payment.dueDate), today))
      .reduce((sum, payment) => sum + payment.value, 0);
      
    const receivablesToday = receivableAccounts
      .filter(receivable => receivable.status === 'pendente' && isSameDay(new Date(receivable.expectedDate), today))
      .reduce((sum, receivable) => sum + receivable.value, 0);
    
    // Monthly totals
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const isCurrentMonth = (date: Date) => {
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    };
    
    const monthlyExpenses = paymentAccounts
      .filter(payment => payment.status === 'pago' && payment.paymentDate && isCurrentMonth(new Date(payment.paymentDate)))
      .reduce((sum, payment) => sum + payment.value, 0);
      
    const monthlyRevenues = receivableAccounts
      .filter(receivable => receivable.status === 'recebido' && receivable.receivedDate && isCurrentMonth(new Date(receivable.receivedDate)))
      .reduce((sum, receivable) => sum + receivable.value, 0);
    
    setFinancialSummary({
      initialBalance,
      totalRevenues,
      totalExpenses,
      finalBalance,
      paymentsToday,
      receivablesToday,
      monthlyExpenses,
      monthlyRevenues
    });
  };
  
  return (
    <AppLayout requireAuth={true} requiredPermission="financial">
      <div className="space-y-6">
        <FinancialHeader />
        
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full max-w-4xl grid-cols-5">
            <TabsTrigger value="dashboard">Visão Geral</TabsTrigger>
            <TabsTrigger value="reconciliation">Conciliação Bancária</TabsTrigger>
            <TabsTrigger value="payables">Contas a Pagar</TabsTrigger>
            <TabsTrigger value="receivables">Contas a Receber</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-4">
            <FinancialDashboard 
              summary={financialSummary}
              payables={paymentAccounts}
              receivables={receivableAccounts}
            />
          </TabsContent>

          <TabsContent value="reconciliation" className="mt-4">
            <BankReconciliation 
              bankAccounts={bankAccounts}
              setBankAccounts={setBankAccounts}
              transactions={bankTransactions}
              setTransactions={setBankTransactions}
              calculateFinancialSummary={calculateFinancialSummary}
            />
          </TabsContent>

          <TabsContent value="payables" className="mt-4">
            <PayableAccounts 
              paymentAccounts={paymentAccounts}
              setPaymentAccounts={setPaymentAccounts}
              calculateFinancialSummary={calculateFinancialSummary}
            />
          </TabsContent>

          <TabsContent value="receivables" className="mt-4">
            <ReceivableAccounts 
              receivableAccounts={receivableAccounts}
              setReceivableAccounts={setReceivableAccounts}
              calculateFinancialSummary={calculateFinancialSummary}
            />
          </TabsContent>
          
          <TabsContent value="reports" className="mt-4">
            <FinancialReports 
              bankAccounts={bankAccounts}
              transactions={bankTransactions}
              payables={paymentAccounts}
              receivables={receivableAccounts}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
