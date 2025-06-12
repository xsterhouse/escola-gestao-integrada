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
import { toast } from "sonner";

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

  // Function to create bank transaction from payment
  const createBankTransactionFromPayment = (payment: PaymentAccount, bankAccountId: string): BankTransaction => {
    const transactionId = `payment_${payment.id}_${Date.now()}`;
    
    return {
      id: transactionId,
      schoolId: currentSchool?.id || '',
      bankAccountId,
      date: payment.paymentDate || new Date(),
      description: `Pagamento: ${payment.description} - ${payment.supplier}`,
      value: payment.value,
      transactionType: 'debito',
      reconciliationStatus: 'pendente',
      category: payment.expenseType,
      resourceType: payment.resourceCategory,
      source: 'payment',
      documentId: payment.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  };

  // Function to create bank transaction from receivable
  const createBankTransactionFromReceivable = (receivable: ReceivableAccount, bankAccountId: string, isPartial: boolean = false, partialAmount?: number): BankTransaction => {
    const transactionId = `receivable_${receivable.id}_${Date.now()}`;
    const amount = isPartial && partialAmount ? partialAmount : receivable.value;
    
    return {
      id: transactionId,
      schoolId: currentSchool?.id || '',
      bankAccountId,
      date: receivable.receivedDate || new Date(),
      description: `Recebimento: ${receivable.description} - ${receivable.origin}${isPartial ? ' (Parcial)' : ''}`,
      value: amount,
      transactionType: 'credito',
      reconciliationStatus: 'pendente',
      category: 'Recebimento',
      resourceType: receivable.resourceType,
      source: 'receivable',
      documentId: receivable.id,
      isPartialPayment: isPartial,
      partialAmount: isPartial ? partialAmount : undefined,
      remainingAmount: isPartial && partialAmount ? receivable.value - partialAmount : undefined,
      originalReceivableId: receivable.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  };

  // Handle payment update with automatic transaction creation
  const handlePaymentUpdate = (updatedPayment: PaymentAccount, bankAccountId?: string) => {
    // Update payment accounts
    const updatedPayments = payableAccounts.map(payment =>
      payment.id === updatedPayment.id ? updatedPayment : payment
    );
    setPayableAccounts(updatedPayments);

    // Create bank transaction if payment was completed and bankAccountId is provided
    if (updatedPayment.status === 'pago' && bankAccountId) {
      const bankTransaction = createBankTransactionFromPayment(updatedPayment, bankAccountId);
      setTransactions([...transactions, bankTransaction]);
      
      // Update bank account balance
      const updatedBankAccounts = bankAccounts.map(account => {
        if (account.id === bankAccountId) {
          return {
            ...account,
            currentBalance: account.currentBalance - updatedPayment.value,
            updatedAt: new Date()
          };
        }
        return account;
      });
      setBankAccounts(updatedBankAccounts);

      toast.success("Pagamento registrado e transação criada na conciliação!");
      console.log('💰 Transação bancária criada para pagamento:', bankTransaction);
    }
  };

  // Enhanced handle receivable update with better partial payment support
  const handleReceivableUpdate = (updatedReceivable: ReceivableAccount, bankAccountId?: string, isPartial?: boolean, partialAmount?: number) => {
    console.log('💰 Atualizando recebimento:', { updatedReceivable, bankAccountId, isPartial, partialAmount });

    // Update receivable accounts
    const updatedReceivables = receivableAccounts.map(receivable =>
      receivable.id === updatedReceivable.id ? updatedReceivable : receivable
    );
    setReceivableAccounts(updatedReceivables);

    // Create bank transaction if receivable was received and bankAccountId is provided
    if (updatedReceivable.status === 'recebido' && bankAccountId) {
      const bankTransaction = createBankTransactionFromReceivable(
        updatedReceivable, 
        bankAccountId, 
        isPartial || false, 
        partialAmount
      );
      
      console.log('💰 Criando transação bancária:', bankTransaction);
      setTransactions([...transactions, bankTransaction]);
      
      // Update bank account balance
      const amount = isPartial && partialAmount ? partialAmount : updatedReceivable.value;
      const updatedBankAccounts = bankAccounts.map(account => {
        if (account.id === bankAccountId) {
          return {
            ...account,
            currentBalance: account.currentBalance + amount,
            updatedAt: new Date()
          };
        }
        return account;
      });
      setBankAccounts(updatedBankAccounts);

      const paymentType = isPartial ? "Recebimento parcial" : "Recebimento";
      toast.success(`${paymentType} registrado e transação criada na conciliação!`);
      console.log('💰 Transação bancária criada para recebimento:', bankTransaction);
    }
  };

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
      <div className="px-6 py-6 space-y-6">
        <FinancialHeader 
          bankAccounts={bankAccounts}
          onAddTransaction={handleAddTransaction}
          showActionButtons={true}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-6xl grid-cols-8 gap-2 p-1">
            <TabsTrigger value="dashboard" className="px-2 py-2 text-xs">Dashboard</TabsTrigger>
            <TabsTrigger value="bank" className="px-2 py-2 text-xs">Contas Bancárias</TabsTrigger>
            <TabsTrigger value="reconciliation" className="px-2 py-2 text-xs">Conciliação</TabsTrigger>
            <TabsTrigger value="payable" className="px-2 py-2 text-xs">Contas a Pagar</TabsTrigger>
            <TabsTrigger value="receivable" className="px-2 py-2 text-xs">Contas a Receber</TabsTrigger>
            <TabsTrigger value="resource-categories" className="px-2 py-2 text-xs">Categoria de Recursos</TabsTrigger>
            <TabsTrigger value="expense-types" className="px-2 py-2 text-xs">Tipo de Despesas</TabsTrigger>
            <TabsTrigger value="reports" className="px-2 py-2 text-xs">Relatórios</TabsTrigger>
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
              bankAccounts={bankAccounts}
              calculateFinancialSummary={calculateFinancialSummary}
              resourceCategories={resourceCategories}
              expenseTypes={expenseTypes}
              onUpdatePayment={handlePaymentUpdate}
            />
          </TabsContent>

          <TabsContent value="receivable" className="mt-4">
            <ReceivableAccounts 
              receivableAccounts={receivableAccounts}
              setReceivableAccounts={setReceivableAccounts}
              calculateFinancialSummary={calculateFinancialSummary}
              bankAccounts={bankAccounts}
              onUpdateReceivable={handleReceivableUpdate}
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
