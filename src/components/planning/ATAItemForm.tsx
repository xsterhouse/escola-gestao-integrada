
import { Controller, Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Trash2 } from "lucide-react";
import { ATAProductAutocomplete } from "./ATAProductAutocomplete";
import { ATAFormData } from "./types";

interface ProductSuggestion {
  id: string;
  description: string;
  unit: string;
  item?: number;
}

interface ATAItemFormProps {
  control: Control<ATAFormData>;
  index: number;
  onRemove: () => void;
  canRemove: boolean;
  onProductSelect: (product: ProductSuggestion) => void;
}

export function ATAItemForm({ 
  control, 
  index, 
  onRemove, 
  canRemove, 
  onProductSelect 
}: ATAItemFormProps) {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Item {index + 1}</h4>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Descrição do Produto *
          </label>
          <Controller
            control={control}
            name={`items.${index}.nome`}
            render={({ field, fieldState }) => (
              <div>
                <ATAProductAutocomplete
                  value={field.value || ""}
                  onChange={field.onChange}
                  onProductSelect={onProductSelect}
                  placeholder="Digite para buscar produtos do catálogo..."
                  disabled={field.disabled}
                />
                {fieldState.error && (
                  <p className="text-sm font-medium text-destructive mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        <FormField
          control={control}
          name={`items.${index}.unidade`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidade *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Kg, Unidade, Litro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name={`items.${index}.quantidade`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quantidade *</FormLabel>
            <FormControl>
              <Input type="number" placeholder="500" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`items.${index}.descricao`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Observações adicionais sobre o produto..."
                className="min-h-[100px] resize-y"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
