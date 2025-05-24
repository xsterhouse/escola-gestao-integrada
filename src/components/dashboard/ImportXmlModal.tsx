
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Checkbox } from "@/components/ui/checkbox";
import { FileUp, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImportXmlModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  xmlFile: z.any().refine((file) => file?.length === 1, "Arquivo XML é obrigatório"),
  modules: z.array(z.string()).min(1, "Selecione pelo menos um módulo"),
  financialProgramming: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ImportXmlModal({ open, onOpenChange }: ImportXmlModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [showFinancialField, setShowFinancialField] = useState(false);
  const [importedData, setImportedData] = useState<any>(null);
  const { toast } = useToast();

  const modules = [
    { id: "contracts", label: "Módulo Contratos" },
    { id: "inventory", label: "Estoque" },
    { id: "payable", label: "Conta a Pagar" },
  ];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      modules: [],
      financialProgramming: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.xml')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo XML válido.",
        variant: "destructive",
      });
      return;
    }
    
    setFileName(file.name);
    form.setValue("xmlFile", e.target.files);
  };

  const handleSubmit = (values: FormValues) => {
    setIsLoading(true);
    
    try {
      // Simular processamento do XML - em uma implementação real, 
      // aqui seria feito o parsing do arquivo XML
      setTimeout(() => {
        const mockData = {
          supplier: {
            name: "Fornecedor Exemplo Ltda",
            cnpj: "12.345.678/0001-99",
            address: "Rua das Empresas, 123 - São Paulo/SP",
            phone: "(11) 1234-5678",
            email: "contato@fornecedor.com.br"
          },
          issueDate: new Date().toLocaleDateString('pt-BR'),
          danfeNumber: "123456789",
          totalValue: "R$ 15.750,00",
          items: [
            {
              description: "Arroz Tipo 1 - 5kg",
              quantity: 100,
              unitPrice: "R$ 25,50",
              totalPrice: "R$ 2.550,00"
            },
            {
              description: "Feijão Carioca - 1kg", 
              quantity: 200,
              unitPrice: "R$ 8,90",
              totalPrice: "R$ 1.780,00"
            },
            {
              description: "Óleo de Soja - 900ml",
              quantity: 150,
              unitPrice: "R$ 7,80",
              totalPrice: "R$ 1.170,00"
            }
          ]
        };
        
        setImportedData(mockData);
        setIsLoading(false);
        
        // Se todos os 3 módulos foram selecionados, mostrar campo de programação financeira
        if (values.modules.length === 3) {
          setShowFinancialField(true);
        } else {
          // Finalizar importação se não foram todos os módulos
          toast({
            title: "Importação concluída",
            description: `XML importado com sucesso para: ${values.modules.join(", ")}`,
          });
          handleClose();
        }
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao processar o arquivo XML.",
        variant: "destructive",
      });
    }
  };

  const handleFinancialSubmit = () => {
    const financialProgramming = form.getValues("financialProgramming");
    
    toast({
      title: "Importação finalizada",
      description: "XML importado com sucesso em todos os módulos com programação financeira incluída.",
    });
    
    handleClose();
  };

  const handleClose = () => {
    form.reset();
    setFileName("");
    setShowFinancialField(false);
    setImportedData(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Nota XML</DialogTitle>
        </DialogHeader>

        {!showFinancialField ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="modules"
                render={() => (
                  <FormItem>
                    <FormLabel>Selecione os módulos para importar os dados:</FormLabel>
                    <div className="space-y-3">
                      {modules.map((module) => (
                        <FormField
                          key={module.id}
                          control={form.control}
                          name="modules"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(module.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, module.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== module.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {module.label}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
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

              {importedData && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Dados que serão importados:</strong>
                    <div className="mt-2 space-y-1 text-sm">
                      <p><strong>Fornecedor:</strong> {importedData.supplier.name}</p>
                      <p><strong>CNPJ:</strong> {importedData.supplier.cnpj}</p>
                      <p><strong>Data Emissão:</strong> {importedData.issueDate}</p>
                      <p><strong>Número DANFE:</strong> {importedData.danfeNumber}</p>
                      <p><strong>Valor Total:</strong> {importedData.totalValue}</p>
                      <p><strong>Itens:</strong> {importedData.items.length} produtos</p>
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
                <Button type="submit" disabled={!fileName || isLoading}>
                  {isLoading ? "Processando..." : "Importar XML"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                XML processado com sucesso! Como todos os módulos foram selecionados, 
                inclua a programação financeira para finalizar a importação.
              </AlertDescription>
            </Alert>

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
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button onClick={handleFinancialSubmit}>
                Finalizar Importação
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
