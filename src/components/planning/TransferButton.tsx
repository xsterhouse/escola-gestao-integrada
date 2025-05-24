
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";
import { ATATransferForm } from "./ATATransferForm";

interface TransferButtonProps {
  contractId: string;
  itemId: string;
  availableQuantity: number;
  itemName: string;
  onTransferComplete: () => void;
}

export function TransferButton({ 
  contractId, 
  itemId, 
  availableQuantity, 
  itemName,
  onTransferComplete 
}: TransferButtonProps) {
  const { currentSchool, availableSchools } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  // Escolas da mesma central de compras (simulado)
  const eligibleSchools = availableSchools.filter(school => 
    school.id !== currentSchool?.id && 
    school.purchasingCenterId === currentSchool?.purchasingCenterId
  );

  const handleTransferSubmit = (transferData: {
    toSchoolId: string;
    quantity: number;
    justificativa: string;
  }) => {
    if (!currentSchool) return;

    // Atualizar saldo do item de origem
    const sourceContracts = JSON.parse(
      localStorage.getItem(`ata_contracts_${currentSchool.id}`) || "[]"
    );
    
    const updatedSourceContracts = sourceContracts.map((contract: any) => {
      if (contract.id === contractId) {
        return {
          ...contract,
          items: contract.items.map((item: any) => {
            if (item.id === itemId) {
              return {
                ...item,
                saldoDisponivel: item.saldoDisponivel - transferData.quantity
              };
            }
            return item;
          })
        };
      }
      return contract;
    });

    localStorage.setItem(`ata_contracts_${currentSchool.id}`, JSON.stringify(updatedSourceContracts));

    // Adicionar item na escola de destino
    const targetContracts = JSON.parse(
      localStorage.getItem(`ata_contracts_${transferData.toSchoolId}`) || "[]"
    );

    // Criar registro de transferência
    const transferRecord = {
      id: crypto.randomUUID(),
      fromSchoolId: currentSchool.id,
      toSchoolId: transferData.toSchoolId,
      contractId,
      itemId,
      quantity: transferData.quantity,
      transferredAt: new Date(),
      transferredBy: "Usuário Atual", // Em produção, usar dados reais do usuário
      justificativa: transferData.justificativa,
    };

    const transfers = JSON.parse(localStorage.getItem("ata_transfers") || "[]");
    localStorage.setItem("ata_transfers", JSON.stringify([...transfers, transferRecord]));

    const targetSchool = eligibleSchools.find(s => s.id === transferData.toSchoolId);
    
    toast({
      title: "Transferência realizada",
      description: `${transferData.quantity} unidades de ${itemName} transferidas para ${targetSchool?.name}`,
    });

    setOpen(false);
    onTransferComplete();
  };

  if (availableQuantity <= 0) {
    return (
      <Button variant="ghost" size="sm" disabled>
        Sem saldo
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ArrowRight className="h-4 w-4 mr-2" />
          Transferir
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transferir Saldo</DialogTitle>
          <DialogDescription>
            Transferir saldo de {itemName} para outra escola da mesma Central de Compras
          </DialogDescription>
        </DialogHeader>
        
        {eligibleSchools.length > 0 ? (
          <ATATransferForm 
            eligibleSchools={eligibleSchools}
            availableQuantity={availableQuantity}
            onSubmit={handleTransferSubmit}
          />
        ) : (
          <div className="py-4">
            <p className="text-center text-sm text-muted-foreground">
              Não há escolas elegíveis para transferência na mesma Central de Compras.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
