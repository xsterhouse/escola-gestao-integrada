
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountingHeader } from "@/components/accounting/AccountingHeader";
import { AccountingEntryForm } from "@/components/accounting/AccountingEntryForm";
import { AccountConfigTab } from "@/components/accounting/AccountConfigTab";
import { AccountingReportsTab } from "@/components/accounting/AccountingReportsTab";
import { CloseExerciseTab } from "@/components/accounting/CloseExerciseTab";
import { BookOpen } from "lucide-react";

const Accounting = () => {
  const [activeTab, setActiveTab] = useState("entries");

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Módulo de Contabilidade</h1>
              <p className="text-gray-600 mt-1">Gerencie lançamentos contábeis e controle financeiro</p>
            </div>
          </div>
          <AccountingHeader />
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-4xl grid-cols-4">
            <TabsTrigger value="entries">Lançamentos</TabsTrigger>
            <TabsTrigger value="accounts">Configuração de Contas</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="close">Encerrar Exercício</TabsTrigger>
          </TabsList>

          <TabsContent value="entries" className="mt-6">
            <AccountingEntryForm />
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

        {/* Footer */}
        <div className="flex justify-center gap-4 pt-8 border-t">
          <a 
            href="#" 
            className="text-sm text-gray-500 hover:text-purple-600 transition-colors"
          >
            Ajuda
          </a>
          <span className="text-gray-300">|</span>
          <a 
            href="#" 
            className="text-sm text-gray-500 hover:text-purple-600 transition-colors"
          >
            Sair
          </a>
        </div>
      </div>
    </AppLayout>
  );
};

export default Accounting;
