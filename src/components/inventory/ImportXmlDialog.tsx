
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { FileUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Supplier, Invoice, InvoiceItem } from "@/lib/types";

interface ImportXmlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (invoice: Invoice) => void;
}

const formSchema = z.object({
  xmlFile: z.any().refine((file) => file?.length === 1, "Arquivo XML é obrigatório"),
  financialProgramming: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ImportXmlDialog({ open, onOpenChange, onSubmit }: ImportXmlDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      financialProgramming: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    
    // Set the file in the form data
    form.setValue("xmlFile", e.target.files);
    
    // Read the XML file content
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileContent(e.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleSubmit = (values: FormValues) => {
    setIsLoading(true);
    
    try {
      // This would be where you'd parse the XML
      // For now, we'll simulate creating an invoice from "parsed" XML data
      
      if (!fileContent) {
        throw new Error("No file content to process");
      }
      
      // Mock parsing XML data - in a real implementation, you would
      // parse the XML content and extract the relevant data
      const supplier: Supplier = {
        id: uuidv4(),
        name: "Fornecedor do XML",
        cnpj: "12.345.678/0001-99",
        address: "Rua do XML, 123",
        phone: "(11) 1234-5678"
      };
      
      const items: InvoiceItem[] = [
        {
          id: uuidv4(),
          description: "Item 1 do XML",
          quantity: 2,
          unitPrice: 100,
          totalPrice: 200,
          unitOfMeasure: "Un",
          invoiceId: "",
        },
        {
          id: uuidv4(),
          description: "Item 2 do XML",
          quantity: 3,
          unitPrice: 50,
          totalPrice: 150,
          unitOfMeasure: "Kg",
          invoiceId: "",
        }
      ];
      
      const totalValue = items.reduce((sum, item) => sum + item.totalPrice, 0);
      
      const invoiceId = uuidv4();
      
      // Update invoiceId in items
      items.forEach(item => {
        item.invoiceId = invoiceId;
      });
      
      const invoice: Invoice = {
        id: invoiceId,
        supplierId: supplier.id,
        supplier,
        issueDate: new Date(),
        danfeNumber: "XML12345678",
        totalValue,
        items,
        financialProgramming: values.financialProgramming,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // In a real implementation, this would be where you'd validate the XML structure
      
      // Simulate processing delay
      setTimeout(() => {
        setIsLoading(false);
        onSubmit(invoice);
        form.reset();
        setFileName("");
        setFileContent(null);
        
        toast({
          title: "Importação concluída",
          description: "O arquivo XML foi importado com sucesso.",
        });
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      console.error("Error parsing XML:", error);
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao processar o arquivo XML.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar XML de Nota Fiscal</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="xmlFile"
              render={() => (
                <FormItem>
                  <FormLabel>Arquivo XML</FormLabel>
                  <FormControl>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6">
                      <FileUp className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mb-2">
                        Arraste o arquivo XML ou clique para selecionar
                      </p>
                      <Input
                        type="file"
                        accept=".xml"
                        onChange={handleFileChange}
                        className="hidden"
                        id="xml-file-input"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => 
                          document.getElementById("xml-file-input")?.click()
                        }
                      >
                        Selecionar Arquivo
                      </Button>
                      {fileName && (
                        <p className="text-sm mt-2">
                          Arquivo selecionado: <span className="font-semibold">{fileName}</span>
                        </p>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="financialProgramming"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Programação Financeira</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Informe a programação financeira" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={!fileName || isLoading}>
                {isLoading ? "Importando..." : "Importar XML"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
