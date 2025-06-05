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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, FileText, CheckCircle, AlertCircle, Download } from "lucide-react";
import { Supplier, Invoice, InvoiceItem } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

const importFormSchema = z.object({
  files: z.any().optional(),
  description: z.string().optional(),
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
}

interface ImportXmlModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ImportXmlModal({ open, onOpenChange }: ImportXmlModalProps) {
  const { toast } = useToast();
  const { currentSchool } = useAuth();
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

  const saveInvoiceToStorage = (xmlData: XmlData): string => {
    if (!currentSchool) throw new Error("Escola não identificada");

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

    // Save to localStorage
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

  const processFiles = async (files: FileList) => {
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
        
        setProcessingStep(`Salvando dados de ${file.name}...`);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const invoiceId = saveInvoiceToStorage(xmlData);
        
        results.push({
          success: true,
          fileName: file.name,
          danfeNumber: xmlData.danfeNumber,
          data: xmlData
        });

        console.log(`✅ Nota fiscal ${xmlData.danfeNumber} importada com sucesso - ID: ${invoiceId}`);
        
      } catch (error) {
        console.error(`❌ Erro ao processar ${file.name}:`, error);
        results.push({
          success: false,
          fileName: file.name,
          error: error.message
        });
      }

      setImportProgress(((i + 1) / totalFiles) * 100);
    }

    setImportResults(results);
    setIsProcessing(false);
    setProcessingStep("");

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    if (successCount > 0) {
      toast({
        title: "Importação concluída",
        description: `${successCount} nota(s) fiscal(is) importada(s) com sucesso. ${errorCount > 0 ? `${errorCount} arquivo(s) com erro.` : ''}`,
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

    await processFiles(data.files);
  };

  const handleClose = () => {
    if (!isProcessing) {
      setIsOpen(false);
      form.reset();
      setImportResults([]);
      setImportProgress(0);
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
      dataImportacao: new Date().toLocaleDateString('pt-BR')
    }));

    const csvContent = [
      ['Arquivo', 'DANFE', 'Fornecedor', 'Valor', 'Data Importação'],
      ...reportData.map(row => [
        row.arquivo,
        row.danfe,
        row.fornecedor,
        `R$ ${row.valor?.toFixed(2)}`,
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
              Selecione um ou múltiplos arquivos XML de notas fiscais para importação.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Arquivo</TableHead>
                          <TableHead>DANFE</TableHead>
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
            Selecione um ou múltiplos arquivos XML de notas fiscais para importação.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Arquivo</TableHead>
                        <TableHead>DANFE</TableHead>
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
