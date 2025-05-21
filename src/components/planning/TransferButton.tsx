
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { TransferIcon } from "lucide-react"; 
import { v4 as uuidv4 } from "uuid";
import { Planning, PlanningItem, TransferRecord, School, PurchasingCenter } from "@/lib/types";

interface TransferButtonProps {
  itemId: string;
  planningId: string;
  quantity: number;
}

const transferFormSchema = z.object({
  toSchoolId: z.string().min(1, "Selecione uma escola de destino"),
  quantity: z.coerce.number().positive("Quantidade deve ser maior que zero"),
});

// Mock purchasing centers for demo
const MOCK_PURCHASING_CENTERS: PurchasingCenter[] = [
  {
    id: "1",
    name: "Central Municipal",
    description: "Central de Compras Municipal",
    schoolIds: ["1", "3"],
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2",
    name: "Central Regional Norte",
    description: "Central de Compras Regional Norte",
    schoolIds: ["2"],
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export function TransferButton({ itemId, planningId, quantity }: TransferButtonProps) {
  const { currentSchool, availableSchools } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  const form = useForm<z.infer<typeof transferFormSchema>>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      toSchoolId: "",
      quantity: 1,
    },
  });
  
  // Get the purchasing center for current school
  const getCurrentPurchasingCenter = () => {
    if (!currentSchool) return null;
    
    return MOCK_PURCHASING_CENTERS.find(center => 
      center.schoolIds.includes(currentSchool.id)
    );
  };

  // Get all schools in the same purchasing center
  const getSchoolsInSamePurchasingCenter = () => {
    if (!currentSchool) return [];
    
    const purchasingCenter = getCurrentPurchasingCenter();
    if (!purchasingCenter) return [];
    
    return availableSchools.filter(school => 
      school.id !== currentSchool.id && // Exclude current school
      purchasingCenter.schoolIds.includes(school.id)
    );
  };
  
  const eligibleSchools = getSchoolsInSamePurchasingCenter();
  
  const onSubmit = (data: z.infer<typeof transferFormSchema>) => {
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
    const transferRecord: TransferRecord = {
      id: uuidv4(),
      fromSchoolId: currentSchool.id,
      toSchoolId: data.toSchoolId,
      planningItemId: itemId,
      quantity: data.quantity,
      transferredAt: new Date(),
      transferredBy: "John Doe", // In a real app, use user.name
      createdAt: new Date(),
    };
    
    // Save to localStorage
    const transfers = JSON.parse(localStorage.getItem("transfers") || "[]");
    localStorage.setItem("transfers", JSON.stringify([...transfers, transferRecord]));
    
    // Update source planning item quantity
    const sourcePlans = JSON.parse(localStorage.getItem(`plans_${currentSchool.id}`) || "[]");
    const sourcePlan = sourcePlans.find((p: Planning) => p.id === planningId);
    
    if (sourcePlan) {
      const updatedItems = sourcePlan.items.map((item: PlanningItem) => {
        if (item.id === itemId) {
          const availableQty = item.availableQuantity || item.quantity;
          return {
            ...item,
            availableQuantity: availableQty - data.quantity
          };
        }
        return item;
      });
      
      const updatedSourcePlan = {
        ...sourcePlan,
        items: updatedItems
      };
      
      const updatedSourcePlans = sourcePlans.map((p: Planning) => 
        p.id === planningId ? updatedSourcePlan : p
      );
      
      localStorage.setItem(`plans_${currentSchool.id}`, JSON.stringify(updatedSourcePlans));
    }
    
    // Add to target school's planning
    const targetPlans = JSON.parse(localStorage.getItem(`plans_${data.toSchoolId}`) || "[]");
    const sourcePlan = sourcePlans.find((p: Planning) => p.id === planningId);
    const sourceItem = sourcePlan?.items.find((item: PlanningItem) => item.id === itemId);
    
    if (sourceItem) {
      // Find or create target planning
      let targetPlan = targetPlans.find((p: Planning) => p.status === "draft");
      
      if (!targetPlan) {
        targetPlan = {
          id: uuidv4(),
          schoolId: data.toSchoolId,
          status: "draft",
          items: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        targetPlans.push(targetPlan);
      }
      
      // Add transferred item
      const newItem: PlanningItem = {
        id: uuidv4(),
        name: sourceItem.name,
        quantity: data.quantity,
        unit: sourceItem.unit,
        description: sourceItem.description,
        planningId: targetPlan.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      targetPlan.items.push(newItem);
      
      localStorage.setItem(`plans_${data.toSchoolId}`, JSON.stringify(targetPlans));
    }
    
    toast({
      title: "Transferência realizada",
      description: `${data.quantity} ${sourceItem?.unit} transferidos para ${targetSchool.name}`
    });
    
    setOpen(false);
    form.reset();
    
    // Force a reload to reflect changes
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <TransferIcon className="h-4 w-4" />
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="toSchoolId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Escola Destino</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma escola" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {eligibleSchools.map((school) => (
                          <SelectItem key={school.id} value={school.id}>
                            {school.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade a Transferir</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        max={quantity} 
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Saldo disponível: {quantity}
                    </p>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Transferir</Button>
              </DialogFooter>
            </form>
          </Form>
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
