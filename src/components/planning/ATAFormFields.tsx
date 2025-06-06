
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { ATAFormData } from "./types";

interface ATAFormFieldsProps {
  control: Control<ATAFormData>;
}

export function ATAFormFields({ control }: ATAFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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

      <FormField
        control={control}
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
    </>
  );
}
