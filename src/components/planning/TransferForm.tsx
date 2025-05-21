
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { School } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transferFormSchema, TransferFormValues } from "./TransferFormSchema";

interface TransferFormProps {
  eligibleSchools: School[];
  quantity: number;
  onSubmit: (data: TransferFormValues) => void;
}

export function TransferForm({ eligibleSchools, quantity, onSubmit }: TransferFormProps) {
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      toSchoolId: "",
      quantity: 1,
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
                  max={quantity} 
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                Saldo disponível: {quantity}
              </p>
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button type="submit">Transferir</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
