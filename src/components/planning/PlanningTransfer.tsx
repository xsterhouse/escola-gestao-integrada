
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { School } from "@/lib/types";

// Mock central de compras data
const MOCK_PURCHASING_CENTERS = [
  {
    id: "1",
    name: "Central Norte",
    schoolIds: ["1", "3"] // IDs from MOCK_SCHOOLS in AuthContext
  },
  {
    id: "2",
    name: "Central Sul",
    schoolIds: ["2"] // ID from MOCK_SCHOOLS in AuthContext
  }
];

const PlanningTransfer: React.FC = () => {
  const { currentSchool, availableSchools } = useAuth();
  const [targetSchoolId, setTargetSchoolId] = useState<string>("");
  const [itemName, setItemName] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(0);
  const [unit, setUnit] = useState<string>("");

  // Get schools in the same purchasing center
  const schoolsInSameCenter = React.useMemo(() => {
    if (!currentSchool) return [];
    
    // Find the purchasing center that contains the current school
    const currentCenter = MOCK_PURCHASING_CENTERS.find(center => 
      center.schoolIds.includes(currentSchool.id)
    );
    
    if (!currentCenter) return [];
    
    // Filter available schools that are in the same center but not the current school
    return availableSchools.filter(school => 
      currentCenter.schoolIds.includes(school.id) && school.id !== currentSchool.id
    );
  }, [currentSchool, availableSchools]);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!targetSchoolId || !itemName || !quantity || quantity <= 0 || !unit) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    const targetSchool = availableSchools.find(school => school.id === targetSchoolId);
    if (!targetSchool) return;
    
    // Here we would perform the actual transfer in a real application
    console.log("Transferring:", {
      fromSchool: currentSchool?.name,
      toSchool: targetSchool.name,
      itemName,
      quantity,
      unit
    });
    
    toast({
      title: "Transferência realizada",
      description: `${quantity} ${unit} de ${itemName} transferidos para ${targetSchool.name}.`,
    });
    
    // Reset form
    setTargetSchoolId("");
    setItemName("");
    setQuantity(0);
    setUnit("");
  };

  if (schoolsInSameCenter.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transferência de Saldo</CardTitle>
          <CardDescription>
            Não há escolas disponíveis na mesma central de compras.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transferência de Saldo</CardTitle>
        <CardDescription>
          Transfira saldo de itens para outras escolas da mesma central de compras.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTransfer} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="targetSchool">Escola Destino</Label>
            <Select 
              value={targetSchoolId} 
              onValueChange={setTargetSchoolId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a escola" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {schoolsInSameCenter.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemName">Nome do Item</Label>
            <Input
              id="itemName"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Ex: Arroz Branco"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min="0.01"
                step="0.01"
                value={quantity || ""}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="Ex: 100"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Unidade</Label>
              <Input
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Ex: kg"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Realizar Transferência
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PlanningTransfer;
