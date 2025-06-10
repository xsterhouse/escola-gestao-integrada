
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ATAContract } from "@/lib/types";
import { ATAFormFields } from "./ATAFormFields";
import { ATAFormData } from "./types";

// Create separate components for ATA items to avoid type conflicts
import { ATAFullItemsList } from "./ATAFullItemsList";

const ataFormSchema = z.object({
  escola: z.string().min(1, "Escola é obrigatória"),
  centralCompras: z.string().min(1, "Central de compras é obrigatória"),
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

interface ATAFormProps {
  onSubmit: (data: Omit<ATAContract, "id" | "schoolId" | "createdBy" | "createdAt" | "updatedAt">) => void;
  schools?: any[];
  purchasingCenters?: any[];
}

export function ATAForm({ onSubmit, schools = [], purchasingCenters = [] }: ATAFormProps) {
  console.log("🏗️ ATAForm renderizado");
  
  const form = useForm<ATAFormData>({
    resolver: zodResolver(ataFormSchema),
    defaultValues: {
      escola: "",
      centralCompras: "",
      dataATA: "",
      dataInicioVigencia: "",
      dataFimVigencia: "",
      observacoes: "",
      items: [{ nome: "", unidade: "", quantidade: 0, descricao: "" }],
    },
  });

  const handleSubmit = (data: ATAFormData) => {
    const processedData = {
      numeroProcesso: "", // Campo removido, mantendo vazio para compatibilidade
      fornecedor: "", // Campo removido, mantendo vazio para compatibilidade
      escola: data.escola,
      centralCompras: data.centralCompras,
      dataATA: new Date(data.dataATA),
      dataInicioVigencia: new Date(data.dataInicioVigencia),
      dataFimVigencia: new Date(data.dataFimVigencia),
      observacoes: data.observacoes || "",
      items: data.items.map(item => ({
        id: crypto.randomUUID(),
        nome: item.nome,
        unidade: item.unidade,
        quantidade: item.quantidade,
        valorUnitario: 0,
        valorTotal: 0,
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
        <ATAFormFields 
          control={form.control} 
          schools={schools}
          purchasingCenters={purchasingCenters}
        />
        
        <ATAFullItemsList 
          control={form.control} 
          setValue={form.setValue}
        />

        <Button type="submit" className="w-full">
          Registrar ATA
        </Button>
      </form>
    </Form>
  );
}
