import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Pencil, Trash2, Plus, School as SchoolIcon, Ban, ShieldCheck } from "lucide-react";
import { PurchasingCenter, School } from "@/lib/types";

export function PurchasingCenterTab() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCenter, setCurrentCenter] = useState<PurchasingCenter | null>(null);
  
  const [purchasingCenters, setPurchasingCenters] = useState<PurchasingCenter[]>([
    {
      id: "1",
      name: "POLO Regional Leste",
      description: "Polo de compras para escolas da região leste",
      schoolIds: ["1", "2"],
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      name: "POLO Regional Sul",
      description: "Polo de compras para escolas da região sul",
      schoolIds: ["3"],
      status: "inactive",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);
  
  // Mock schools data
  const [schools, setSchools] = useState<School[]>([
    {
      id: "1",
      name: "Escola Municipal João Silva",
      cnpj: "12.345.678/0001-90",
      responsibleName: "Maria Oliveira",
      email: "contato@joaodasilva.edu.br",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      name: "Colégio Estadual Pedro Alves",
      cnpj: "23.456.789/0001-12",
      responsibleName: "João Pereira",
      email: "secretaria@cepa.edu.br",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "3",
      name: "Escola Municipal Maria José",
      cnpj: "34.567.890/0001-23",
      responsibleName: "Carlos Eduardo",
      email: "contato@mariajose.edu.br",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    schoolIds: [] as string[]
  });

  const handleOpenModal = (center?: PurchasingCenter) => {
    if (center) {
      setCurrentCenter(center);
      setFormData({
        name: center.name,
        description: center.description,
        schoolIds: [...center.schoolIds]
      });
      setIsEditMode(true);
    } else {
      setCurrentCenter(null);
      setFormData({
        name: "",
        description: "",
        schoolIds: []
      });
      setIsEditMode(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFormChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleToggleSchool = (schoolId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        schoolIds: [...prev.schoolIds, schoolId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        schoolIds: prev.schoolIds.filter(id => id !== schoolId)
      }));
    }
  };

  const handleSaveCenter = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Campo obrigatório",
        description: "O nome do POLO é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    if (formData.schoolIds.length === 0) {
      toast({
        title: "Escolas não selecionadas",
        description: "Selecione pelo menos uma escola para o POLO.",
        variant: "destructive"
      });
      return;
    }

    if (isEditMode && currentCenter) {
      // Update existing center
      const updatedCenters = purchasingCenters.map(center => 
        center.id === currentCenter.id
          ? {
              ...center,
              name: formData.name,
              description: formData.description,
              schoolIds: formData.schoolIds,
              updatedAt: new Date()
            }
          : center
      );
      setPurchasingCenters(updatedCenters);
      toast({
        title: "POLO atualizado",
        description: "O POLO foi atualizado com sucesso."
      });
    } else {
      // Create new center
      const newCenter: PurchasingCenter = {
        id: `${purchasingCenters.length + 1}`,
        name: formData.name,
        description: formData.description,
        schoolIds: formData.schoolIds,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setPurchasingCenters([...purchasingCenters, newCenter]);
      toast({
        title: "POLO criado",
        description: "O POLO foi criado com sucesso."
      });
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = (id: string, newStatus: "active" | "inactive") => {
    const updatedCenters = purchasingCenters.map(center => 
      center.id === id
        ? { ...center, status: newStatus, updatedAt: new Date() }
        : center
    );
    setPurchasingCenters(updatedCenters);
    toast({
      title: newStatus === "active" ? "POLO ativado" : "POLO desativado",
      description: `O status do POLO foi alterado para ${newStatus === "active" ? "ativo" : "inativo"}.`
    });
  };

  const handleDeleteCenter = (id: string) => {
    setPurchasingCenters(prev => prev.filter(center => center.id !== id));
    toast({
      title: "POLO excluído",
      description: "O POLO foi excluído com sucesso."
    });
  };

  const getSchoolNames = (schoolIds: string[]) => {
    return schoolIds
      .map(id => schools.find(school => school.id === id)?.name || "")
      .filter(Boolean)
      .join(", ");
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Central de Compras (POLO)</CardTitle>
          <CardDescription>
            Gerencie os polos de compras para grupos de instituições.
          </CardDescription>
        </div>
        <Button 
          className="flex items-center gap-1" 
          onClick={() => handleOpenModal()}
        >
          <Plus className="h-4 w-4" />
          Nova Central de compras
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Instituições</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchasingCenters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  Nenhum POLO cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              purchasingCenters.map((center) => (
                <TableRow key={center.id}>
                  <TableCell className="font-medium">{center.name}</TableCell>
                  <TableCell>{center.description}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{center.schoolIds.length} escolas</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {getSchoolNames(center.schoolIds)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      center.status === "active" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {center.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleOpenModal(center)}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDeleteCenter(center.id)}
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {center.status === "active" ? (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleToggleStatus(center.id, "inactive")}
                        className="text-red-600 hover:text-red-700"
                        title="Desativar"
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleToggleStatus(center.id, "active")}
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

        <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? "Editar Central de Compras" : "Nova Central de Compras"}
              </DialogTitle>
              <DialogDescription>
                {isEditMode 
                  ? "Atualize os dados da Central de Compras." 
                  : "Cadastre uma nova Central de Compras para grupo de escolas."}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSaveCenter}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Central de Compras *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    placeholder="Nome da Central de Compras"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleFormChange("description", e.target.value)}
                    placeholder="Descrição da Central de Compras"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Escola Central *</Label>
                  <div className="border rounded-md p-4 max-h-[200px] overflow-y-auto">
                    {schools.map((school) => (
                      <div key={school.id} className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id={`school-${school.id}`}
                          checked={formData.schoolIds.includes(school.id)}
                          onCheckedChange={(checked) => 
                            handleToggleSchool(school.id, checked === true)
                          }
                        />
                        <Label 
                          htmlFor={`school-${school.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {school.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {isEditMode ? "Atualizar" : "Cadastrar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
