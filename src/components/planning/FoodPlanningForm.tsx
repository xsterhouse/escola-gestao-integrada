
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FoodItem } from "@/pages/Planning";
import { Plus } from "lucide-react";

interface FoodPlanningFormProps {
  onAddItem: (newItem: Omit<FoodItem, "id">) => void;
}

export function FoodPlanningForm({ onAddItem }: FoodPlanningFormProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<"kg" | "unidade" | "litros">("kg");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Make sure all required fields are filled
    if (!name || quantity <= 0) {
      return;
    }

    // Pass all required properties (name, quantity, unit are required, description is optional)
    onAddItem({
      name,
      quantity,
      unit,
      description
    });
    
    // Reset form
    setName("");
    setQuantity(1);
    setUnit("kg");
    setDescription("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Item ao Planejamento</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nome do Item
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Arroz, Feijão, etc."
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium">
                Quantidade
              </label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="unit" className="text-sm font-medium">
                Unidade
              </label>
              <Select value={unit} onValueChange={(value: "kg" | "unidade" | "litros") => setUnit(value)}>
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="kg">Kg</SelectItem>
                    <SelectItem value="unidade">Unidade</SelectItem>
                    <SelectItem value="litros">Litros</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Descrição
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione detalhes sobre este item (opcional)"
              rows={3}
            />
          </div>
          
          <Button type="submit" className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Adicionar Item
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
