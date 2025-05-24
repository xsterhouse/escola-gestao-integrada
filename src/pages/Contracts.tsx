
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ContractsHeader } from "@/components/contracts/ContractsHeader";
import { XmlImportSection } from "@/components/contracts/XmlImportSection";
import { ContractsTable } from "@/components/contracts/ContractsTable";
import { ContractValidityCounter } from "@/components/contracts/ContractValidityCounter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceData } from "@/lib/types";

export default function Contracts() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);

  const handleXmlImport = (invoiceData: InvoiceData) => {
    setInvoices(prev => [...prev, invoiceData]);
  };

  return (
    <AppLayout requireAuth={true} requiredPermission="view_contracts">
      <div className="space-y-8">
        <ContractsHeader />
        
        <Tabs defaultValue="import" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Importação de XML</TabsTrigger>
            <TabsTrigger value="validity">Vigência dos Contratos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="import" className="space-y-6">
            <XmlImportSection onImport={handleXmlImport} />
            <ContractsTable invoices={invoices} />
          </TabsContent>
          
          <TabsContent value="validity" className="space-y-6">
            <ContractValidityCounter />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
