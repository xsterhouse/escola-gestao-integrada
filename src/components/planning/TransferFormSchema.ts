
import { z } from "zod";

export const transferFormSchema = z.object({
  toSchoolId: z.string().min(1, "Selecione uma escola de destino"),
  quantity: z.coerce.number().positive("Quantidade deve ser maior que zero"),
});

export type TransferFormValues = z.infer<typeof transferFormSchema>;
