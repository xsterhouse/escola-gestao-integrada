
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { InventoryMovement } from "@/lib/types";
import { ProductAutocomplete } from "./ProductAutocomplete";

interface AddManualMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (movement: Omit<InventoryMovement, "id" | "createdAt" | "updatedAt">) => void;
  invoices: any[];
  ProductAutocomplete: any;
}

const formSchema = z.object({
  type: z.enum(['entrada', 'saida']),
  date: z.string().min(1, "Data é obrigatória"),
  productDescription: z.string().min(1, "Produto é obrigatório"),
  quantity: z.number().positive("Quantidade deve ser positiva"),
  unitOfMeasure: z.string().min(1, "Unidade de medida é obrigatória"),
  unitPrice: z.number().nonnegative("Valor unitário deve ser não-negativo"),
});

type FormValues = z.infer<typeof formSchema>;

export function AddManualMovementDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  invoices, 
  ProductAutocomplete 
}: AddManualMovementDialogProps) {
  const [selectedProduct, setSelectedProduct] = useState<{
    description: string;
    unitOfMeasure: string;
    unitPrice: number;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'entrada',
      date: new Date().toISOString().split('T')[0],
      productDescription: "",
      quantity: 1,
      unitOfMeasure: "",
      unitPrice: 0,
    },
  });

  const handleProductSelect = (product: {
    description: string;
    unitOfMeasure: string;
    unitPrice: number;
  }) => {
    setSelectedProduct(product);
    form.setValue('productDescription', product.description);
    form.setValue('unitOfMeasure', product.unitOfMeasure);
    form.setValue('unitPrice', product.unitPrice);
  };

  const handleSubmit = (values: FormValues) => {
    const totalCost = values.quantity * values.unitPrice;
    
    const movement: Omit<InventoryMovement, "id" | "createdAt" | "updatedAt"> = {
      type: values.type,
      date: new Date(values.date),
      productDescription: values.productDescription,
      quantity: values.quantity,
      unitOfMeasure: values.unitOfMeasure,
      unitPrice: values.unitPrice,
      totalCost,
      source: 'manual',
    };

    onSubmit(movement);
    form.reset();
    setSelectedProduct(null);
  };

  const watchType = form.watch('type');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Movimentação Manual</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Movimentação</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-row space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="entrada" id="entrada" />
                        <Label htmlFor="entrada">Entrada</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="saida" id="saida" />
                        <Label htmlFor="saida">Saída</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produto</FormLabel>
                  <FormControl>
                    {watchType === 'saida' ? (
                      <ProductAutocomplete
                        invoices={invoices}
                        value={field.value}
                        onProductSelect={handleProductSelect}
                        placeholder="Selecione um produto do estoque..."
                      />
                    ) : (
                      <Input {...field} placeholder="Digite o nome do produto" />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitOfMeasure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Un, Kg, L..."
                        readOnly={watchType === 'saida' && !!selectedProduct}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Unitário</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                      readOnly={watchType === 'saida' && !!selectedProduct}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Adicionar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
