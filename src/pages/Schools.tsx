
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SchoolForm } from "@/components/schools/SchoolForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { School } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const Schools = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [editingSchool, setEditingSchool] = useState<School | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Load schools from localStorage
    const storedSchools = localStorage.getItem('schools');
    if (storedSchools) {
      try {
        setSchools(JSON.parse(storedSchools));
      } catch (error) {
        console.error("Error parsing stored schools:", error);
        setSchools([]);
      }
    }
  }, []);

  // Save schools to localStorage whenever schools state changes
  useEffect(() => {
    if (schools.length > 0) {
      localStorage.setItem('schools', JSON.stringify(schools));
    }
  }, [schools]);

  const handleOpenForm = (school?: School) => {
    setEditingSchool(school);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingSchool(undefined);
    setIsFormOpen(false);
  };

  const handleSaveSchool = (schoolData: Omit<School, "id" | "createdAt" | "updatedAt">) => {
    if (editingSchool) {
      // Update existing school
      const updatedSchools = schools.map((school) =>
        school.id === editingSchool.id
          ? {
              ...school,
              ...schoolData,
              updatedAt: new Date(),
            }
          : school
      );
      setSchools(updatedSchools);
    } else {
      // Create new school
      const newSchool: School = {
        id: `${Date.now()}`,
        ...schoolData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setSchools([...schools, newSchool]);
    }
  };

  const handleDeleteSchool = (id: string) => {
    // In a real app, we would show a confirmation dialog
    if (window.confirm("Tem certeza que deseja excluir esta escola?")) {
      const updatedSchools = schools.filter((school) => school.id !== id);
      setSchools(updatedSchools);
      
      toast({
        title: "Escola excluída",
        description: "A escola foi excluída com sucesso.",
      });
    }
  };

  // Filter schools by search term
  const filteredSchools = schools.filter((school) =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.cnpj.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout requiredPermission="settings">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Escolas</h1>
          <p className="text-muted-foreground">
            Gerencie as escolas cadastradas no sistema
          </p>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="max-w-sm">
            <Input
              placeholder="Buscar por nome ou CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button onClick={() => handleOpenForm()}>Adicionar Escola</Button>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchools.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    {searchTerm 
                      ? "Nenhuma escola encontrada com esse termo de busca." 
                      : "Nenhuma escola cadastrada."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSchools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell>{school.cnpj}</TableCell>
                    <TableCell>{school.responsibleName}</TableCell>
                    <TableCell>{school.email || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenForm(school)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSchool(school.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <SchoolForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveSchool}
        initialData={editingSchool}
      />
    </AppLayout>
  );
};

export default Schools;
