
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountingHeader } from "@/components/accounting/AccountingHeader";
import { AccountingEntryForm } from "@/components/accounting/AccountingEntryForm";
import { AccountingEntriesTab } from "@/components/accounting/AccountingEntriesTab";
import { AccountConfigTab } from "@/components/accounting/AccountConfigTab";
import { AccountingReportsTab } from "@/components/accounting/AccountingReportsTab";
import { CloseExerciseTab } from "@/components/accounting/CloseExerciseTab";

const Accounting = () => {
  const [activeTab, setActiveTab] = useState("entries");

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Módulo de Contabilidade</h1>
            <p className="text-gray-600 mt-1">Gerencie lançamentos contábeis e controle financeiro</p>
          </div>
          <AccountingHeader />
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-5xl grid-cols-5 mb-6">
            <TabsTrigger value="entries" className="text-sm font-medium">Lançamentos</TabsTrigger>
            <TabsTrigger value="entries-list" className="text-sm font-medium">Visualizar Lançamentos</TabsTrigger>
            <TabsTrigger value="accounts" className="text-sm font-medium">Configuração de Contas</TabsTrigger>
            <TabsTrigger value="reports" className="text-sm font-medium">Relatórios</TabsTrigger>
            <TabsTrigger value="close" className="text-sm font-medium">Encerrar Exercício</TabsTrigger>
          </TabsList>

          <TabsContent value="entries" className="mt-6">
            <AccountingEntryForm />
          </TabsContent>

          <TabsContent value="entries-list" className="mt-6">
            <AccountingEntriesTab />
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
