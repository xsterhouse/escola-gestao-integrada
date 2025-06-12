
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountingHeader } from "@/components/accounting/AccountingHeader";
import { AccountingDashboard } from "@/components/accounting/AccountingDashboard";
import { IntegratedEntryForm } from "@/components/accounting/IntegratedEntryForm";
import { AccountingEntriesTab } from "@/components/accounting/AccountingEntriesTab";
import { AdvancedBankReconciliationTab } from "@/components/accounting/AdvancedBankReconciliationTab";
import { AccountConfigTab } from "@/components/accounting/AccountConfigTab";
import { AccountingReportsTab } from "@/components/accounting/AccountingReportsTab";
import { CloseExerciseTab } from "@/components/accounting/CloseExerciseTab";

const Accounting = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleNavigateToTab = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Módulo de Contabilidade</h1>
            <p className="text-gray-600 mt-1">Sistema integrado de gestão contábil com automação avançada</p>
          </div>
          <AccountingHeader />
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="dashboard" className="text-sm font-medium">Dashboard</TabsTrigger>
            <TabsTrigger value="entries" className="text-sm font-medium">Lançamentos</TabsTrigger>
            <TabsTrigger value="entries-list" className="text-sm font-medium">Visualizar</TabsTrigger>
            <TabsTrigger value="reconciliation" className="text-sm font-medium">Conciliação</TabsTrigger>
            <TabsTrigger value="accounts" className="text-sm font-medium">Contas</TabsTrigger>
            <TabsTrigger value="reports" className="text-sm font-medium">Relatórios</TabsTrigger>
            <TabsTrigger value="close" className="text-sm font-medium">Encerramento</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <AccountingDashboard onNavigateToTab={handleNavigateToTab} />
          </TabsContent>

          <TabsContent value="entries" className="mt-6">
            <IntegratedEntryForm />
          </TabsContent>

          <TabsContent value="entries-list" className="mt-6">
            <AccountingEntriesTab />
          </TabsContent>

          <TabsContent value="reconciliation" className="mt-6">
            <AdvancedBankReconciliationTab />
          </TabsContent>

          <TabsContent value="accounts" className="mt-6">
            <AccountConfigTab />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <AccountingReportsTab />
          </TabsContent>

          <TabsContent value="close" className="mt-6">
            <CloseExerciseTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Accounting;
