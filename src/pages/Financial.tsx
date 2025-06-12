import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { FinancialHeader } from "@/components/financial/FinancialHeader";
import { FinancialDashboard } from "@/components/financial/FinancialDashboard";
import { PayableAccounts } from "@/components/financial/PayableAccounts";
import { ReceivableAccounts } from "@/components/financial/ReceivableAccounts";
import { BankAccounts } from "@/components/financial/BankAccounts";
import { FinancialReports } from "@/components/financial/FinancialReports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Financial() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <FinancialHeader />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="payable">Contas a Pagar</TabsTrigger>
            <TabsTrigger value="receivable">Contas a Receber</TabsTrigger>
            <TabsTrigger value="bank">Bancos</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <FinancialDashboard />
          </TabsContent>

          <TabsContent value="payable" className="mt-6">
            <PayableAccounts />
          </TabsContent>

          <TabsContent value="receivable" className="mt-6">
            <ReceivableAccounts />
          </TabsContent>

          <TabsContent value="bank" className="mt-6">
            <BankAccounts />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <FinancialReports />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
