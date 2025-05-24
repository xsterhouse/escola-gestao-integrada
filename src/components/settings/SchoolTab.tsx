
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ModernSchoolForm } from "@/components/settings/ModernSchoolForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { School } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, 
  Pencil, 
  Trash2, 
  ShieldCheck, 
  Ban,
  Plus,
  Lock
} from "lucide-react";

export function SchoolTab() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [schools, setSchools] = useState<School[]>([
    {
      id: "1",
      name: "Escola Municipal João Silva",
      tradingName: "Escola João Silva",
      cnpj: "12.345.678/0001-90",
      address: "Rua das Flores, 123",
      cityState: "São Paulo/SP",
      responsibleName: "Maria Oliveira",
      phone: "(11) 91234-5678",
      email: "contato@emjs.edu.br",
      status: "active",
      director: "Carlos Eduardo Santos",
      logo: "https://via.placeholder.com/150?text=Logo+Escola",
      purchasingCenterId: "central-01",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      name: "Colégio Estadual Pedro Alves",
      tradingName: "Colégio Pedro Alves",
      cnpj: "23.456.789/0001-12",
      address: "Av. Principal, 456",
      cityState: "Rio de Janeiro/RJ",
      responsibleName: "João Pereira",
      phone: "(21) 98765-4321",
      email: "secretaria@cepa.edu.br",
      status: "suspended",
      director: "Ana Maria Lima",
      logo: "https://via.placeholder.com/150?text=Logo+Colegio",
      purchasingCenterId: "central-02",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);

  const handleOpenModal = (school?: School) => {
    if (school) {
      setCurrentSchool(school);
      setIsEditMode(true);
    } else {
      setCurrentSchool(null);
      setIsEditMode(false);
    }
    setIsModalOpen(true);
  };

  const handleSaveSchool = (schoolData: Omit<School, "id" | "createdAt" | "updatedAt" | "status">) => {
    if (isEditMode && currentSchool) {
      // Update existing school
      const updatedSchools = schools.map(s => 
        s.id === currentSchool.id 
          ? { 
              ...currentSchool, 
              ...schoolData, 
              updatedAt: new Date() 
            } 
          : s
      );
      setSchools(updatedSchools);
    } else {
      // Create new school
      const newSchool: School = {
        id: `${schools.length + 1}`,
        ...schoolData,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setSchools([...schools, newSchool]);
    }
    setIsModalOpen(false);
  };

  const handleToggleStatus = (id: string, newStatus: "active" | "suspended") => {
    const updatedSchools = schools.map(school => 
      school.id === id 
        ? { ...school, status: newStatus, updatedAt: new Date() } 
        : school
    );
    setSchools(updatedSchools);
    
    toast({ 
      title: newStatus === "active" ? "Escola ativada" : "Escola suspensa", 
      description: `O status da escola foi alterado para ${newStatus === "active" ? "ativa" : "suspensa"}.`
    });
  };

  const handleDeleteSchool = (id: string) => {
    const updatedSchools = schools.filter(school => school.id !== id);
    setSchools(updatedSchools);
    toast({ 
      title: "Escola excluída", 
      description: "A escola foi removida do sistema permanentemente."
    });
  };

  const handleViewSchool = (school: School) => {
    toast({ 
      title: "Visualizar Escola", 
      description: `Detalhes da escola ${school.name}`
    });
  };

  const handleBlockSchool = (id: string) => {
    // Implementar lógica de bloqueio
    toast({ 
      title: "Escola bloqueada", 
      description: "A escola foi bloqueada temporariamente."
    });
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Escolas</CardTitle>
          <CardDescription>
            Gerencie as escolas cadastradas no sistema.
          </CardDescription>
        </div>
        <Button 
          className="flex items-center gap-1" 
          onClick={() => handleOpenModal()}
        >
          <Plus className="h-4 w-4" />
          Nova Escola
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Diretor(a)</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schools.map((school) => (
              <TableRow key={school.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {school.logo && (
                      <img 
                        src={school.logo} 
                        alt={`Logo ${school.name}`} 
                        className="h-8 w-8 object-contain rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <div>{school.name}</div>
                      {school.tradingName && (
                        <div className="text-xs text-gray-500">{school.tradingName}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{school.cnpj}</TableCell>
                <TableCell>{school.director || "—"}</TableCell>
                <TableCell>{school.responsibleName}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    school.status === "active" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {school.status === "active" ? "Ativa" : "Suspensa"}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleViewSchool(school)}
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleOpenModal(school)}
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleBlockSchool(school.id)}
                    title="Bloquear"
                  >
                    <Lock className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleDeleteSchool(school.id)}
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {school.status === "active" ? (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleToggleStatus(school.id, "suspended")}
                      className="text-red-600 hover:text-red-700"
                      title="Suspender"
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleToggleStatus(school.id, "active")}
                      className="text-green-600 hover:text-green-700"
                      title="Ativar"
                    >
                      <ShieldCheck className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <ModernSchoolForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSchool}
        initialData={currentSchool || undefined}
      />
    </Card>
  );
}
