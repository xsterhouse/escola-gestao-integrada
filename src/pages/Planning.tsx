
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { FoodPlanningForm } from "@/components/planning/FoodPlanningForm";
import { FoodPlanningTable } from "@/components/planning/FoodPlanningTable";
import { FinalizeModal } from "@/components/planning/FinalizeModal";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: "kg" | "unidade" | "litros";
  description: string;
}

export default function Planning() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [ataNumber, setAtaNumber] = useState("");

  const addItem = (newItem: Omit<FoodItem, "id">) => {
    const itemWithId = {
      ...newItem,
      id: Math.random().toString(36).substring(2, 9),
    };
    setItems([...items, itemWithId]);
    toast({
      title: "Item adicionado",
      description: `${newItem.name} foi adicionado ao planejamento.`,
    });
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast({
      title: "Item removido",
      description: "Item removido do planejamento.",
    });
  };

  const finalizePlanning = () => {
    if (items.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item ao planejamento.",
        variant: "destructive"
      });
      return;
    }
    
    // Generate unique ATA number
    const timestamp = Date.now();
    const newAtaNumber = `ATA-${timestamp}`;
    setAtaNumber(newAtaNumber);
    setShowFinalizeModal(true);
  };

  return (
    <AppLayout requireAuth={true} requiredPermission="view_planning">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Planejamento de Alimentos</h1>
          <p className="text-muted-foreground">Adicione itens ao planejamento e gere uma ATA.</p>
        </div>

        <FoodPlanningForm onAddItem={addItem} />
        
        {items.length > 0 && (
          <div className="space-y-4">
            <FoodPlanningTable items={items} onRemoveItem={removeItem} />
            
            <div className="flex justify-end mt-6">
              <Button 
                size="lg" 
                onClick={finalizePlanning} 
                className="bg-primary hover:bg-primary/90"
              >
                Finalizar Planejamento da ATA
              </Button>
            </div>
          </div>
        )}

        {showFinalizeModal && (
          <FinalizeModal 
            isOpen={showFinalizeModal} 
            onClose={() => setShowFinalizeModal(false)} 
            ataNumber={ataNumber}
            items={items}
          />
        )}
      </div>
    </AppLayout>
  );
}
