
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
import { ArrowLeft } from "lucide-react";
import { TransferForm } from "./TransferForm";
import { TransferFormValues } from "./TransferFormSchema";
import { getSchoolsInSamePurchasingCenter } from "@/utils/purchasingCenters";
import { addToTargetSchoolPlanning, saveTransferRecord, updateSourcePlanningQuantity } from "@/services/transferService";

interface TransferButtonProps {
  itemId: string;
  planningId: string;
  quantity: number;
}

export function TransferButton({ itemId, planningId, quantity }: TransferButtonProps) {
  const { currentSchool, availableSchools } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  const eligibleSchools = currentSchool 
    ? getSchoolsInSamePurchasingCenter(currentSchool.id, availableSchools)
    : [];
  
  const handleSubmit = (data: TransferFormValues) => {
    if (!currentSchool) return;
    
    // Validate quantity
    if (data.quantity > quantity) {
      toast({
        title: "Erro na transferência",
        description: "Quantidade a transferir é maior que o saldo disponível",
        variant: "destructive"
      });
      return;
    }
    
    // Get target school
    const targetSchool = availableSchools.find(s => s.id === data.toSchoolId);
    if (!targetSchool) {
      toast({
        title: "Erro na transferência",
        description: "Escola de destino não encontrada",
        variant: "destructive"
      });
      return;
    }
    
    // Save transfer record
    saveTransferRecord(
      currentSchool.id,
      data.toSchoolId,
      itemId,
      data.quantity,
      "John Doe" // In a real app, use user.name
    );
    
    // Update source planning item quantity
    const result = updateSourcePlanningQuantity(
      currentSchool.id,
      planningId,
      itemId,
      data.quantity
    );
    
    if (!result) {
      toast({
        title: "Erro na transferência",
        description: "Planejamento de origem não encontrado",
        variant: "destructive"
      });
      return;
    }
    
    // Add to target school's planning
    const targetResult = addToTargetSchoolPlanning(
      data.toSchoolId,
      result.sourcePlan,
      itemId,
      data.quantity
    );
    
    if (!targetResult) {
      toast({
        title: "Erro na transferência",
        description: "Item de origem não encontrado",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Transferência realizada",
      description: `${data.quantity} ${targetResult.sourceItem.unit} transferidos para ${targetSchool.name}`
    });
    
    setOpen(false);
    
    // Force a reload to reflect changes
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transferir Saldo</DialogTitle>
          <DialogDescription>
            Transferir saldo do item para outra escola na mesma Central de Compras
          </DialogDescription>
        </DialogHeader>
        
        {eligibleSchools.length > 0 ? (
          <TransferForm 
            eligibleSchools={eligibleSchools}
            quantity={quantity}
            onSubmit={handleSubmit}
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
