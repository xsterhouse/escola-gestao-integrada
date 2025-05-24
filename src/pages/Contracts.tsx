
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ContractsHeader } from "@/components/contracts/ContractsHeader";
import { XmlImportSection } from "@/components/contracts/XmlImportSection";
import { ContractsTable } from "@/components/contracts/ContractsTable";
import { LicitationImportSection } from "@/components/contracts/LicitationImportSection";
import { ContractsReportsSection } from "@/components/contracts/ContractsReportsSection";
import { Contract, InvoiceData } from "@/lib/types";

export default function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);

  const handleXmlImport = (invoiceData: InvoiceData) => {
    setInvoices(prev => [...prev, invoiceData]);
  };

  const handleLicitationImport = (contractsData: Contract[]) => {
    setContracts(prev => [...prev, ...contractsData]);
  };

  return (
    <AppLayout requireAuth={true} requiredPermission="view_contracts">
      <div className="space-y-8">
        <ContractsHeader />
        
        {/* Importação de XML */}
        <XmlImportSection onImport={handleXmlImport} />
        
        {/* Tabela de acompanhamento */}
        <ContractsTable invoices={invoices} />
        
        {/* Importação de licitação */}
        <LicitationImportSection onImport={handleLicitationImport} />
        
        {/* Relatórios */}
        <ContractsReportsSection contracts={contracts} />
      </div>
    </AppLayout>
  );
}
