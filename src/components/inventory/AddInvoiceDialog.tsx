
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
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
import { Supplier, Invoice, InvoiceItem } from "@/lib/types";
import { Trash } from "lucide-react";

interface AddInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (invoice: Invoice) => void;
}

const formSchema = z.object({
  supplier: z.object({
    name: z.string().min(1, "Nome do fornecedor é obrigatório"),
    cnpj: z.string().min(14, "CNPJ deve ter pelo menos 14 caracteres"),
  }),
  issueDate: z.string().min(1, "Data de emissão é obrigatória"),
  danfeNumber: z.string().min(1, "Número da DANFE é obrigatório"),
  items: z.array(
    z.object({
      description: z.string().min(1, "Descrição é obrigatória"),
      quantity: z.number().positive("Quantidade deve ser positiva"),
      unitOfMeasure: z.string().min(1, "Unidade de medida é obrigatória"),
      unitPrice: z.number().nonnegative("Valor unitário deve ser não-negativo"),
    })
  ).min(1, "Adicione pelo menos um item"),
  financialProgramming: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddInvoiceDialog({ open, onOpenChange, onSubmit }: AddInvoiceDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplier: { name: "", cnpj: "" },
      issueDate: new Date().toISOString().split('T')[0],
      danfeNumber: "",
      items: [{ description: "", quantity: 1, unitOfMeasure: "Un", unitPrice: 0 }],
      financialProgramming: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const handleSubmit = (values: FormValues) => {
    const items: InvoiceItem[] = values.items.map(item => ({
      id: uuidv4(),
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice,
      unitOfMeasure: item.unitOfMeasure,
      invoiceId: "",
    }));

    const totalValue = items.reduce((sum, item) => sum + item.totalPrice, 0);

    const supplier: Supplier = {
      id: uuidv4(),
      name: values.supplier.name,
      cnpj: values.supplier.cnpj,
    };

    const invoice: Invoice = {
      id: uuidv4(),
      supplierId: supplier.id,
      supplier,
      issueDate: new Date(values.issueDate),
      danfeNumber: values.danfeNumber,
      totalValue,
      items,
      financialProgramming: values.financialProgramming,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Update invoiceId in items
    invoice.items.forEach(item => {
      item.invoiceId = invoice.id;
    });

    onSubmit(invoice);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Cadastro de Produtos</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="font-medium">Dados do Fornecedor</h3>
                <FormField
                  control={form.control}
                  name="supplier.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Fornecedor</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplier.cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Dados da Nota</h3>
                <FormField
                  control={form.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Emissão</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="danfeNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número da DANFE</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Itens da Nota</h3>
                <Button
                  type="button"
                  onClick={() => append({ 
                    description: "", 
                    quantity: 1, 
                    unitOfMeasure: "Un", 
                    unitPrice: 0 
                  })}
                  variant="outline"
                  size="sm"
                >
                  Adicionar Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-end pt-2 border-t">
                  <div className="col-span-5">
                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
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
                  </div>

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.unitOfMeasure`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unidade</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Unit.</FormLabel>
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
                  </div>

                  <div className="col-span-1">
                    <Button
                      type="button"
                      onClick={() => remove(index)}
                      variant="ghost"
                      size="sm"
                      disabled={fields.length === 1}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <FormField
              control={form.control}
              name="financialProgramming"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Programação Financeira</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Opcional" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Cadastrar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
