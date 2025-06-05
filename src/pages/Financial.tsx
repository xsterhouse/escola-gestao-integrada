
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

export default function Financial() {
  const { currentSchool } = useAuth();
  
  // Use standardized keys with schoolId
  const payableAccountsKey = currentSchool ? `payableAccounts_${currentSchool.id}` : 'payableAccounts';
  const receivableAccountsKey = currentSchool ? `receivableAccounts_${currentSchool.id}` : 'receivableAccounts';
  const bankAccountsKey = currentSchool ? `bankAccounts_${currentSchool.id}` : 'bankAccounts';
  const transactionsKey = currentSchool ? `transactions_${currentSchool.id}` : 'transactions';
  
  const { data: payableAccounts } = useLocalStorageSync(payableAccountsKey, []);
  const { data: receivableAccounts } = useLocalStorageSync(receivableAccountsKey, []);
  const { data: bankAccounts } = useLocalStorageSync(bankAccountsKey, []);
  const { data: transactions } = useLocalStorageSync(transactionsKey, []);
  
  console.log(`💰 Carregando financeiro com chaves:`, {
    payable: `${payableAccountsKey} (${payableAccounts.length})`,
    receivable: `${receivableAccountsKey} (${receivableAccounts.length})`,
    bank: `${bankAccountsKey} (${bankAccounts.length})`,
    transactions: `${transactionsKey} (${transactions.length})`
  });
  
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <AppLayout requireAuth={true} requiredPermission="financial">
      <div className="space-y-6">
        <FinancialHeader />

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
            <FinancialDashboard />
          </TabsContent>

          <TabsContent value="payable" className="mt-4">
            <PayableAccounts />
          </TabsContent>

          <TabsContent value="receivable" className="mt-4">
            <ReceivableAccounts />
          </TabsContent>

          <TabsContent value="bank" className="mt-4">
            <BankAccounts />
          </TabsContent>

          <TabsContent value="reconciliation" className="mt-4">
            <BankReconciliation />
          </TabsContent>

          <TabsContent value="reports" className="mt-4">
            <FinancialReports />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
