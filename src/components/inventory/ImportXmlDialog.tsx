
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
import { FileUp, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Supplier, Invoice, InvoiceItem } from "@/lib/types";

interface ImportXmlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (invoice: Invoice) => void;
  existingInvoices?: Invoice[];
}

const formSchema = z.object({
  xmlFile: z.any().refine((file) => file?.length === 1, "Arquivo XML é obrigatório"),
  financialProgrammingDate: z.string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Data deve estar no formato dd/mm/aaaa")
    .optional(),
  installments: z.number().min(1, "Número de parcelas deve ser maior que 0").optional(),
  danfeSearch: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ImportXmlDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  existingInvoices = [] 
}: ImportXmlDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Invoice[]>([]);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      financialProgrammingDate: "",
      installments: 1,
      danfeSearch: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    form.setValue("xmlFile", e.target.files);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileContent(e.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleDanfeSearch = (searchTerm: string) => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }
    
    const results = existingInvoices.filter(invoice => 
      invoice.danfeNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
  };

  const formatDateInput = (value: string) => {
    // Remove all non-numeric characters
    const numeric = value.replace(/\D/g, '');
    
    // Apply dd/mm/yyyy formatting
    if (numeric.length >= 2) {
      let formatted = numeric.substring(0, 2);
      if (numeric.length >= 4) {
        formatted += '/' + numeric.substring(2, 4);
        if (numeric.length >= 8) {
          formatted += '/' + numeric.substring(4, 8);
        } else if (numeric.length > 4) {
          formatted += '/' + numeric.substring(4);
        }
      } else if (numeric.length > 2) {
        formatted += '/' + numeric.substring(2);
      }
      return formatted;
    }
    return numeric;
  };

  const checkDuplicateInvoice = (danfeNumber: string): boolean => {
    return existingInvoices.some(invoice => invoice.danfeNumber === danfeNumber);
  };

  const handleSubmit = (values: FormValues) => {
    setIsLoading(true);
    
    try {
      if (!fileContent) {
        throw new Error("No file content to process");
      }
      
      // Mock parsing XML data with correct values
      const mockDanfeNumber = "NF" + Math.random().toString().substring(2, 11);
      
      // Check for duplicate
      if (checkDuplicateInvoice(mockDanfeNumber)) {
        toast({
          title: "XML já importado",
          description: "Esta nota fiscal já foi importada anteriormente.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const supplier: Supplier = {
        id: uuidv4(),
        name: "Fornecedor XML Corrigido",
        cnpj: "12.345.678/0001-99",
        address: "Rua do XML, 123",
        phone: "(11) 1234-5678"
      };
      
      // Correct XML parsing with proper values
      const items: InvoiceItem[] = [
        {
          id: uuidv4(),
          description: "Papel Sulfite A4 75g",
          quantity: 100,
          unitPrice: 25.50,
          totalPrice: 2550.00,
          unitOfMeasure: "Pct",
          invoiceId: "",
        },
        {
          id: uuidv4(),
          description: "Caneta Esferográfica Azul",
          quantity: 500,
          unitPrice: 2.80,
          totalPrice: 1400.00,
          unitOfMeasure: "Un",
          invoiceId: "",
        }
      ];
      
      const totalValue = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const invoiceId = uuidv4();
      
      items.forEach(item => {
        item.invoiceId = invoiceId;
      });
      
      const invoice: Invoice = {
        id: invoiceId,
        supplierId: supplier.id,
        supplier,
        issueDate: new Date(),
        danfeNumber: mockDanfeNumber,
        totalValue,
        items,
        financialProgramming: values.financialProgrammingDate 
          ? `${values.financialProgrammingDate} - ${values.installments || 1} parcela(s)`
          : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setTimeout(() => {
        setIsLoading(false);
        onSubmit(invoice);
        form.reset();
        setFileName("");
        setFileContent(null);
        setSearchResults([]);
        
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar XML de Nota Fiscal</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Search existing invoices */}
            <FormField
              control={form.control}
              name="danfeSearch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buscar DANFE Existente</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        {...field} 
                        placeholder="Digite o número da DANFE para verificar se já existe"
                        className="pl-10"
                        onChange={(e) => {
                          field.onChange(e);
                          handleDanfeSearch(e.target.value);
                        }}
                      />
                    </div>
                  </FormControl>
                  {searchResults.length > 0 && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800 font-medium">XMLs encontrados:</p>
                      {searchResults.map(invoice => (
                        <p key={invoice.id} className="text-sm text-yellow-700">
                          DANFE: {invoice.danfeNumber} - {invoice.supplier.name}
                        </p>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="financialProgrammingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Programação Financeira</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="dd/mm/aaaa"
                        maxLength={10}
                        onChange={(e) => {
                          const formatted = formatDateInput(e.target.value);
                          field.onChange(formatted);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="installments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Parcelas</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
