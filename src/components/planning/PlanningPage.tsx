import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/contexts/AuthContext";
import { Planning, PlanningItem } from "@/lib/types";
import { useLocalStorage, useAutoSave } from "@/hooks/useLocalStorage";
import { PlanningHeader } from "./PlanningHeader";
import { PlanningForm } from "./PlanningForm";
import { PlanningActions } from "./PlanningActions";
import { PlanningTable } from "./PlanningTable";
import { savePendingTransfer } from "@/services/transferService";

const PlanningPage = () => {
  const { currentSchool, user } = useAuth();
  const { toast } = useToast();
  
  // Usar hook de localStorage
  const {
    data: storedPlans,
    loading: isLoading,
    save: savePlan,
    update: updatePlan,
    refresh: refreshPlans
  } = useLocalStorage<Planning>('planning');

  const [plans, setPlans] = useState<Planning[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Planning | null>(null);
  const [items, setItems] = useState<PlanningItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Auto-save para o plano atual
  useAutoSave('planning_current', currentPlan, { interval: 10000 });

  // Carregar dados do localStorage
  useEffect(() => {
    if (!isLoading && storedPlans.length > 0) {
      const loadedPlans = storedPlans.map(item => ({
        ...item.data,
        createdAt: new Date(item.data.createdAt),
        updatedAt: new Date(item.data.updatedAt),
        finalizedAt: item.data.finalizedAt ? new Date(item.data.finalizedAt) : undefined
      }));
      
      setPlans(loadedPlans);
      
      // Encontrar plano em draft ou criar novo
      const draftPlan = loadedPlans.find(p => p.status === "draft");
      if (draftPlan) {
        setCurrentPlan(draftPlan);
        setItems(draftPlan.items || []);
      } else {
        createNewPlan();
      }
    } else if (!isLoading && storedPlans.length === 0) {
      createNewPlan();
    }
  }, [storedPlans, isLoading]);

  const createNewPlan = useCallback(() => {
    if (!currentSchool || !user) return;
    
    const newPlan: Planning = {
      id: uuidv4(),
      schoolId: currentSchool.id,
      status: "draft",
      items: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Salvar no localStorage
    const savedId = savePlan(newPlan);
    if (savedId) {
      setCurrentPlan(newPlan);
      setItems([]);
      setPlans(prev => [...prev, newPlan]);
      
      console.log(`📋 Novo planejamento criado: ${savedId}`);
    }
  }, [currentSchool, user, savePlan]);

  const addItem = (newItem: Omit<PlanningItem, "id" | "planningId" | "createdAt" | "updatedAt" | "availableQuantity">) => {
    if (!currentPlan) return;
    
    const item: PlanningItem = {
      id: uuidv4(),
      ...newItem,
      planningId: currentPlan.id,
      availableQuantity: newItem.quantity,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updatedItems = [...items, item];
    setItems(updatedItems);
    
    // Atualizar plano atual
    const updatedPlan = {
      ...currentPlan,
      items: updatedItems,
      updatedAt: new Date()
    };
    setCurrentPlan(updatedPlan);
    
    // Atualizar no localStorage
    updatePlan(currentPlan.id, updatedPlan);
    
    // Atualizar lista local
    setPlans(prev => 
      prev.map(p => p.id === currentPlan.id ? updatedPlan : p)
    );
    
    toast({
      title: "Item adicionado",
      description: `${newItem.name} foi adicionado ao planejamento.`
    });
    
    console.log(`➕ Item adicionado ao planejamento: ${item.name}`);
  };

  const removeItem = (itemId: string) => {
    if (!currentPlan) return;
    
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    
    // Atualizar plano atual
    const updatedPlan = {
      ...currentPlan,
      items: updatedItems,
      updatedAt: new Date()
    };
    setCurrentPlan(updatedPlan);
    
    // Atualizar no localStorage
    updatePlan(currentPlan.id, updatedPlan);
    
    // Atualizar lista local
    setPlans(prev => 
      prev.map(p => p.id === currentPlan.id ? updatedPlan : p)
    );
    
    toast({
      title: "Item removido",
      description: "O item foi removido do planejamento."
    });
    
    console.log(`➖ Item removido do planejamento: ${itemId}`);
  };

  const finalizePlanning = () => {
    if (!currentPlan || !currentSchool || !user) return;
    
    if (items.length === 0) {
      toast({
        title: "Erro ao finalizar",
        description: "Adicione pelo menos um item ao planejamento.",
        variant: "destructive"
      });
      return;
    }

    // Gerar número da ATA
    const year = new Date().getFullYear();
    const schoolPlans = plans.filter(p => 
      p.schoolId === currentSchool.id && p.ataNumber && p.ataNumber.startsWith(`ATA-${year}`)
    );
    
    let lastNumber = 0;
    schoolPlans.forEach(plan => {
      if (plan.ataNumber) {
        const parts = plan.ataNumber.split('-');
        if (parts.length === 3) {
          const num = parseInt(parts[2]);
          if (!isNaN(num) && num > lastNumber) {
            lastNumber = num;
          }
        }
      }
    });
    
    const newNumber = `ATA-${year}-${(lastNumber + 1).toString().padStart(4, '0')}`;
    
    // Finalizar plano
    const finalizedPlan: Planning = {
      ...currentPlan,
      status: "finalized",
      ataNumber: newNumber,
      finalizedAt: new Date(),
      finalizedBy: user.name,
      updatedAt: new Date()
    };
    
    // Atualizar no localStorage
    updatePlan(currentPlan.id, finalizedPlan);
    
    // Atualizar estados
    setCurrentPlan(finalizedPlan);
    setPlans(prev => 
      prev.map(p => p.id === currentPlan.id ? finalizedPlan : p)
    );
    
    toast({
      title: "Planejamento finalizado",
      description: `ATA de Registro de Preço ${newNumber} gerada com sucesso.`
    });
    
    console.log(`✅ Planejamento finalizado: ${newNumber}`);
  };

  const handleTransferItem = (
    itemId: string, 
    toSchoolId: string, 
    quantity: number, 
    justificativa: string
  ) => {
    if (!currentPlan || !currentSchool || !user) return;
    
    const item = items.find(i => i.id === itemId);
    if (!item) {
      toast({
        title: "Erro",
        description: "Item não encontrado.",
        variant: "destructive"
      });
      return;
    }
    
    if (quantity > (item.availableQuantity || item.quantity)) {
      toast({
        title: "Erro",
        description: "Quantidade solicitada maior que o disponível.",
        variant: "destructive"
      });
      return;
    }
    
    // Save as pending transfer
    const pendingTransfer = savePendingTransfer(
      currentSchool.id,
      toSchoolId,
      currentPlan.id,
      itemId,
      item.name,
      quantity,
      justificativa,
      user.name
    );
    
    // Update local item quantity (reserved)
    const updatedItems = items.map(i => {
      if (i.id === itemId) {
        return {
          ...i,
          availableQuantity: (i.availableQuantity || i.quantity) - quantity
        };
      }
      return i;
    });
    
    setItems(updatedItems);
    
    // Update current plan
    const updatedPlan = {
      ...currentPlan,
      items: updatedItems,
      updatedAt: new Date()
    };
    
    setCurrentPlan(updatedPlan);
    updatePlan(currentPlan.id, updatedPlan);
    
    // Update plans list
    setPlans(prev => 
      prev.map(p => p.id === currentPlan.id ? updatedPlan : p)
    );
    
    toast({
      title: "Transferência solicitada",
      description: `Transferência de ${item.name} enviada para aprovação da escola destino.`
    });
    
    console.log(`📤 Transferência pendente criada: ${pendingTransfer.id}`);
  };

  const filteredPlans = plans.filter(plan => {
    if (!searchTerm) return true;
    
    if (plan.status === "finalized" && plan.ataNumber) {
      return plan.ataNumber.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    const date = plan.finalizedAt || plan.createdAt;
    return new Date(date).toLocaleDateString().includes(searchTerm);
  });

  const selectPlan = (planId: string) => {
    const selected = plans.find(p => p.id === planId);
    if (selected) {
      setCurrentPlan(selected);
      setItems(selected.items || []);
      console.log(`📋 Planejamento selecionado: ${planId}`);
    }
  };

  return (
    <div className="space-y-6">
      <PlanningHeader 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        currentPlan={currentPlan}
      />
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <PlanningForm 
              addItem={addItem}
              disabled={currentPlan?.status === "finalized"}
            />
            
            <PlanningActions 
              plans={filteredPlans}
              currentPlan={currentPlan}
              onSelectPlan={selectPlan}
              onCreateNew={createNewPlan}
              onFinalize={finalizePlanning}
            />
          </div>
          
          <div className="md:col-span-2">
            <PlanningTable 
              items={items} 
              onRemoveItem={removeItem}
              onTransferItem={handleTransferItem}
              isFinalized={currentPlan?.status === "finalized"}
              currentPlan={currentPlan}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanningPage;
