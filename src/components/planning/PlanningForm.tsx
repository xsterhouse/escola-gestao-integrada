
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      quantity: 0,
      unit: "",
      description: "",
    },
  });

  const onSubmit = (data: FormData) => {
    addItem({
      name: data.name,
      quantity: data.quantity,
      unit: data.unit,
      description: data.description || "",
    });
    
    // Reset form
    form.reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Item ao Planejamento</CardTitle>
        <CardDescription>
          Preencha os dados do item a ser adicionado
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
