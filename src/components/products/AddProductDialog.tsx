
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "@/lib/types";
import { useEffect, useState } from "react";

// Update the schema to include the new fields
const productSchema = z.object({
  item: z.number().int().positive("O número do item deve ser positivo"),
  description: z.string().min(1, "A descrição é obrigatória"),
  unit: z.string().min(1, "A unidade é obrigatória"),
  quantity: z.string().optional(),
  familyAgriculture: z.boolean().default(false),
  indication: z.string().max(50, "A indicação deve ter no máximo 50 caracteres").optional(),
  restriction: z.string().max(50, "A restrição deve ter no máximo 50 caracteres").optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => void;
  existingProducts: Product[];
}

export function AddProductDialog({ open, onOpenChange, onSave, existingProducts }: AddProductDialogProps) {
  const [nextItemNumber, setNextItemNumber] = useState<number>(1);

  // Calculate the next item number based on existing products
  useEffect(() => {
    if (existingProducts.length > 0) {
      const maxItem = Math.max(...existingProducts.map(p => p.item));
      setNextItemNumber(maxItem + 1);
    }
  }, [existingProducts]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      item: nextItemNumber,
      description: "",
      unit: "",
      quantity: "",
      familyAgriculture: false,
      indication: "",
      restriction: "",
    },
  });

  // Update form values when nextItemNumber changes
  useEffect(() => {
    form.setValue("item", nextItemNumber);
  }, [nextItemNumber, form]);

  function onSubmit(data: ProductFormValues) {
    // Ensure all required fields are present before saving
    const productToSave: Omit<Product, "id" | "createdAt" | "updatedAt"> = {
      item: data.item,
      description: data.description,
      unit: data.unit,
      quantity: data.quantity,
      familyAgriculture: data.familyAgriculture,
      indication: data.indication || undefined,
      restriction: data.restriction || undefined,
    };
    
    onSave(productToSave);
    form.reset({
      item: nextItemNumber + 1,
      description: "",
      unit: "",
      quantity: "",
      familyAgriculture: false,
      indication: "",
      restriction: "",
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Inserir Novo Produto</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do produto abaixo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="item"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Número do item"
                        {...field}
                        disabled={true} 
                        onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Kg, Pct, Lt" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Input placeholder="Descrição do produto" {...field} />
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
                      <Input placeholder="Quantidade (opcional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="familyAgriculture"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agricultura Familiar</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "yes")}
                      defaultValue={field.value ? "yes" : "no"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">Sim</SelectItem>
                        <SelectItem value="no">Não</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* New fields for indication and restriction */}
            <FormField
              control={form.control}
              name="indication"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Indicação</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Indicação do produto (até 50 caracteres)" 
                      {...field} 
                      className="max-h-24"
                      maxLength={50}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="restriction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Restrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Restrição do produto (até 50 caracteres)" 
                      {...field}
                      className="max-h-24"
                      maxLength={50}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar Produto</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
