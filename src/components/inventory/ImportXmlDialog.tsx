
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileUp, Search, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Invoice } from "@/lib/types";
import { parseXMLToInvoice, validateNFeXML } from "@/lib/xmlParser";

interface ImportXmlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (invoice: Invoice) => void;
  existingInvoices?: Invoice[];
}

const formSchema = z.object({
  xmlFile: z.any().refine((file) => file?.length === 1, "Arquivo XML é obrigatório"),
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
  const [parsedData, setParsedData] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [importSuccessful, setImportSuccessful] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      danfeSearch: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setValidationError(null);
    setParsedData(null);
    form.setValue("xmlFile", e.target.files);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
      
      // Validar se é um XML de NFe válido
      if (!validateNFeXML(content)) {
        setValidationError("O arquivo selecionado não é um XML de NFe válido.");
        return;
      }

      // Tentar fazer o parse do XML
      try {
        const parsed = parseXMLToInvoice(content);
        setParsedData(parsed);
        
        console.log(`XML processado com sucesso: ${parsed.items.length} itens encontrados`);
        
        // Verificar se já existe uma nota com o mesmo DANFE
        const duplicate = checkDuplicateInvoice(parsed.danfeNumber);
        if (duplicate) {
          setValidationError(`Esta nota fiscal (DANFE: ${parsed.danfeNumber}) já foi importada e está ${duplicate.status === 'aprovada' ? 'aprovada e ativa' : duplicate.status}.`);
        }
      } catch (error) {
        console.error("Erro ao processar XML:", error);
        setValidationError(error instanceof Error ? error.message : "Erro ao processar o arquivo XML");
      }
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

  const checkDuplicateInvoice = (danfeNumber: string): Invoice | null => {
    return existingInvoices.find(invoice => 
      invoice.danfeNumber === danfeNumber && 
      (invoice.status === 'aprovada' && invoice.isActive)
    ) || null;
  };

  const handleSubmit = (values: FormValues) => {
    if (!fileContent || !parsedData) {
      toast({
        title: "Erro na importação",
        description: "Nenhum arquivo válido foi processado.",
        variant: "destructive",
      });
      return;
    }

    if (validationError) {
      toast({
        title: "Erro na importação",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const invoiceId = uuidv4();
      
      // Atualizar IDs dos itens com o ID da nota
      const items = parsedData.items.map((item: any) => ({
        ...item,
        invoiceId
      }));
      
      console.log(`Criando nota fiscal com ${items.length} itens`);
      
      const invoice: Invoice = {
        id: invoiceId,
        supplierId: parsedData.supplier.id,
        supplier: parsedData.supplier,
        issueDate: parsedData.issueDate,
        danfeNumber: parsedData.danfeNumber,
        totalValue: parsedData.totalValue,
        items,
        status: 'pendente',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setTimeout(() => {
        setIsLoading(false);
        onSubmit(invoice);
        setImportSuccessful(true);
        
        // Reset form
        form.reset();
        setFileName("");
        setFileContent(null);
        setSearchResults([]);
        setParsedData(null);
        setValidationError(null);
        
        toast({
          title: "Importação concluída",
          description: `XML importado com sucesso! ${items.length} itens foram processados. A nota está aguardando aprovação.`,
        });
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      console.error("Error processing invoice:", error);
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao processar a nota fiscal.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    // Se houve importação bem-sucedida, mostrar alerta
    if (importSuccessful) {
      setTimeout(() => {
        alert("Não esqueça de Efetuar a programação financeira!");
      }, 300);
      setImportSuccessful(false);
    }
    
    form.reset();
    setFileName("");
    setFileContent(null);
    setSearchResults([]);
    setParsedData(null);
    setValidationError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                          DANFE: {invoice.danfeNumber} - {invoice.supplier.name} - Status: {invoice.status}
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

            {/* Mensagens de validação */}
            {validationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            {/* Dados processados */}
            {parsedData && !validationError && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>XML processado com sucesso!</strong>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><strong>Fornecedor:</strong> {parsedData.supplier.name}</p>
                    <p><strong>CNPJ:</strong> {parsedData.supplier.cnpj}</p>
                    <p><strong>DANFE:</strong> {parsedData.danfeNumber}</p>
                    <p><strong>Data de Emissão:</strong> {new Date(parsedData.issueDate).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Valor Total:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parsedData.totalValue)}</p>
                    <p><strong>Itens:</strong> {parsedData.items.length} produtos</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={!fileName || isLoading || !!validationError || !parsedData}
              >
                {isLoading ? "Importando..." : "Importar XML"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
