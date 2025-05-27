import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialHeader } from "@/components/financial/FinancialHeader";
import { BankReconciliation } from "@/components/financial/BankReconciliation";
import { PayableAccounts } from "@/components/financial/PayableAccounts";
import { ReceivableAccounts } from "@/components/financial/ReceivableAccounts";
import { FinancialDashboard } from "@/components/financial/FinancialDashboard";
import { FinancialReports } from "@/components/financial/FinancialReports";
import { BankAccounts } from "@/components/financial/BankAccounts";
import { ResourceCategoriesConfig } from "@/components/financial/ResourceCategoriesConfig";
import { ExpenseTypesConfig } from "@/components/financial/ExpenseTypesConfig";
import { 
  BankAccount, 
  BankTransaction, 
  PaymentAccount, 
  ReceivableAccount,
  FinancialSummary
} from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export default function Financial() {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // State for all financial data - starting with empty arrays, data will be loaded from localStorage
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [receivableAccounts, setReceivableAccounts] = useState<ReceivableAccount[]>([]);
  
  // Configuration states - loaded from localStorage
  const [resourceCategories, setResourceCategories] = useState<string[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<string[]>([]);
  
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

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedBankTransactions = localStorage.getItem('bankTransactions');
    if (savedBankTransactions) {
      setBankTransactions(JSON.parse(savedBankTransactions));
    }

    const savedPaymentAccounts = localStorage.getItem('paymentAccounts');
    if (savedPaymentAccounts) {
      setPaymentAccounts(JSON.parse(savedPaymentAccounts));
    }

    const savedReceivableAccounts = localStorage.getItem('receivableAccounts');
    if (savedReceivableAccounts) {
      setReceivableAccounts(JSON.parse(savedReceivableAccounts));
    }

    // Load configuration data
    const savedResourceCategories = localStorage.getItem('resourceCategories');
    if (savedResourceCategories) {
      setResourceCategories(JSON.parse(savedResourceCategories));
    } else {
      // Set default categories if none exist
      const defaultCategories = ["PNAE", "PNATE", "Recursos Próprios", "Outros"];
      setResourceCategories(defaultCategories);
      localStorage.setItem('resourceCategories', JSON.stringify(defaultCategories));
    }

    const savedExpenseTypes = localStorage.getItem('expenseTypes');
    if (savedExpenseTypes) {
      setExpenseTypes(JSON.parse(savedExpenseTypes));
    } else {
      // Set default expense types if none exist
      const defaultTypes = ["Alimentação", "Material Didático", "Transporte", "Infraestrutura", "Serviços", "Água", "Energia", "Internet", "Outros"];
      setExpenseTypes(defaultTypes);
      localStorage.setItem('expenseTypes', JSON.stringify(defaultTypes));
    }
  }, []);

  // Save data to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('bankTransactions', JSON.stringify(bankTransactions));
  }, [bankTransactions]);

  useEffect(() => {
    localStorage.setItem('paymentAccounts', JSON.stringify(paymentAccounts));
  }, [paymentAccounts]);

  useEffect(() => {
    localStorage.setItem('receivableAccounts', JSON.stringify(receivableAccounts));
  }, [receivableAccounts]);

  useEffect(() => {
    localStorage.setItem('resourceCategories', JSON.stringify(resourceCategories));
  }, [resourceCategories]);

  useEffect(() => {
    localStorage.setItem('expenseTypes', JSON.stringify(expenseTypes));
  }, [expenseTypes]);
  
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

  // Calculate summary when the component mounts or data changes
  useEffect(() => {
    calculateFinancialSummary();
  }, [bankAccounts, bankTransactions, paymentAccounts, receivableAccounts]);
  
  // Function to create automatic bank transaction
  const createAutomaticBankTransaction = (
    type: 'payment' | 'receivable',
    account: PaymentAccount | ReceivableAccount,
    bankAccountId: string
  ) => {
    const bankAccount = bankAccounts.find(ba => ba.id === bankAccountId);
    if (!bankAccount) return;

    const resourceType = type === 'payment' 
      ? (account as PaymentAccount).resourceCategory 
      : (account as ReceivableAccount).resourceType;

    const newTransaction: BankTransaction = {
      id: uuidv4(),
      schoolId: "current-school-id",
      bankAccountId,
      date: new Date(),
      description: type === 'payment' 
        ? `Pagamento: ${account.description}` 
        : `Recebimento: ${account.description}`,
      value: account.value,
      transactionType: type === 'payment' ? 'debito' : 'credito',
      reconciliationStatus: 'conciliado',
      category: type === 'payment' ? (account as PaymentAccount).expenseType : resourceType,
      resourceType: bankAccount.managementType,
      source: type,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setBankTransactions(prev => [...prev, newTransaction]);
    
    // Update bank account balance
    setBankAccounts(prev => prev.map(ba => 
      ba.id === bankAccountId 
        ? { 
            ...ba, 
            currentBalance: type === 'payment' 
              ? ba.currentBalance - account.value 
              : ba.currentBalance + account.value,
            updatedAt: new Date()
          }
        : ba
    ));

    return newTransaction;
  };
  
  // Handlers for new transactions from header
  const handleAddTransaction = (transaction: BankTransaction) => {
    setBankTransactions([...bankTransactions, transaction]);
  };
  
  const handleAddPayment = (payment: PaymentAccount) => {
    setPaymentAccounts([...paymentAccounts, payment]);
  };
  
  const handleAddReceivable = (receivable: ReceivableAccount) => {
    setReceivableAccounts([...receivableAccounts, receivable]);
  };

  // Enhanced handler for updating payment account with automatic transaction
  const handleUpdatePaymentAccount = (updatedPayment: PaymentAccount) => {
    const previousPayment = paymentAccounts.find(p => p.id === updatedPayment.id);
    
    // If payment was just marked as paid and has a bank account, create automatic transaction
    if (previousPayment?.status === 'a_pagar' && 
        updatedPayment.status === 'pago' && 
        updatedPayment.bankAccountId) {
      createAutomaticBankTransaction('payment', updatedPayment, updatedPayment.bankAccountId);
    }

    // Update payment accounts
    setPaymentAccounts(prev => 
      prev.map(p => p.id === updatedPayment.id ? updatedPayment : p)
    );
  };

  // Enhanced handler for updating receivable account with automatic transaction
  const handleUpdateReceivableAccount = (updatedReceivable: ReceivableAccount, bankAccountId?: string) => {
    const previousReceivable = receivableAccounts.find(r => r.id === updatedReceivable.id);
    
    // If receivable was just marked as received and has a bank account, create automatic transaction
    if (previousReceivable?.status === 'pendente' && 
        updatedReceivable.status === 'recebido' && 
        bankAccountId) {
      createAutomaticBankTransaction('receivable', updatedReceivable, bankAccountId);
    }

    // Update receivable accounts
    setReceivableAccounts(prev => 
      prev.map(r => r.id === updatedReceivable.id ? updatedReceivable : r)
    );
  };

  // Function to navigate to bank reconciliation tab
  const handleNavigateToBankReconciliation = () => {
    setActiveTab("reconciliation");
  };
  
  return (
    <AppLayout requireAuth={true} requiredPermission="financial">
      <div className="space-y-6">
        <FinancialHeader 
          bankAccounts={bankAccounts}
          onAddTransaction={handleAddTransaction}
          showActionButtons={activeTab === "reconciliation"}
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-6xl grid-cols-8">
            <TabsTrigger value="dashboard">Visão Geral</TabsTrigger>
            <TabsTrigger value="bank-accounts">Contas Bancárias</TabsTrigger>
            <TabsTrigger value="reconciliation">Conciliação Bancária</TabsTrigger>
            <TabsTrigger value="payables">Contas a Pagar</TabsTrigger>
            <TabsTrigger value="receivables">Contas a Receber</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="expenses">Tipos Despesas</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-4">
            <FinancialDashboard 
              summary={financialSummary}
              payables={paymentAccounts}
              receivables={receivableAccounts}
              onAddPayment={handleAddPayment}
              onAddReceivable={handleAddReceivable}
            />
          </TabsContent>

          <TabsContent value="bank-accounts" className="mt-4">
            <BankAccounts 
              bankAccounts={bankAccounts}
              setBankAccounts={setBankAccounts}
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
              bankAccounts={bankAccounts}
              onNavigateToBankReconciliation={handleNavigateToBankReconciliation}
              resourceCategories={resourceCategories}
              expenseTypes={expenseTypes}
              onUpdatePayment={handleUpdatePaymentAccount}
            />
          </TabsContent>

          <TabsContent value="receivables" className="mt-4">
            <ReceivableAccounts 
              receivableAccounts={receivableAccounts}
              setReceivableAccounts={setReceivableAccounts}
              calculateFinancialSummary={calculateFinancialSummary}
              bankAccounts={bankAccounts}
              onNavigateToBankReconciliation={handleNavigateToBankReconciliation}
              bankTransactions={bankTransactions}
              setBankTransactions={setBankTransactions}
              onUpdateReceivable={handleUpdateReceivableAccount}
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

          <TabsContent value="categories" className="mt-4">
            <ResourceCategoriesConfig
              categories={resourceCategories}
              onCategoriesChange={setResourceCategories}
            />
          </TabsContent>

          <TabsContent value="expenses" className="mt-4">
            <ExpenseTypesConfig
              expenseTypes={expenseTypes}
              onExpenseTypesChange={setExpenseTypes}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
