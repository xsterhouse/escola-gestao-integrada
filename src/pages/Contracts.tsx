
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ContractsHeader } from "@/components/contracts/ContractsHeader";
import { ExcelImportSection } from "@/components/contracts/ExcelImportSection";
import { ContractTrackingTable } from "@/components/contracts/ContractTrackingTable";
import { XmlValidationSection } from "@/components/contracts/XmlValidationSection";
import { ContractReportsSection } from "@/components/contracts/ContractReportsSection";
import { ContractValiditySection } from "@/components/contracts/ContractValiditySection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContractData, ContractFilter } from "@/lib/types";

export default function Contracts() {
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [filter, setFilter] = useState<ContractFilter>({ status: 'todos' });

  const handleExcelImport = (contractData: ContractData) => {
    setContracts(prev => [...prev, contractData]);
  };

  const filteredContracts = contracts.filter(contract => {
    if (filter.fornecedor && !contract.fornecedor.razaoSocial.toLowerCase().includes(filter.fornecedor.toLowerCase())) {
      return false;
    }
    if (filter.produto && !contract.items.some(item => item.produto.toLowerCase().includes(filter.produto!.toLowerCase()))) {
      return false;
    }
    if (filter.status && filter.status !== 'todos' && contract.status !== filter.status) {
      return false;
    }
    return true;
  });

  return (
    <AppLayout requireAuth={true} requiredPermission="view_contracts">
      <div className="space-y-8">
        <ContractsHeader />
        
        <Tabs defaultValue="tracking" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tracking">Acompanhamento</TabsTrigger>
            <TabsTrigger value="validation">Validação NF</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="validity">Vigência</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tracking" className="space-y-6">
            <ExcelImportSection onImport={handleExcelImport} />
            <ContractTrackingTable 
              contracts={filteredContracts} 
              filter={filter}
              onFilterChange={setFilter}
            />
          </TabsContent>
          
          <TabsContent value="validation" className="space-y-6">
            <XmlValidationSection contracts={contracts} />
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-6">
            <ContractReportsSection contracts={contracts} />
          </TabsContent>
          
          <TabsContent value="validity" className="space-y-6">
            <ContractValiditySection contracts={contracts} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
