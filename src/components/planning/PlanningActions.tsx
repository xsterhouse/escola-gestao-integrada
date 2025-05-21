
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Planning } from "@/lib/types";
import { ClipboardList, Plus, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface PlanningActionsProps {
  plans: Planning[];
  currentPlan: Planning | null;
  onSelectPlan: (id: string) => void;
  onCreateNew: () => void;
  onFinalize: () => void;
}

export function PlanningActions({ 
  plans, 
  currentPlan, 
  onSelectPlan,
  onCreateNew, 
  onFinalize 
}: PlanningActionsProps) {
  const { currentSchool } = useAuth();
  
  // Sort plans: draft first, then by date (newest first)
  const sortedPlans = [...plans]
    .filter(plan => plan.schoolId === currentSchool?.id) // Only show plans for current school
    .sort((a, b) => {
      // Draft plans come first
      if (a.status === "draft" && b.status !== "draft") return -1;
      if (a.status !== "draft" && b.status === "draft") return 1;
      
      // Then sort by date (newest first)
      const dateA = a.finalizedAt || a.updatedAt;
      const dateB = b.finalizedAt || b.updatedAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

  return (
    <div className="mt-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={onCreateNew} 
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Planejamento
          </Button>
          
          {currentPlan && currentPlan.status === "draft" && (
            <Button 
              onClick={onFinalize} 
              variant="secondary" 
              className="w-full"
            >
              <Check className="mr-2 h-4 w-4" />
              Finalizar Planejamento
            </Button>
          )}
        </CardContent>
      </Card>
      
      {sortedPlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Planejamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              <div className="space-y-2">
                {sortedPlans.map((plan) => {
                  const isActive = currentPlan?.id === plan.id;
                  const date = plan.finalizedAt || plan.createdAt;
                  
                  return (
                    <Button
                      key={plan.id}
                      variant={isActive ? "default" : "outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        isActive ? "bg-primary text-primary-foreground" : ""
                      )}
                      onClick={() => onSelectPlan(plan.id)}
                    >
                      <div className="flex flex-col items-start">
                        <div className="flex items-center">
                          <ClipboardList className="mr-2 h-4 w-4" />
                          <span className="font-medium">
                            {plan.status === "finalized" 
                              ? plan.ataNumber 
                              : "Planejamento em rascunho"}
                          </span>
                        </div>
                        <span className="mt-1 text-xs opacity-70">
                          {plan.status === "finalized" 
                            ? `Finalizado em ${new Date(date).toLocaleDateString()}`
                            : `Criado em ${new Date(date).toLocaleDateString()}`}
                        </span>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
