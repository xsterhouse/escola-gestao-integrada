
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Search,
  FileText,
  Plus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

interface PlanningHeaderProps {}

const PlanningHeader: React.FC<PlanningHeaderProps> = () => {
  const { currentSchool } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality will be implemented here
    console.log("Searching for:", searchQuery);
  };

  const handleCreateNew = () => {
    // Create new plan functionality
    console.log("Creating new plan");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Planejamento
          {currentSchool && (
            <span className="ml-2 text-sm text-muted-foreground">
              ({currentSchool.name})
            </span>
          )}
        </h1>
        <Button onClick={handleCreateNew}>
          <Plus size={16} className="mr-2" />
          Novo Planejamento
        </Button>
      </div>
      <div className="flex w-full items-center space-x-2">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <Input
            placeholder="Buscar por número da ATA ou data..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="outline">
            <Search size={16} className="mr-2" />
            Buscar
          </Button>
        </form>
        <Button variant="outline">
          <FileText size={16} className="mr-2" />
          Relatórios
        </Button>
      </div>
    </div>
  );
};

export default PlanningHeader;
