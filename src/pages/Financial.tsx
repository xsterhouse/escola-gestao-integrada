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
import { ResourceCategoriesConfig } from "@/components/financial/ResourceCategoriesConfig";
import { ExpenseTypesConfig } from "@/components/financial/ExpenseTypesConfig";
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
  const resourceCategoriesKey = currentSchool ? `resourceCategories_${currentSchool.id}` : 'resourceCategories';
  const expenseTypesKey = currentSchool ? `expenseTypes_${currentSchool.id}` : 'expenseTypes';
  
  const { data: payableAccounts, saveData: setPayableAccounts } = useLocalStorageSync<PaymentAccount>(payableAccountsKey, []);
  const { data: receivableAccounts, saveData: setReceivableAccounts } = useLocalStorageSync<ReceivableAccount>(receivableAccountsKey, []);
  const { data: bankAccounts, saveData: setBankAccounts } = useLocalStorageSync<BankAccount>(bankAccountsKey, []);
  const { data: transactions, saveData: setTransactions } = useLocalStorageSync<BankTransaction>(transactionsKey, []);
  
  // Default values for resource categories and expense types
  const defaultResourceCategories = ["PNAE", "PDDE", "PNATE", "Recursos Próprios", "Outros"];
  const defaultExpenseTypes = ["Material de Consumo", "Serviços", "Equipamentos", "Manutenção", "Outros"];
  
  const { data: resourceCategories, saveData: setResourceCategories } = useLocalStorageSync<string>(resourceCategoriesKey, defaultResourceCategories);
  const { data: expenseTypes, saveData: setExpenseTypes } = useLocalStorageSync<string>(expenseTypesKey, defaultExpenseTypes);
  
  console.log(`💰 Carregando financeiro com chaves:`, {
    payable: `${payableAccountsKey} (${payableAccounts.length})`,
    receivable: `${receivableAccountsKey} (${receivableAccounts.length})`,
    bank: `${bankAccountsKey} (${bankAccounts.length})`,
    transactions: `${transactionsKey} (${transactions.length})`,
    resourceCategories: `${resourceCategoriesKey} (${resourceCategories.length})`,
    expenseTypes: `${expenseTypesKey} (${expenseTypes.length})`
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

  const handleAddTransaction = (transaction: BankTransaction) => {
    setTransactions([...transactions, transaction]);
  };

  const handleResourceCategoriesChange = (categories: string[]) => {
    setResourceCategories(categories);
  };

  const handleExpenseTypesChange = (types: string[]) => {
    setExpenseTypes(types);
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
          <TabsList className="grid w-full max-w-6xl grid-cols-8 gap-1 p-1">
            <TabsTrigger value="dashboard" className="px-3 py-2">Dashboard</TabsTrigger>
            <TabsTrigger value="bank" className="px-3 py-2">Contas Bancárias</TabsTrigger>
            <TabsTrigger value="reconciliation" className="px-3 py-2">Conciliação</TabsTrigger>
            <TabsTrigger value="payable" className="px-3 py-2">Contas a Pagar</TabsTrigger>
            <TabsTrigger value="receivable" className="px-3 py-2">Contas a Receber</TabsTrigger>
            <TabsTrigger value="resource-categories" className="px-3 py-2">Categoria de Recursos</TabsTrigger>
            <TabsTrigger value="expense-types" className="px-3 py-2">Tipo de Despesas</TabsTrigger>
            <TabsTrigger value="reports" className="px-3 py-2">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-4">
            <FinancialDashboard 
              summary={summary}
              payables={payableAccounts}
              receivables={receivableAccounts}
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

          <TabsContent value="resource-categories" className="mt-4">
            <ResourceCategoriesConfig
              categories={resourceCategories}
              onCategoriesChange={handleResourceCategoriesChange}
            />
          </TabsContent>

          <TabsContent value="expense-types" className="mt-4">
            <ExpenseTypesConfig
              expenseTypes={expenseTypes}
              onExpenseTypesChange={handleExpenseTypesChange}
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
