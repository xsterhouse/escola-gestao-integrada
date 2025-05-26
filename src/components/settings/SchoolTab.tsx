import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ModernSchoolForm } from "@/components/settings/ModernSchoolForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { School } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";
import { 
  Eye, 
  Pencil, 
  Trash2, 
  ShieldCheck, 
  Ban,
  Plus,
  Lock
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function SchoolTab() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  
  // Usar hook de sincronização em vez de useState + useEffect manual
  const { data: schools, saveData: setSchools } = useLocalStorageSync<School>('schools', []);

  const handleOpenModal = (school?: School) => {
    console.log('Abrindo modal para escola:', school);
    if (school) {
      setCurrentSchool(school);
      setIsEditMode(true);
    } else {
      setCurrentSchool(null);
      setIsEditMode(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSchool(null);
    setIsEditMode(false);
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
        id: Date.now().toString(),
        ...schoolData,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const updatedSchools = [...schools, newSchool];
      setSchools(updatedSchools);
      
      console.log(`✅ Nova escola criada: ${schoolData.name} - Total: ${updatedSchools.length}`);
    }
    
    handleCloseModal();
    
    toast({
      title: isEditMode ? "Escola atualizada" : "Escola cadastrada",
      description: isEditMode 
        ? "A escola foi atualizada com sucesso." 
        : "A escola foi cadastrada com sucesso.",
    });
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
    if (window.confirm("Tem certeza que deseja excluir esta escola? Esta ação não pode ser desfeita.")) {
      const updatedSchools = schools.filter(school => school.id !== id);
      setSchools(updatedSchools);
      toast({ 
        title: "Escola excluída", 
        description: "A escola foi removida do sistema permanentemente."
      });
    }
  };

  const handleViewSchool = (school: School) => {
    setCurrentSchool(school);
    setIsViewModalOpen(true);
  };

  const handleBlockSchool = (id: string) => {
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
            Gerencie as escolas cadastradas no sistema. Total: {schools.length}
          </CardDescription>
        </div>
        <Button 
          className="flex items-center gap-1"
          style={{ backgroundColor: '#012340', color: 'white' }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#013a5c';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#012340';
          }}
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
            {schools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Nenhuma escola cadastrada. Clique em "Nova Escola" para começar.
                </TableCell>
              </TableRow>
            ) : (
              schools.map((school) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <ModernSchoolForm 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        onSave={handleSaveSchool}
        initialData={currentSchool || undefined}
        key={currentSchool?.id || 'new'} // Force re-render when school changes
      />

      {/* Modal de Visualização */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Visualizar Escola</DialogTitle>
            <DialogDescription>
              Detalhes da escola cadastrada no sistema.
            </DialogDescription>
          </DialogHeader>
          
          {currentSchool && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {currentSchool.logo && (
                <div className="md:col-span-2 flex justify-center">
                  <img 
                    src={currentSchool.logo} 
                    alt={`Logo ${currentSchool.name}`} 
                    className="h-20 w-20 object-contain border rounded"
                  />
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium">Nome da Instituição</label>
                <p className="text-sm text-gray-600">{currentSchool.name}</p>
              </div>
              
              {currentSchool.tradingName && (
                <div>
                  <label className="text-sm font-medium">Nome Fantasia</label>
                  <p className="text-sm text-gray-600">{currentSchool.tradingName}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium">CNPJ</label>
                <p className="text-sm text-gray-600">{currentSchool.cnpj}</p>
              </div>
              
              {currentSchool.director && (
                <div>
                  <label className="text-sm font-medium">Diretor(a)</label>
                  <p className="text-sm text-gray-600">{currentSchool.director}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium">Responsável</label>
                <p className="text-sm text-gray-600">{currentSchool.responsibleName}</p>
              </div>
              
              {currentSchool.email && (
                <div>
                  <label className="text-sm font-medium">E-mail</label>
                  <p className="text-sm text-gray-600">{currentSchool.email}</p>
                </div>
              )}
              
              {currentSchool.phone && (
                <div>
                  <label className="text-sm font-medium">Telefone</label>
                  <p className="text-sm text-gray-600">{currentSchool.phone}</p>
                </div>
              )}
              
              {currentSchool.address && (
                <div>
                  <label className="text-sm font-medium">Endereço</label>
                  <p className="text-sm text-gray-600">{currentSchool.address}</p>
                </div>
              )}
              
              {currentSchool.cityState && (
                <div>
                  <label className="text-sm font-medium">Cidade/Estado</label>
                  <p className="text-sm text-gray-600">{currentSchool.cityState}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium">Status</label>
                <p className="text-sm text-gray-600">
                  {currentSchool.status === "active" ? "Ativa" : "Suspensa"}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
