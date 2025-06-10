
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ATAItemsList } from "./ATAItemsList";
import { PlanningItem } from "@/lib/types";

// Simplified form schema just for the items in the planning form
const planningFormSchema = z.object({
  items: z.array(
    z.object({
      nome: z.string().min(1, "Nome é obrigatório"),
      unidade: z.string().min(1, "Unidade é obrigatória"),
      quantidade: z.coerce.number().min(1, "Quantidade deve ser maior que 0"),
      descricao: z.string().optional(),
    })
  ).min(1, "Adicione pelo menos um item"),
});

type PlanningFormData = z.infer<typeof planningFormSchema>;

interface ProductSuggestion {
  id: string;
  description: string;
  unit: string;
  item?: number;
}

interface PlanningFormProps {
  addItem: (item: Omit<PlanningItem, "id" | "planningId" | "createdAt" | "updatedAt" | "availableQuantity">) => void;
  disabled?: boolean;
}

export function PlanningForm({ addItem, disabled = false }: PlanningFormProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const form = useForm<PlanningFormData>({
    resolver: zodResolver(planningFormSchema),
    defaultValues: {
      items: [{ nome: "", unidade: "", quantidade: 0, descricao: "" }],
    },
  });

  const onSubmit = (data: PlanningFormData) => {
    console.log("📝 Dados do formulário ATA:", data);
    
    // Adicionar cada item do formulário
    data.items.forEach(item => {
      addItem({
        name: item.nome,
        unit: item.unidade,
        quantity: item.quantidade,
        description: item.descricao || "",
      });
    });

    // Resetar formulário e fechar modal
    form.reset({
      items: [{ nome: "", unidade: "", quantidade: 0, descricao: "" }],
    });
    setIsModalOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova ATA</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={() => setIsModalOpen(true)}
          disabled={disabled}
          className="w-full"
        >
          Incluir nova ATA
        </Button>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Nova ATA - Adicionar Itens</h3>
                <Button 
                  variant="ghost" 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <ATAItemsList 
                    control={form.control} 
                    setValue={form.setValue}
                  />
                  
                  <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">
                      Adicionar ao Planejamento
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
