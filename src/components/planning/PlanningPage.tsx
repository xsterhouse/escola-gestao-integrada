import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/contexts/AuthContext";
import { Planning, PlanningItem } from "@/lib/types";
import { PlanningHeader } from "./PlanningHeader";
import { PlanningForm } from "./PlanningForm";
import { PlanningActions } from "./PlanningActions";
import { PlanningTable } from "./PlanningTable";

const PlanningPage = () => {
  const { currentSchool, user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<Planning[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Planning | null>(null);
  const [items, setItems] = useState<PlanningItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Define createNewPlan function before using it in useEffect
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
    
    setCurrentPlan(newPlan);
    setItems([]);
    setPlans(prevPlans => [...prevPlans, newPlan]);
    
    // Save to localStorage
    try {
      localStorage.setItem(`plans_${currentSchool.id}`, JSON.stringify([...plans, newPlan]));
    } catch (error) {
      console.error("Error saving new plan to storage:", error);
    }
  }, [currentSchool, user, plans]);

  // Load plans for current school
  useEffect(() => {
    if (!currentSchool || !currentSchool.id) {
      setIsLoading(false);
      return;
    }

    try {
      // In a real app, this would be an API call
      // For now, we'll use mock data from localStorage
      const storedPlans = localStorage.getItem(`plans_${currentSchool.id}`);
      let parsedPlans: Planning[] = [];
      
      if (storedPlans) {
        parsedPlans = JSON.parse(storedPlans);
        setPlans(parsedPlans);
        
        // Find draft plan or create a new one
        const draftPlan = parsedPlans.find(p => p.status === "draft");
        if (draftPlan) {
          setCurrentPlan(draftPlan);
          setItems(draftPlan.items || []);
        } else {
          createNewPlan();
        }
      } else {
        createNewPlan();
      }
    } catch (error) {
      console.error("Error loading plans:", error);
      createNewPlan();
    } finally {
      setIsLoading(false);
    }
  }, [currentSchool?.id, createNewPlan]); // Added dependency to prevent infinite loop

  const savePlansToStorage = (updatedPlans: Planning[]) => {
    if (currentSchool) {
      try {
        localStorage.setItem(`plans_${currentSchool.id}`, JSON.stringify(updatedPlans));
      } catch (error) {
        console.error("Error saving plans to storage:", error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar as alterações",
          variant: "destructive"
        });
      }
    }
  };

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
    
    // Update current plan
    const updatedPlan = {
      ...currentPlan,
      items: updatedItems,
      updatedAt: new Date()
    };
    setCurrentPlan(updatedPlan);
    
    // Update plans list
    const updatedPlans = plans.map(p => 
      p.id === currentPlan.id ? updatedPlan : p
    );
    setPlans(updatedPlans);
    
    // Save to localStorage
    savePlansToStorage(updatedPlans);
    
    toast({
      title: "Item adicionado",
      description: `${newItem.name} foi adicionado ao planejamento.`
    });
  };

  const removeItem = (itemId: string) => {
    if (!currentPlan) return;
    
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    
    // Update current plan
    const updatedPlan = {
      ...currentPlan,
      items: updatedItems,
      updatedAt: new Date()
    };
    setCurrentPlan(updatedPlan);
    
    // Update plans list
    const updatedPlans = plans.map(p => 
      p.id === currentPlan.id ? updatedPlan : p
    );
    setPlans(updatedPlans);
    
    // Save to localStorage
    savePlansToStorage(updatedPlans);
    
    toast({
      title: "Item removido",
      description: "O item foi removido do planejamento."
    });
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

    // Generate ATA number: ATA-YYYY-XXXX
    const year = new Date().getFullYear();
    
    // Find the highest ATA number for this school
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
    
    // Generate new sequential number
    const newNumber = `ATA-${year}-${(lastNumber + 1).toString().padStart(4, '0')}`;
    
    // Update plan status
    const finalizedPlan: Planning = {
      ...currentPlan,
      status: "finalized",
      ataNumber: newNumber,
      finalizedAt: new Date(),
      finalizedBy: user.name,
      updatedAt: new Date()
    };
    
    // Update plans list
    const updatedPlans = plans.map(p => 
      p.id === currentPlan.id ? finalizedPlan : p
    );
    setPlans(updatedPlans);
    setCurrentPlan(finalizedPlan);
    
    // Save to localStorage
    savePlansToStorage(updatedPlans);
    
    toast({
      title: "Planejamento finalizado",
      description: `ATA de Registro de Preço ${newNumber} gerada com sucesso.`
    });
  };

  const filteredPlans = plans.filter(plan => {
    if (!searchTerm) return true;
    
    // Search by ATA number if plan is finalized
    if (plan.status === "finalized" && plan.ataNumber) {
      return plan.ataNumber.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    // Search by date
    const date = plan.finalizedAt || plan.createdAt;
    return new Date(date).toLocaleDateString().includes(searchTerm);
  });

  const selectPlan = (planId: string) => {
    const selected = plans.find(p => p.id === planId);
    if (selected) {
      setCurrentPlan(selected);
      setItems(selected.items || []);
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
