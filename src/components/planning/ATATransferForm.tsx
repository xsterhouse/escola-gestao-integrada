
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { School } from "@/lib/types";

const transferFormSchema = z.object({
  toSchoolId: z.string().min(1, "Selecione uma escola de destino"),
  quantity: z.coerce.number().positive("Quantidade deve ser maior que zero"),
  justificativa: z.string().min(10, "Justificativa deve ter pelo menos 10 caracteres"),
});

type TransferFormData = z.infer<typeof transferFormSchema>;

interface ATATransferFormProps {
  eligibleSchools: School[];
  availableQuantity: number;
  onSubmit: (data: TransferFormData) => void;
}

export function ATATransferForm({ eligibleSchools, availableQuantity, onSubmit }: ATATransferFormProps) {
  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      toSchoolId: "",
      quantity: 1,
      justificativa: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="toSchoolId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Escola Destino</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma escola" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {eligibleSchools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade a Transferir</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  max={availableQuantity} 
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                Saldo disponível: {availableQuantity}
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="justificativa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Justificativa para Transferência</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva o motivo da transferência..."
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button type="submit">Confirmar Transferência</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
