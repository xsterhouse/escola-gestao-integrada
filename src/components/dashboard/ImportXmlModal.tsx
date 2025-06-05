import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, CheckCircle, AlertCircle, Download, Package, DollarSign, FileX } from "lucide-react";
import { Supplier, Invoice, InvoiceItem } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

const importFormSchema = z.object({
  files: z.any().optional(),
  description: z.string().optional(),
  targetModule: z.enum(["inventory", "financial", "contracts"], {
    required_error: "Selecione um módulo para importação",
  }),
});

interface XmlData {
  danfeNumber: string;
  supplier: Supplier;
  issueDate: Date;
  totalValue: number;
  items: InvoiceItem[];
}

interface ImportResult {
  success: boolean;
  fileName: string;
  danfeNumber?: string;
  error?: string;
  data?: XmlData;
  module?: string;
}

interface ImportXmlModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const moduleOptions = [
  {
    value: "inventory",
    label: "Estoque/Inventário",
    description: "Importar para controle de estoque",
    icon: Package,
    route: "/inventory"
  },
  {
    value: "financial",
    label: "Financeiro",
    description: "Importar para contas a pagar",
    icon: DollarSign,
    route: "/financial"
  },
  {
    value: "contracts",
    label: "Contratos",
    description: "Importar para gestão de contratos",
    icon: FileX,
    route: "/contracts"
  }
];

export function ImportXmlModal({ open, onOpenChange }: ImportXmlModalProps) {
  const { toast } = useToast();
  const { currentSchool } = useAuth();
  const navigate = useNavigate();
  const [internalOpen, setInternalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [processingStep, setProcessingStep] = useState("");

  // Use external state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const form = useForm<z.infer<typeof importFormSchema>>({
    resolver: zodResolver(importFormSchema),
    defaultValues: {
      files: null,
      description: "",
      targetModule: undefined,
    },
  });

  const parseXMLContent = (xmlContent: string, fileName: string): Promise<XmlData> => {
    return new Promise((resolve, reject) => {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, "application/xml");
        
        // Check for parsing errors
        const parseError = xmlDoc.querySelector("parsererror");
        if (parseError) {
          throw new Error("Formato XML inválido");
        }

        // Mock data for demonstration - in a real app you'd parse the actual XML structure
        const mockSupplier: Supplier = {
          id: uuidv4(),
          cnpj: "12.345.678/0001-99",
          razaoSocial: "Fornecedor Simulado LTDA",
          name: "Fornecedor Simulado",
          endereco: "Rua das Empresas, 123",
          telefone: "(11) 1234-5678",
          email: "contato@fornecedor.com",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const mockItems: InvoiceItem[] = [
          {
            id: uuidv4(),
            invoiceId: "", // Will be set later
            description: "Produto de Teste 1",
            quantity: 10,
            unitPrice: 15.50,
            totalPrice: 155.00,
            unitOfMeasure: "UN",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: uuidv4(),
            invoiceId: "", // Will be set later
            description: "Produto de Teste 2", 
            quantity: 5,
            unitPrice: 25.00,
            totalPrice: 125.00,
            unitOfMeasure: "KG",
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ];

        const xmlData: XmlData = {
          danfeNumber: `NFE-${Date.now().toString().slice(-8)}`,
          supplier: mockSupplier,
          issueDate: new Date(),
          totalValue: mockItems.reduce((sum, item) => sum + item.totalPrice, 0),
          items: mockItems,
        };

        resolve(xmlData);
      } catch (error) {
        reject(new Error(`Erro ao processar ${fileName}: ${error.message}`));
      }
    });
  };

  const saveToInventoryModule = (xmlData: XmlData): string => {
    const invoiceId = uuidv4();
    
    // Update item IDs with invoice reference
    const updatedItems = xmlData.items.map(item => ({
      ...item,
      invoiceId: invoiceId
    }));

    const invoice: Invoice = {
      id: invoiceId,
      supplier: xmlData.supplier,
      supplierId: xmlData.supplier.id,
      danfeNumber: xmlData.danfeNumber,
      issueDate: xmlData.issueDate,
      totalValue: xmlData.totalValue,
      items: updatedItems,
      status: "aprovada",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to inventory storage
    const storageKey = `invoices_${currentSchool.id}`;
    const existingInvoices = JSON.parse(localStorage.getItem(storageKey) || "[]");
    existingInvoices.push(invoice);
    localStorage.setItem(storageKey, JSON.stringify(existingInvoices));

    // Also save supplier if it doesn't exist
    const suppliersKey = `suppliers_${currentSchool.id}`;
    const existingSuppliers = JSON.parse(localStorage.getItem(suppliersKey) || "[]");
    const supplierExists = existingSuppliers.some(s => s.cnpj === xmlData.supplier.cnpj);
    
    if (!supplierExists) {
      existingSuppliers.push(xmlData.supplier);
      localStorage.setItem(suppliersKey, JSON.stringify(existingSuppliers));
    }

    return invoiceId;
  };

  const saveToFinancialModule = (xmlData: XmlData): string => {
    const payableId = uuidv4();
    
    const payableAccount = {
      id: payableId,
      supplier: xmlData.supplier.name,
      description: `Nota Fiscal ${xmlData.danfeNumber}`,
      totalValue: xmlData.totalValue,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: "pendente",
      danfeNumber: xmlData.danfeNumber,
      createdAt: new Date(),
    };

    // Save to financial storage
    const storageKey = `payableAccounts_${currentSchool.id}`;
    const existingPayables = JSON.parse(localStorage.getItem(storageKey) || "[]");
    existingPayables.push(payableAccount);
    localStorage.setItem(storageKey, JSON.stringify(existingPayables));

    return payableId;
  };

  const saveToContractsModule = (xmlData: XmlData): string => {
    const contractId = uuidv4();
    
    const contract = {
      id: contractId,
      supplier: xmlData.supplier.name,
      description: `Contrato baseado em NF ${xmlData.danfeNumber}`,
      totalValue: xmlData.totalValue,
      startDate: xmlData.issueDate,
      endDate: new Date(xmlData.issueDate.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year
      status: "ativo",
      danfeNumber: xmlData.danfeNumber,
      createdAt: new Date(),
    };

    // Save to contracts storage
    const storageKey = `contracts_${currentSchool.id}`;
    const existingContracts = JSON.parse(localStorage.getItem(storageKey) || "[]");
    existingContracts.push(contract);
    localStorage.setItem(storageKey, JSON.stringify(existingContracts));

    return contractId;
  };

  const saveInvoiceToStorage = (xmlData: XmlData, targetModule: string): string => {
    if (!currentSchool) throw new Error("Escola não identificada");

    switch (targetModule) {
      case "inventory":
        return saveToInventoryModule(xmlData);
      case "financial":
        return saveToFinancialModule(xmlData);
      case "contracts":
        return saveToContractsModule(xmlData);
      default:
        throw new Error("Módulo de destino inválido");
    }
  };

  const processFiles = async (files: FileList, targetModule: string) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setImportProgress(0);
    setImportResults([]);

    const results: ImportResult[] = [];
    const totalFiles = files.length;

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      setProcessingStep(`Processando ${file.name}...`);
      
      try {
        // Simulate file reading delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const content = await file.text();
        const xmlData = await parseXMLContent(content, file.name);
        
        setProcessingStep(`Salvando dados de ${file.name} no módulo ${moduleOptions.find(m => m.value === targetModule)?.label}...`);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const recordId = saveInvoiceToStorage(xmlData, targetModule);
        
        results.push({
          success: true,
          fileName: file.name,
          danfeNumber: xmlData.danfeNumber,
          data: xmlData,
          module: targetModule
        });

        console.log(`✅ Nota fiscal ${xmlData.danfeNumber} importada com sucesso para ${targetModule} - ID: ${recordId}`);
        
      } catch (error) {
        console.error(`❌ Erro ao processar ${file.name}:`, error);
        results.push({
          success: false,
          fileName: file.name,
          error: error.message,
          module: targetModule
        });
      }

      setImportProgress(((i + 1) / totalFiles) * 100);
    }

    setImportResults(results);
    setIsProcessing(false);
    setProcessingStep("");

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;
    const selectedModule = moduleOptions.find(m => m.value === targetModule);

    if (successCount > 0) {
      toast({
        title: "Importação concluída",
        description: `${successCount} nota(s) fiscal(is) importada(s) para ${selectedModule?.label} com sucesso. ${errorCount > 0 ? `${errorCount} arquivo(s) com erro.` : ''}`,
      });
    } else {
      toast({
        title: "Erro na importação",
        description: "Nenhum arquivo foi processado com sucesso.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: z.infer<typeof importFormSchema>) => {
    if (!data.files || data.files.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um arquivo XML.",
        variant: "destructive",
      });
      return;
    }

    if (!data.targetModule) {
      toast({
        title: "Erro",
        description: "Selecione um módulo de destino.",
        variant: "destructive",
      });
      return;
    }

    await processFiles(data.files, data.targetModule);
  };

  const handleClose = () => {
    if (!isProcessing) {
      setIsOpen(false);
      form.reset();
      setImportResults([]);
      setImportProgress(0);
    }
  };

  const handleNavigateToModule = (moduleName: string) => {
    const module = moduleOptions.find(m => m.value === moduleName);
    if (module) {
      navigate(module.route);
      handleClose();
    }
  };

  const exportResults = () => {
    const successfulImports = importResults.filter(r => r.success);
    if (successfulImports.length === 0) return;

    const reportData = successfulImports.map(result => ({
      arquivo: result.fileName,
      danfe: result.danfeNumber,
      fornecedor: result.data?.supplier.name,
      valor: result.data?.totalValue,
      modulo: moduleOptions.find(m => m.value === result.module)?.label,
      dataImportacao: new Date().toLocaleDateString('pt-BR')
    }));

    const csvContent = [
      ['Arquivo', 'DANFE', 'Fornecedor', 'Valor', 'Módulo', 'Data Importação'],
      ...reportData.map(row => [
        row.arquivo,
        row.danfe,
        row.fornecedor,
        `R$ ${row.valor?.toFixed(2)}`,
        row.modulo,
        row.dataImportacao
      ])
    ].map(row => row.join(';')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_importacao_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // If external control is provided, render only the DialogContent
  if (open !== undefined) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Importar Notas Fiscais XML
            </DialogTitle>
            <DialogDescription>
              Selecione um módulo de destino e os arquivos XML de notas fiscais para importação.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="targetModule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Módulo de Destino *</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isProcessing}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione onde importar os dados" />
                        </SelectTrigger>
                        <SelectContent>
                          {moduleOptions.map((module) => {
                            const IconComponent = module.icon;
                            return (
                              <SelectItem key={module.value} value={module.value}>
                                <div className="flex items-center gap-2">
                                  <IconComponent className="h-4 w-4" />
                                  <div>
                                    <div className="font-medium">{module.label}</div>
                                    <div className="text-xs text-muted-foreground">{module.description}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="files"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arquivos XML</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        multiple
                        accept=".xml"
                        onChange={(e) => field.onChange(e.target.files)}
                        disabled={isProcessing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Adicione observações sobre esta importação..."
                        {...field}
                        disabled={isProcessing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isProcessing && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Processando Arquivos</CardTitle>
                    <CardDescription>{processingStep}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={importProgress} className="mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {Math.round(importProgress)}% concluído
                    </p>
                  </CardContent>
                </Card>
              )}

              {importResults.length > 0 && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Resultados da Importação</CardTitle>
                      <CardDescription>
                        {importResults.filter(r => r.success).length} sucessos, {importResults.filter(r => !r.success).length} erros
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {importResults.some(r => r.success) && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={exportResults}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Exportar Relatório
                        </Button>
                      )}
                      {importResults.some(r => r.success) && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => {
                            const successResult = importResults.find(r => r.success);
                            if (successResult) {
                              handleNavigateToModule(successResult.module);
                            }
                          }}
                          className="flex items-center gap-2"
                        >
                          Ir para Módulo
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Arquivo</TableHead>
                          <TableHead>DANFE</TableHead>
                          <TableHead>Módulo</TableHead>
                          <TableHead>Detalhes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importResults.map((result, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {result.success ? (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Sucesso
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Erro
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{result.fileName}</TableCell>
                            <TableCell>
                              {result.danfeNumber || "—"}
                            </TableCell>
                            <TableCell>
                              {result.module ? (
                                <div className="flex items-center gap-1">
                                  {(() => {
                                    const module = moduleOptions.find(m => m.value === result.module);
                                    const IconComponent = module?.icon;
                                    return (
                                      <>
                                        {IconComponent && <IconComponent className="h-3 w-3" />}
                                        <span className="text-xs">{module?.label}</span>
                                      </>
                                    );
                                  })()}
                                </div>
                              ) : "—"}
                            </TableCell>
                            <TableCell>
                              {result.success ? (
                                <div className="text-sm">
                                  <div>Fornecedor: {result.data?.supplier.name}</div>
                                  <div>Valor: R$ {result.data?.totalValue.toFixed(2)}</div>
                                  <div>Itens: {result.data?.items.length}</div>
                                </div>
                              ) : (
                                <div className="text-sm text-red-600">
                                  {result.error}
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  disabled={isProcessing}
                >
                  {importResults.length > 0 ? "Fechar" : "Cancelar"}
                </Button>
                <Button 
                  type="submit" 
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processando..." : "Importar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }

  // Original trigger-based modal for backward compatibility
  return (
    <Dialog open={internalOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Card className="p-6 border-dashed border-2 hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 rounded-full bg-primary/10">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium">Importar XML</h3>
            <p className="text-sm text-muted-foreground">
              Faça upload de arquivos XML de notas fiscais
            </p>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Importar Notas Fiscais XML
          </DialogTitle>
          <DialogDescription>
            Selecione um módulo de destino e os arquivos XML de notas fiscais para importação.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="targetModule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Módulo de Destino *</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isProcessing}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione onde importar os dados" />
                      </SelectTrigger>
                      <SelectContent>
                        {moduleOptions.map((module) => {
                          const IconComponent = module.icon;
                          return (
                            <SelectItem key={module.value} value={module.value}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                <div>
                                  <div className="font-medium">{module.label}</div>
                                  <div className="text-xs text-muted-foreground">{module.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="files"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Arquivos XML</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      multiple
                      accept=".xml"
                      onChange={(e) => field.onChange(e.target.files)}
                      disabled={isProcessing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adicione observações sobre esta importação..."
                      {...field}
                      disabled={isProcessing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isProcessing && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Processando Arquivos</CardTitle>
                  <CardDescription>{processingStep}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={importProgress} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {Math.round(importProgress)}% concluído
                  </p>
                </CardContent>
              </Card>
            )}

            {importResults.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Resultados da Importação</CardTitle>
                    <CardDescription>
                      {importResults.filter(r => r.success).length} sucessos, {importResults.filter(r => !r.success).length} erros
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {importResults.some(r => r.success) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={exportResults}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Exportar Relatório
                      </Button>
                    )}
                    {importResults.some(r => r.success) && (
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => {
                          const successResult = importResults.find(r => r.success);
                          if (successResult) {
                            handleNavigateToModule(successResult.module);
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        Ir para Módulo
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Arquivo</TableHead>
                        <TableHead>DANFE</TableHead>
                        <TableHead>Módulo</TableHead>
                        <TableHead>Detalhes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importResults.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {result.success ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Sucesso
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Erro
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{result.fileName}</TableCell>
                          <TableCell>
                            {result.danfeNumber || "—"}
                          </TableCell>
                          <TableCell>
                            {result.module ? (
                              <div className="flex items-center gap-1">
                                {(() => {
                                  const module = moduleOptions.find(m => m.value === result.module);
                                  const IconComponent = module?.icon;
                                  return (
                                    <>
                                      {IconComponent && <IconComponent className="h-3 w-3" />}
                                      <span className="text-xs">{module?.label}</span>
                                    </>
                                  );
                                })()}
                              </div>
                            ) : "—"}
                          </TableCell>
                          <TableCell>
                            {result.success ? (
                              <div className="text-sm">
                                <div>Fornecedor: {result.data?.supplier.name}</div>
                                <div>Valor: R$ {result.data?.totalValue.toFixed(2)}</div>
                                <div>Itens: {result.data?.items.length}</div>
                              </div>
                            ) : (
                              <div className="text-sm text-red-600">
                                {result.error}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isProcessing}
              >
                {importResults.length > 0 ? "Fechar" : "Cancelar"}
              </Button>
              <Button 
                type="submit" 
                disabled={isProcessing}
              >
                {isProcessing ? "Processando..." : "Importar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
