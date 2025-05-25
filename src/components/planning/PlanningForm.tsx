
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAutoSave, useDraftRecovery } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface PlanningFormProps {
  addItem: (item: { name: string; quantity: number; unit: string; description: string }) => void;
  disabled?: boolean;
}

const formSchema = z.object({
  name: z.string().min(3, { message: "Nome do item deve ter pelo menos 3 caracteres" }),
  quantity: z.coerce.number().positive({ message: "Quantidade deve ser maior que zero" }),
  unit: z.string().min(1, { message: "Unidade é obrigatória" }),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function PlanningForm({ addItem, disabled = false }: PlanningFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    quantity: 0,
    unit: "",
    description: "",
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: formData,
  });

  // Auto-save para o formulário
  useAutoSave('planning_form', formData, { interval: 3000 });

  // Recuperação de draft
  const { draft, clearDraft, hasDraft } = useDraftRecovery<FormData>('planning_form');

  // Monitorar mudanças no formulário para auto-save
  useEffect(() => {
    const subscription = form.watch((value) => {
      setFormData(value as FormData);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Carregar draft se disponível
  useEffect(() => {
    if (hasDraft && draft?.data) {
      const draftData = draft.data;
      form.reset(draftData);
      setFormData(draftData);
      
      toast({
        title: "Rascunho recuperado",
        description: "Dados de um formulário anterior foram recuperados.",
      });
      
      console.log("📄 Draft do formulário recuperado");
    }
  }, [hasDraft, draft, form, toast]);

  const onSubmit = (data: FormData) => {
    addItem({
      name: data.name,
      quantity: data.quantity,
      unit: data.unit,
      description: data.description || "",
    });
    
    // Reset form e limpar draft
    form.reset();
    setFormData({
      name: "",
      quantity: 0,
      unit: "",
      description: "",
    });
    clearDraft();
    
    console.log("📝 Item adicionado e draft limpo");
  };

  const handleClearDraft = () => {
    clearDraft();
    form.reset();
    setFormData({
      name: "",
      quantity: 0,
      unit: "",
      description: "",
    });
    
    toast({
      title: "Rascunho limpo",
      description: "O rascunho do formulário foi removido.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Adicionar Item ao Planejamento
          {hasDraft && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearDraft}
              className="text-xs text-muted-foreground"
            >
              Limpar rascunho
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Preencha os dados do item a ser adicionado
          {hasDraft && (
            <span className="block text-xs text-amber-600 mt-1">
              💾 Rascunho salvo automaticamente
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Item</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Arroz Branco" {...field} disabled={disabled} />
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
                        placeholder="0" 
                        {...field}
                        disabled={disabled} 
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
                    <FormLabel>Unidade</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Kg, Pacote, Und" 
                        {...field}
                        disabled={disabled} 
                      />
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
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva as especificações do item..." 
                      className="resize-none" 
                      {...field}
                      disabled={disabled} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={disabled}
            >
              Adicionar Item
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
