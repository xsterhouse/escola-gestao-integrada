
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ATAForm } from "./ATAForm";
import { ATAContractsList } from "./ATAContractsList";
import { ATAContract, ATAItem } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

export function ATARegistrationTab() {
  const { currentSchool, user } = useAuth();
  const { toast } = useToast();
  const [contracts, setContracts] = useState<ATAContract[]>([]);

  const handleAddContract = (contractData: Omit<ATAContract, "id" | "schoolId" | "createdBy" | "createdAt" | "updatedAt">) => {
    if (!currentSchool || !user) return;

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

    setContracts(prev => [...prev, newContract]);

    // Salvar no localStorage
    const schoolContracts = JSON.parse(localStorage.getItem(`ata_contracts_${currentSchool.id}`) || "[]");
    localStorage.setItem(`ata_contracts_${currentSchool.id}`, JSON.stringify([...schoolContracts, newContract]));

    toast({
      title: "ATA registrada com sucesso",
      description: `ATA ${contractData.numeroProcesso} do fornecedor ${contractData.fornecedor} foi registrada.`,
    });
  };

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
        onUpdateContract={(updatedContract) => {
          setContracts(prev => 
            prev.map(contract => 
              contract.id === updatedContract.id ? updatedContract : contract
            )
          );
        }}
      />
    </div>
  );
}
