
import { Control, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { ATAItemForm } from "./ATAItemForm";

interface ProductSuggestion {
  id: string;
  description: string;
  unit: string;
  item?: number;
}

interface PlanningFormData {
  items: Array<{
    nome: string;
    unidade: string;
    quantidade: number;
    descricao?: string;
  }>;
}

interface ATAItemsListProps {
  control: Control<PlanningFormData>;
  setValue: (name: string, value: any) => void;
}

export function ATAItemsList({ control, setValue }: ATAItemsListProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const handleProductSelect = (index: number, product: ProductSuggestion) => {
    console.log(`🎯 Produto selecionado para item ${index}:`, product);
    setValue(`items.${index}.nome`, product.description);
    setValue(`items.${index}.unidade`, product.unit);
    
    if (product.item) {
      console.log(`📋 Produto selecionado tem item ${product.item}`);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Itens da ATA</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ nome: "", unidade: "", quantidade: 0, descricao: "" })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Item
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field, index) => (
          <ATAItemForm
            key={field.id}
            control={control}
            index={index}
            onRemove={() => remove(index)}
            canRemove={fields.length > 1}
            onProductSelect={(product) => handleProductSelect(index, product)}
          />
        ))}
      </CardContent>
    </Card>
  );
}
