
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ContractsHeader } from "@/components/contracts/ContractsHeader";
import { ExcelImportSection } from "@/components/contracts/ExcelImportSection";
import { ContractsTable } from "@/components/contracts/ContractsTable";
import { ContractReportsSection } from "@/components/contracts/ContractReportsSection";
import { ContractValiditySection } from "@/components/contracts/ContractValiditySection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContractData, ContractFilter } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function Contracts() {
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [filter, setFilter] = useState<ContractFilter>({ status: 'todos' });
  const { toast } = useToast();

  const handleExcelImport = (contractData: ContractData) => {
    // Check if contract with same ATA ID already exists
    const existingContract = contracts.find(
      contract => contract.ataId === contractData.ataId
    );

    if (existingContract) {
      toast({
        title: "Erro na Importação",
        description: `Já existe um contrato importado para a ATA ${contractData.ataId}. Não é possível importar dados duplicados.`,
        variant: "destructive",
      });
      return;
    }

    setContracts(prev => [...prev, contractData]);
    toast({
      title: "Contrato Importado",
      description: `Contrato para ATA ${contractData.ataId} importado com sucesso.`,
    });
  };

  const handleUpdateContract = (updatedContract: ContractData) => {
    setContracts(prev => 
      prev.map(contract => 
        contract.id === updatedContract.id ? updatedContract : contract
      )
    );
  };

  const filteredContracts = contracts.filter(contract => {
    if (filter.fornecedor && !contract.fornecedor.razaoSocial.toLowerCase().includes(filter.fornecedor.toLowerCase())) {
      return false;
    }
    if (filter.produto && !contract.items.some(item => item.description.toLowerCase().includes(filter.produto!.toLowerCase()))) {
      return false;
    }
    if (filter.status && filter.status !== 'todos' && contract.status !== filter.status) {
      return false;
    }
    return true;
  });

  return (
    <AppLayout requireAuth={true} requiredPermission="6">
      <div className="px-6 py-6 space-y-8">
        <ContractsHeader />
        
        <Tabs defaultValue="tracking" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tracking">Acompanhamento</TabsTrigger>
            <TabsTrigger value="validity">Vigência</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tracking" className="space-y-6">
            <ExcelImportSection onImport={handleExcelImport} />
            <ContractsTable contracts={filteredContracts} />
          </TabsContent>
          
          <TabsContent value="validity" className="space-y-6">
            <ContractValiditySection 
              contracts={contracts} 
              onUpdateContract={handleUpdateContract}
            />
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-6">
            <ContractReportsSection contracts={contracts} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
