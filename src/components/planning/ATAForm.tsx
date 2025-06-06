
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { ATAContract } from "@/lib/types";
import { ATAProductAutocomplete } from "./ATAProductAutocomplete";

const ataFormSchema = z.object({
  numeroProcesso: z.string().min(1, "Número do processo é obrigatório"),
  fornecedor: z.string().min(1, "Fornecedor é obrigatório"),
  dataATA: z.string().min(1, "Data da ATA é obrigatória"),
  dataInicioVigencia: z.string().min(1, "Data de início da vigência é obrigatória"),
  dataFimVigencia: z.string().min(1, "Data de fim da vigência é obrigatória"),
  observacoes: z.string().optional(),
  items: z.array(z.object({
    nome: z.string().min(1, "Nome do produto é obrigatório"),
    unidade: z.string().min(1, "Unidade é obrigatória"),
    quantidade: z.coerce.number().positive("Quantidade deve ser maior que zero"),
    descricao: z.string().optional(),
  })).min(1, "Pelo menos um item deve ser adicionado"),
});

type ATAFormData = z.infer<typeof ataFormSchema>;

interface ATAFormProps {
  onSubmit: (data: Omit<ATAContract, "id" | "schoolId" | "createdBy" | "createdAt" | "updatedAt">) => void;
}

export function ATAForm({ onSubmit }: ATAFormProps) {
  const form = useForm<ATAFormData>({
    resolver: zodResolver(ataFormSchema),
    defaultValues: {
      numeroProcesso: "",
      fornecedor: "",
      dataATA: "",
      dataInicioVigencia: "",
      dataFimVigencia: "",
      observacoes: "",
      items: [{ nome: "", unidade: "", quantidade: 0, descricao: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const handleProductSelect = (index: number, product: any) => {
    // Preencher automaticamente os campos com dados do produto selecionado
    form.setValue(`items.${index}.nome`, product.description);
    form.setValue(`items.${index}.unidade`, product.unit);
    
    // Se o produto tem um número de item, podemos sugerir
    if (product.item) {
      console.log(`Produto selecionado tem item ${product.item}`);
    }
  };

  const handleSubmit = (data: ATAFormData) => {
    const processedData = {
      numeroProcesso: data.numeroProcesso,
      fornecedor: data.fornecedor,
      dataATA: new Date(data.dataATA),
      dataInicioVigencia: new Date(data.dataInicioVigencia),
      dataFimVigencia: new Date(data.dataFimVigencia),
      observacoes: data.observacoes || "",
      items: data.items.map(item => ({
        id: crypto.randomUUID(),
        nome: item.nome,
        unidade: item.unidade,
        quantidade: item.quantidade,
        valorUnitario: 0, // Valor padrão, pode ser definido posteriormente
        valorTotal: 0, // Será calculado quando valor unitário for definido
        descricao: item.descricao || "",
        saldoDisponivel: item.quantidade,
      })),
      status: "ativo" as const,
    };

    onSubmit(processedData);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="numeroProcesso"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do Processo *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 2025.0037" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fornecedor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fornecedor *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: NutriAlimentos LTDA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="dataATA"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data da ATA *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataInicioVigencia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Início da Vigência *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataFimVigencia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fim da Vigência *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
              <div key={field.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`items.${index}.nome`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição do Produto *</FormLabel>
                        <FormControl>
                          <ATAProductAutocomplete
                            value={field.value}
                            onChange={field.onChange}
                            onProductSelect={(product) => handleProductSelect(index, product)}
                            placeholder="Digite para buscar produtos..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
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
                  control={form.control}
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
                  control={form.control}
                  name={`items.${index}.descricao`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Observações adicionais sobre o produto..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Observações adicionais sobre a ATA..."
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Registrar ATA
        </Button>
      </form>
    </Form>
  );
}
