
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Planning } from "@/lib/types";

interface PlanningHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentPlan: Planning | null;
}

export function PlanningHeader({ searchTerm, setSearchTerm, currentPlan }: PlanningHeaderProps) {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Planejamento</h2>
        <p className="text-muted-foreground">
          {currentPlan?.status === "finalized" 
            ? `ATA ${currentPlan.ataNumber} - Finalizada em ${new Date(currentPlan.finalizedAt as Date).toLocaleDateString()}` 
            : "Crie seu planejamento de alimentos para licitação"}
        </p>
      </div>
      
      <div className="relative w-full md:w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por ATA ou data..."
          className="pl-8 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
}
