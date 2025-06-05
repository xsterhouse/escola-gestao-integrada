
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialHeader } from "@/components/financial/FinancialHeader";
import { FinancialDashboard } from "@/components/financial/FinancialDashboard";
import { PayableAccounts } from "@/components/financial/PayableAccounts";
import { ReceivableAccounts } from "@/components/financial/ReceivableAccounts";
import { BankAccounts } from "@/components/financial/BankAccounts";
import { BankReconciliation } from "@/components/financial/BankReconciliation";
import { FinancialReports } from "@/components/financial/FinancialReports";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";
import { useAuth } from "@/contexts/AuthContext";
import { PaymentAccount, ReceivableAccount, BankAccount, BankTransaction, FinancialSummary } from "@/lib/types";

export default function Financial() {
  const { currentSchool } = useAuth();
  
  // Use standardized keys with schoolId
  const payableAccountsKey = currentSchool ? `payableAccounts_${currentSchool.id}` : 'payableAccounts';
  const receivableAccountsKey = currentSchool ? `receivableAccounts_${currentSchool.id}` : 'receivableAccounts';
  const bankAccountsKey = currentSchool ? `bankAccounts_${currentSchool.id}` : 'bankAccounts';
  const transactionsKey = currentSchool ? `transactions_${currentSchool.id}` : 'transactions';
  
  const { data: payableAccounts, saveData: setPayableAccounts } = useLocalStorageSync<PaymentAccount>(payableAccountsKey, []);
  const { data: receivableAccounts, saveData: setReceivableAccounts } = useLocalStorageSync<ReceivableAccount>(receivableAccountsKey, []);
  const { data: bankAccounts, saveData: setBankAccounts } = useLocalStorageSync<BankAccount>(bankAccountsKey, []);
  const { data: transactions, saveData: setTransactions } = useLocalStorageSync<BankTransaction>(transactionsKey, []);
  
  console.log(`💰 Carregando financeiro com chaves:`, {
    payable: `${payableAccountsKey} (${payableAccounts.length})`,
    receivable: `${receivableAccountsKey} (${receivableAccounts.length})`,
    bank: `${bankAccountsKey} (${bankAccounts.length})`,
    transactions: `${transactionsKey} (${transactions.length})`
  });
  
  const [activeTab, setActiveTab] = useState("dashboard");

  // Calculate financial summary
  const calculateFinancialSummary = (): FinancialSummary => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const paymentsToday = payableAccounts
      .filter(payment => {
        const dueDate = new Date(payment.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime() && payment.status === 'a_pagar';
      })
      .reduce((sum, payment) => sum + payment.value, 0);

    const receivablesToday = receivableAccounts
      .filter(receivable => {
        const expectedDate = new Date(receivable.expectedDate);
        expectedDate.setHours(0, 0, 0, 0);
        return expectedDate.getTime() === today.getTime() && receivable.status === 'pendente';
      })
      .reduce((sum, receivable) => sum + receivable.value, 0);

    const monthlyExpenses = payableAccounts
      .filter(payment => {
        const paymentDate = payment.paymentDate ? new Date(payment.paymentDate) : new Date(payment.dueDate);
        return paymentDate.getMonth() === today.getMonth() && 
               paymentDate.getFullYear() === today.getFullYear() &&
               payment.status === 'pago';
      })
      .reduce((sum, payment) => sum + payment.value, 0);

    const monthlyRevenues = receivableAccounts
      .filter(receivable => {
        const receivedDate = receivable.receivedDate ? new Date(receivable.receivedDate) : null;
        return receivedDate && 
               receivedDate.getMonth() === today.getMonth() && 
               receivedDate.getFullYear() === today.getFullYear() &&
               receivable.status === 'recebido';
      })
      .reduce((sum, receivable) => sum + receivable.value, 0);

    const totalRevenues = receivableAccounts
      .filter(receivable => receivable.status === 'recebido')
      .reduce((sum, receivable) => sum + receivable.value, 0);

    const totalExpenses = payableAccounts
      .filter(payment => payment.status === 'pago')
      .reduce((sum, payment) => sum + payment.value, 0);

    const initialBalance = bankAccounts.reduce((sum, account) => sum + account.initialBalance, 0);
    const finalBalance = initialBalance + totalRevenues - totalExpenses;

    return {
      initialBalance,
      totalRevenues,
      totalExpenses,
      finalBalance,
      paymentsToday,
      receivablesToday,
      monthlyExpenses,
      monthlyRevenues
    };
  };

  const summary = calculateFinancialSummary();

  // Mock data for missing props
  const resourceCategories = [
    "PNAE", "PDDE", "PNATE", "Recursos Próprios", "Outros"
  ];

  const expenseTypes = [
    "Material de Consumo", "Serviços", "Equipamentos", "Manutenção", "Outros"
  ];

  const handleAddTransaction = (transaction: BankTransaction) => {
    setTransactions([...transactions, transaction]);
  };

  return (
    <AppLayout requireAuth={true} requiredPermission="financial">
      <div className="space-y-6">
        <FinancialHeader 
          bankAccounts={bankAccounts}
          onAddTransaction={handleAddTransaction}
          showActionButtons={true}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-3xl grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="payable">Contas a Pagar</TabsTrigger>
            <TabsTrigger value="receivable">Contas a Receber</TabsTrigger>
            <TabsTrigger value="bank">Contas Bancárias</TabsTrigger>
            <TabsTrigger value="reconciliation">Conciliação</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-4">
            <FinancialDashboard 
              summary={summary}
              payables={payableAccounts}
              receivables={receivableAccounts}
            />
          </TabsContent>

          <TabsContent value="payable" className="mt-4">
            <PayableAccounts 
              paymentAccounts={payableAccounts}
              setPaymentAccounts={setPayableAccounts}
              calculateFinancialSummary={calculateFinancialSummary}
              resourceCategories={resourceCategories}
              expenseTypes={expenseTypes}
            />
          </TabsContent>

          <TabsContent value="receivable" className="mt-4">
            <ReceivableAccounts 
              receivableAccounts={receivableAccounts}
              setReceivableAccounts={setReceivableAccounts}
              calculateFinancialSummary={calculateFinancialSummary}
            />
          </TabsContent>

          <TabsContent value="bank" className="mt-4">
            <BankAccounts 
              bankAccounts={bankAccounts}
              setBankAccounts={setBankAccounts}
            />
          </TabsContent>

          <TabsContent value="reconciliation" className="mt-4">
            <BankReconciliation 
              bankAccounts={bankAccounts}
              setBankAccounts={setBankAccounts}
              transactions={transactions}
              setTransactions={setTransactions}
              calculateFinancialSummary={calculateFinancialSummary}
            />
          </TabsContent>

          <TabsContent value="reports" className="mt-4">
            <FinancialReports 
              bankAccounts={bankAccounts}
              transactions={transactions}
              payables={payableAccounts}
              receivables={receivableAccounts}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
