
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ATAForm } from "./ATAForm";
import { ATAContractsList } from "./ATAContractsList";
import { ATAContract, ATAItem } from "@/lib/types";
import { ATAFormData } from "./types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage, useAutoSave } from "@/hooks/useLocalStorage";
import { v4 as uuidv4 } from "uuid";

export function ATARegistrationTab() {
  const { currentSchool, user } = useAuth();
  const { toast } = useToast();
  
  // Usar hook de localStorage para ATAs
  const {
    data: storedContracts,
    loading: isLoading,
    save: saveContract,
    update: updateContract,
    refresh: refreshContracts
  } = useLocalStorage<ATAContract>('ata_contracts');

  const [contracts, setContracts] = useState<ATAContract[]>([]);

  // Carregar contratos do localStorage
  useEffect(() => {
    if (!isLoading && storedContracts.length > 0) {
      const loadedContracts = storedContracts.map(item => ({
        ...item.data,
        dataATA: new Date(item.data.dataATA),
        dataInicioVigencia: new Date(item.data.dataInicioVigencia),
        dataFimVigencia: new Date(item.data.dataFimVigencia),
        createdAt: new Date(item.data.createdAt),
        updatedAt: new Date(item.data.updatedAt)
      }));
      
      setContracts(loadedContracts);
      console.log(`📋 ${loadedContracts.length} contratos ATA carregados do localStorage`);
    }
  }, [storedContracts, isLoading]);

  const handleAddContract = (formData: ATAFormData) => {
    if (!currentSchool || !user) return;

    // Transformar ATAFormData em ATAContract
    const contractData: Omit<ATAContract, "id" | "schoolId" | "createdBy" | "createdAt" | "updatedAt"> = {
      numeroProcesso: `ATA-${Date.now()}`, // Gerar número do processo automaticamente
      fornecedor: "Fornecedor não especificado", // Valor padrão
      dataATA: new Date(formData.dataATA),
      dataInicioVigencia: new Date(formData.dataInicioVigencia),
      dataFimVigencia: new Date(formData.dataFimVigencia),
      observacoes: formData.observacoes || "",
      items: formData.items.map(item => ({
        id: uuidv4(),
        nome: item.nome,
        unidade: item.unidade,
        quantidade: item.quantidade,
        valorUnitario: 0, // Valor padrão
        valorTotal: 0, // Valor padrão
        descricao: item.descricao || "",
        saldoDisponivel: item.quantidade,
      })),
      status: "ativo" as const,
    };

    // Verificar duplicata por número do processo
    const existingContract = contracts.find(
      contract => contract.numeroProcesso === contractData.numeroProcesso
    );

    if (existingContract) {
      toast({
        title: "Erro ao registrar ATA",
        description: `Já existe uma ATA com o número de processo ${contractData.numeroProcesso}`,
        variant: "destructive",
      });
      return;
    }

    const newContract: ATAContract = {
      id: uuidv4(),
      ...contractData,
      schoolId: currentSchool.id,
      createdBy: user.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Salvar no localStorage
    const savedId = saveContract(newContract);
    if (savedId) {
      setContracts(prev => [...prev, newContract]);

      toast({
        title: "ATA registrada com sucesso",
        description: `ATA ${contractData.numeroProcesso} foi registrada.`,
      });

      console.log(`📄 Nova ATA registrada: ${contractData.numeroProcesso} - ID: ${savedId}`);
    }
  };

  const handleUpdateContract = (updatedContract: ATAContract) => {
    // Atualizar no localStorage
    updateContract(updatedContract.id, updatedContract);
    
    // Atualizar estado local
    setContracts(prev => 
      prev.map(contract => 
        contract.id === updatedContract.id ? updatedContract : contract
      )
    );

    console.log(`📝 ATA atualizada: ${updatedContract.numeroProcesso}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Registrar Nova ATA de Registro de Preços</CardTitle>
        </CardHeader>
        <CardContent>
          <ATAForm onSubmit={handleAddContract} />
        </CardContent>
      </Card>

      <ATAContractsList 
        contracts={contracts}
        onUpdateContract={handleUpdateContract}
      />
    </div>
  );
}
