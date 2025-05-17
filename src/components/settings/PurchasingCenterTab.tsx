
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Eye, Pencil, Trash2, Plus, Building, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Define types for PurchasingCenter
interface PurchasingCenter {
  id: string;
  name: string;
  description: string;
  schoolIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export function PurchasingCenterTab() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCenter, setCurrentCenter] = useState<PurchasingCenter | null>(null);
  
  const [centers, setCenters] = useState<PurchasingCenter[]>([
    {
      id: "1",
      name: "Polo Regional Norte",
      description: "Atende escolas da região norte do município",
      schoolIds: ["1"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      name: "Polo Regional Sul",
      description: "Atende escolas da região sul do município",
      schoolIds: ["2"],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);

  // Mock schools data
  const schools = [
    {
      id: "1",
      name: "Escola Municipal João da Silva",
      cnpj: "12.345.678/0001-90",
      status: "active"
    },
    {
      id: "2",
      name: "Colégio Estadual Paulo Freire",
      cnpj: "98.765.432/0001-10",
      status: "active"
    },
    {
      id: "3",
      name: "Escola Municipal Maria José",
      cnpj: "45.678.901/0001-23",
      status: "active"
    }
  ];

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
        schoolIds: center.schoolIds
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSchoolToggle = (schoolId: string) => {
    setFormData(prev => {
      const schoolIds = prev.schoolIds.includes(schoolId)
        ? prev.schoolIds.filter(id => id !== schoolId)
        : [...prev.schoolIds, schoolId];

      return { ...prev, schoolIds };
    });
  };

  const handleSaveCenter = () => {
    if (isEditMode && currentCenter) {
      // Update existing center
      const updatedCenters = centers.map(c => 
        c.id === currentCenter.id 
          ? { ...currentCenter, ...formData, updatedAt: new Date() } 
          : c
      );
      setCenters(updatedCenters);
      toast({ 
        title: "Central atualizada", 
        description: "A central de compras foi atualizada com sucesso."
      });
    } else {
      // Create new center
      const newCenter: PurchasingCenter = {
        id: `${centers.length + 1}`,
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setCenters([...centers, newCenter]);
      toast({ 
        title: "Central adicionada", 
        description: "A central de compras foi adicionada com sucesso."
      });
    }
    setIsModalOpen(false);
  };

  const handleDeleteCenter = (id: string) => {
    const updatedCenters = centers.filter(center => center.id !== id);
    setCenters(updatedCenters);
    toast({ 
      title: "Central excluída", 
      description: "A central de compras foi removida do sistema."
    });
  };

  const handleViewSchools = (center: PurchasingCenter) => {
    const schoolNames = schools
      .filter(school => center.schoolIds.includes(school.id))
      .map(school => school.name)
      .join(", ");
    
    toast({ 
      title: "Escolas vinculadas", 
      description: schoolNames || "Nenhuma escola vinculada"
    });
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Central de Compras</CardTitle>
          <CardDescription>
            Gerencie os polos de compras e suas escolas vinculadas.
          </CardDescription>
        </div>
        <Button 
          className="flex items-center gap-1" 
          onClick={() => handleOpenModal()}
        >
          <Plus className="h-4 w-4" />
          Novo Polo
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Escolas Vinculadas</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {centers.map((center) => (
              <TableRow key={center.id}>
                <TableCell className="font-medium">{center.name}</TableCell>
                <TableCell>{center.description}</TableCell>
                <TableCell>{center.schoolIds.length}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleViewSchools(center)}
                    title="Ver Escolas"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Editar Polo" : "Novo Polo"}</DialogTitle>
              <DialogDescription>
                {isEditMode 
                  ? "Edite as informações da central de compras" 
                  : "Preencha as informações para criar uma nova central de compras"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descrição
                </Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <Label className="text-right pt-2">
                  Escolas
                </Label>
                <div className="col-span-3 space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-2">
                  {schools.map((school) => (
                    <div key={school.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`school-${school.id}`}
                        checked={formData.schoolIds.includes(school.id)}
                        onCheckedChange={() => handleSchoolToggle(school.id)}
                      />
                      <label 
                        htmlFor={`school-${school.id}`} 
                        className="text-sm cursor-pointer"
                      >
                        {school.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveCenter}>
                {isEditMode ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
