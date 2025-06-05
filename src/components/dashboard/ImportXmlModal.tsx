
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
import { FileUp, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { parseXMLToInvoice, validateNFeXML } from "@/lib/xmlParser";
import { Invoice, PaymentAccount, Product } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

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
  const [importProgress, setImportProgress] = useState<{[key: string]: 'pending' | 'processing' | 'success' | 'error'}>({});
  const { toast } = useToast();

  const modules = [
    { id: "inventory", label: "Estoque" },
    { id: "payable", label: "Contas a Pagar" },
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

  const processInventoryImport = async (invoice: Invoice) => {
    try {
      setImportProgress(prev => ({ ...prev, inventory: 'processing' }));
      
      // Get existing products
      const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
      const existingInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      
      // Save invoice
      const newInvoices = [...existingInvoices, invoice];
      localStorage.setItem('invoices', JSON.stringify(newInvoices));
      
      // Create or update products from invoice items
      const updatedProducts = [...existingProducts];
      
      invoice.items.forEach(item => {
        const existingProductIndex = updatedProducts.findIndex(
          p => p.name.toLowerCase() === item.description.toLowerCase()
        );
        
        if (existingProductIndex >= 0) {
          // Update existing product quantity
          updatedProducts[existingProductIndex].quantity += item.quantity;
          updatedProducts[existingProductIndex].updatedAt = new Date();
        } else {
          // Create new product
          const newProduct: Product = {
            id: uuidv4(),
            schoolId: "current-school",
            name: item.description,
            description: item.description,
            category: "Importado de XML",
            quantity: item.quantity,
            unitOfMeasure: item.unitOfMeasure,
            unitPrice: item.unitPrice,
            minimumStock: 10,
            maximumStock: 1000,
            location: "Estoque Principal",
            barcode: "",
            status: "ativo",
            supplier: invoice.supplier.name,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          updatedProducts.push(newProduct);
        }
      });
      
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      
      setImportProgress(prev => ({ ...prev, inventory: 'success' }));
      return true;
    } catch (error) {
      console.error('Erro ao importar para estoque:', error);
      setImportProgress(prev => ({ ...prev, inventory: 'error' }));
      return false;
    }
  };

  const processPayableImport = async (invoice: Invoice, financialProgramming?: string) => {
    try {
      setImportProgress(prev => ({ ...prev, payable: 'processing' }));
      
      const existingPayments = JSON.parse(localStorage.getItem('paymentAccounts') || '[]');
      
      // Create payment account from imported invoice
      const newPayment: PaymentAccount = {
        id: `payment-xml-${Date.now()}`,
        schoolId: "current-school",
        description: `NF ${invoice.danfeNumber} - ${invoice.supplier.name}`,
        supplier: invoice.supplier.name,
        dueDate: new Date(invoice.issueDate.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from issue
        value: invoice.totalValue,
        expenseType: "Outros",
        resourceCategory: financialProgramming || "Recursos Próprios",
        status: 'a_pagar',
        invoiceId: invoice.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const updatedPayments = [...existingPayments, newPayment];
      localStorage.setItem('paymentAccounts', JSON.stringify(updatedPayments));
      
      setImportProgress(prev => ({ ...prev, payable: 'success' }));
      return true;
    } catch (error) {
      console.error('Erro ao importar para contas a pagar:', error);
      setImportProgress(prev => ({ ...prev, payable: 'error' }));
      return false;
    }
  };

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setImportProgress({});
    
    try {
      const file = values.xmlFile[0];
      const xmlContent = await file.text();
      
      // Validate XML
      if (!validateNFeXML(xmlContent)) {
        throw new Error("XML não é uma NF-e válida");
      }
      
      // Parse XML
      const parsedData = parseXMLToInvoice(xmlContent);
      
      // Create invoice object
      const invoice: Invoice = {
        id: uuidv4(),
        schoolId: "current-school",
        supplier: parsedData.supplier,
        danfeNumber: parsedData.danfeNumber,
        issueDate: parsedData.issueDate,
        totalValue: parsedData.totalValue,
        items: parsedData.items.map(item => ({
          ...item,
          invoiceId: uuidv4()
        })),
        status: "aprovada",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setImportedData({
        supplier: parsedData.supplier,
        issueDate: parsedData.issueDate.toLocaleDateString('pt-BR'),
        danfeNumber: parsedData.danfeNumber,
        totalValue: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(parsedData.totalValue),
        items: parsedData.items
      });
      
      // Check if both modules selected for financial programming
      if (values.modules.length === 2) {
        setShowFinancialField(true);
        setIsLoading(false);
        return;
      }
      
      // Process single module import
      let success = true;
      
      if (values.modules.includes("inventory")) {
        const inventorySuccess = await processInventoryImport(invoice);
        success = success && inventorySuccess;
      }
      
      if (values.modules.includes("payable")) {
        const payableSuccess = await processPayableImport(invoice);
        success = success && payableSuccess;
      }
      
      setIsLoading(false);
      
      if (success) {
        const moduleNames = values.modules.map(m => 
          modules.find(mod => mod.id === m)?.label
        ).join(", ");
        
        toast({
          title: "Importação concluída",
          description: `XML importado com sucesso para: ${moduleNames}`,
        });
        handleClose();
      } else {
        toast({
          title: "Erro na importação",
          description: "Alguns módulos falharam na importação. Verifique os logs.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      setIsLoading(false);
      console.error('Erro na importação:', error);
      toast({
        title: "Erro na importação",
        description: error instanceof Error ? error.message : "Erro ao processar arquivo XML",
        variant: "destructive",
      });
    }
  };

  const handleFinancialSubmit = async () => {
    setIsLoading(true);
    const financialProgramming = form.getValues("financialProgramming");
    const values = form.getValues();
    
    try {
      const file = values.xmlFile[0];
      const xmlContent = await file.text();
      const parsedData = parseXMLToInvoice(xmlContent);
      
      const invoice: Invoice = {
        id: uuidv4(),
        schoolId: "current-school",
        supplier: parsedData.supplier,
        danfeNumber: parsedData.danfeNumber,
        issueDate: parsedData.issueDate,
        totalValue: parsedData.totalValue,
        items: parsedData.items.map(item => ({
          ...item,
          invoiceId: uuidv4()
        })),
        status: "aprovada",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Process both modules
      const inventorySuccess = await processInventoryImport(invoice);
      const payableSuccess = await processPayableImport(invoice, financialProgramming);
      
      setIsLoading(false);
      
      if (inventorySuccess && payableSuccess) {
        toast({
          title: "Importação finalizada",
          description: "XML importado com sucesso em todos os módulos com programação financeira incluída.",
        });
        handleClose();
      } else {
        toast({
          title: "Erro na importação",
          description: "Alguns módulos falharam na importação.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Erro na importação final:', error);
      toast({
        title: "Erro na importação",
        description: "Erro ao finalizar importação",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    form.reset();
    setFileName("");
    setShowFinancialField(false);
    setImportedData(null);
    setImportProgress({});
    onOpenChange(false);
  };

  const getProgressIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
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
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
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
                              <FormLabel className="font-normal flex items-center gap-2">
                                {module.label}
                                {importProgress[module.id] && getProgressIcon(importProgress[module.id])}
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
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Importar XML"
                  )}
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
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button onClick={handleFinancialSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finalizando...
                  </>
                ) : (
                  "Finalizar Importação"
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
