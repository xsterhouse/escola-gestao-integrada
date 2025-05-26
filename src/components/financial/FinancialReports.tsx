
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  FileText, 
  Download, 
  Filter, 
  FileDown, 
  Trash2, 
  Eye, 
  Calendar as CalendarIcon 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  BankAccount, 
  BankTransaction, 
  PaymentAccount, 
  ReceivableAccount 
} from "@/lib/types";
import { exportToCsv } from "@/lib/pdf-utils";
import { useToast } from "@/hooks/use-toast";

interface FinancialReportsProps {
  bankAccounts: BankAccount[];
  transactions: BankTransaction[];
  payables: PaymentAccount[];
  receivables: ReceivableAccount[];
}

interface SavedReport {
  id: string;
  title: string;
  resourceType: string;
  period: string;
  createdAt: Date;
  createdBy: string;
  status: string;
  data: any;
}

export function FinancialReports({
  bankAccounts,
  transactions,
  payables,
  receivables,
}: FinancialReportsProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [resourceTypeFilter, setResourceTypeFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewReportOpen, setIsViewReportOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedReportId, setSelectedReportId] = useState("");
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  const [reports, setReports] = useState<SavedReport[]>([]);
  const { toast } = useToast();

  // Load reports from localStorage on component mount
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    const savedReports = localStorage.getItem('financialReports');
    if (savedReports) {
      const parsedReports = JSON.parse(savedReports).map((report: any) => ({
        ...report,
        createdAt: new Date(report.createdAt)
      }));
      setReports(parsedReports);
    }
  };

  const saveReport = (title: string, resourceType: string, period: string, data: any) => {
    const newReport: SavedReport = {
      id: crypto.randomUUID(),
      title,
      resourceType,
      period,
      createdAt: new Date(),
      createdBy: "Usuário Atual", // Would come from auth context in real app
      status: "finalizado",
      data
    };

    const updatedReports = [...reports, newReport];
    setReports(updatedReports);
    localStorage.setItem('financialReports', JSON.stringify(updatedReports));

    toast({
      title: "Relatório salvo",
      description: "O relatório foi salvo com sucesso.",
    });
  };

  const deleteReport = (reportId: string) => {
    const updatedReports = reports.filter(r => r.id !== reportId);
    setReports(updatedReports);
    localStorage.setItem('financialReports', JSON.stringify(updatedReports));

    toast({
      title: "Relatório excluído",
      description: "O relatório foi excluído com sucesso.",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const handleViewReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setSelectedReport(report);
      setSelectedReportId(reportId);
      setIsViewReportOpen(true);
    }
  };
  
  const handleDeleteReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteReport = () => {
    if (password === "123456") { // Simple password check - would use proper auth in real app
      deleteReport(selectedReportId);
      setIsDeleteDialogOpen(false);
      setPassword("");
    } else {
      toast({
        title: "Senha incorreta",
        description: "Digite a senha correta para excluir o relatório.",
        variant: "destructive"
      });
    }
  };
  
  // Function to generate a resource report (PNAE, PNATE, etc.)
  const generateResourceReport = () => {
    // Filter and format data for the report
    const filteredPayments = payables.filter(payment => {
      if (resourceTypeFilter !== "all" && payment.resourceCategory !== resourceTypeFilter) {
        return false;
      }
      
      if (startDate && new Date(payment.dueDate) < startDate) {
        return false;
      }
      
      if (endDate) {
        const endDateWithTime = new Date(endDate);
        endDateWithTime.setHours(23, 59, 59, 999);
        if (new Date(payment.dueDate) > endDateWithTime) {
          return false;
        }
      }
      
      return true;
    });
    
    const filteredReceipts = receivables.filter(receipt => {
      if (resourceTypeFilter !== "all" && receipt.resourceType !== resourceTypeFilter) {
        return false;
      }
      
      if (startDate && new Date(receipt.expectedDate) < startDate) {
        return false;
      }
      
      if (endDate) {
        const endDateWithTime = new Date(endDate);
        endDateWithTime.setHours(23, 59, 59, 999);
        if (new Date(receipt.expectedDate) > endDateWithTime) {
          return false;
        }
      }
      
      return true;
    });
    
    // Prepare data for export
    const reportTitle = `Prestação de Contas - ${resourceTypeFilter !== "all" ? resourceTypeFilter : "Todos os recursos"}`;
    const reportPeriod = startDate && endDate 
      ? `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
      : "Período completo";
    
    // Format payments data
    const paymentsData = filteredPayments.map(payment => ({
      tipo: "Despesa",
      descricao: payment.description,
      fornecedor: payment.supplier,
      categoria: payment.resourceCategory,
      data: format(new Date(payment.dueDate), 'dd/MM/yyyy'),
      valor: formatCurrency(payment.value),
      status: payment.status === 'a_pagar' ? 'A Pagar' : 'Pago'
    }));
    
    // Format receipts data
    const receiptsData = filteredReceipts.map(receipt => ({
      tipo: "Receita",
      descricao: receipt.description,
      fornecedor: receipt.origin,
      categoria: receipt.resourceType,
      data: format(new Date(receipt.expectedDate), 'dd/MM/yyyy'),
      valor: formatCurrency(receipt.value),
      status: receipt.status === 'pendente' ? 'Pendente' : 'Recebido'
    }));
    
    // Combine data
    const reportData = [...receiptsData, ...paymentsData];
    
    // Save report to localStorage
    saveReport(reportTitle, resourceTypeFilter, reportPeriod, reportData);
    
    // Export to CSV
    exportToCsv(reportData, `prestacao_contas_${resourceTypeFilter}`, [
      { header: 'Tipo', key: 'tipo' },
      { header: 'Descrição', key: 'descricao' },
      { header: 'Fornecedor/Origem', key: 'fornecedor' },
      { header: 'Categoria', key: 'categoria' },
      { header: 'Data', key: 'data' },
      { header: 'Valor', key: 'valor' },
      { header: 'Status', key: 'status' }
    ]);
  };
  
  // Function to generate payment and receipt report
  const generateTransactionsReport = () => {
    // Filter data based on selected filters
    const filteredPayments = payables.filter(payment => {
      let include = true;
      
      if (startDate && (!payment.paymentDate || new Date(payment.paymentDate) < startDate)) {
        include = false;
      }
      
      if (endDate && payment.paymentDate) {
        const endDateWithTime = new Date(endDate);
        endDateWithTime.setHours(23, 59, 59, 999);
        if (new Date(payment.paymentDate) > endDateWithTime) {
          include = false;
        }
      }
      
      if (statusFilter !== "all") {
        if (statusFilter === "paid" && payment.status !== "pago") {
          include = false;
        } else if (statusFilter === "pending" && payment.status !== "a_pagar") {
          include = false;
        }
      }
      
      if (supplierFilter && !payment.supplier.toLowerCase().includes(supplierFilter.toLowerCase())) {
        include = false;
      }
      
      return include;
    });
    
    const filteredReceipts = receivables.filter(receipt => {
      let include = true;
      
      if (startDate && (!receipt.receivedDate || new Date(receipt.receivedDate) < startDate)) {
        include = false;
      }
      
      if (endDate && receipt.receivedDate) {
        const endDateWithTime = new Date(endDate);
        endDateWithTime.setHours(23, 59, 59, 999);
        if (new Date(receipt.receivedDate) > endDateWithTime) {
          include = false;
        }
      }
      
      if (statusFilter !== "all") {
        if (statusFilter === "received" && receipt.status !== "recebido") {
          include = false;
        } else if (statusFilter === "pending" && receipt.status !== "pendente") {
          include = false;
        }
      }
      
      if (supplierFilter && !receipt.origin.toLowerCase().includes(supplierFilter.toLowerCase())) {
        include = false;
      }
      
      return include;
    });
    
    // Prepare data for export
    const paymentsData = filteredPayments.map(payment => ({
      tipo: "Pagamento",
      descricao: payment.description,
      fornecedor_origem: payment.supplier,
      data: payment.paymentDate ? format(new Date(payment.paymentDate), 'dd/MM/yyyy') : format(new Date(payment.dueDate), 'dd/MM/yyyy'),
      valor: formatCurrency(payment.value),
      situacao: payment.status === 'a_pagar' ? 'A Pagar' : 'Pago'
    }));
    
    const receiptsData = filteredReceipts.map(receipt => ({
      tipo: "Recebimento",
      descricao: receipt.description,
      fornecedor_origem: receipt.origin,
      data: receipt.receivedDate ? format(new Date(receipt.receivedDate), 'dd/MM/yyyy') : format(new Date(receipt.expectedDate), 'dd/MM/yyyy'),
      valor: formatCurrency(receipt.value),
      situacao: receipt.status === 'pendente' ? 'Pendente' : 'Recebido'
    }));
    
    // Combine data
    const reportData = [...receiptsData, ...paymentsData];
    
    const reportTitle = "Relatório de Pagamentos e Recebimentos";
    const reportPeriod = startDate && endDate 
      ? `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
      : "Período completo";
    
    // Save report to localStorage
    saveReport(reportTitle, "Todos", reportPeriod, reportData);
    
    // Export to CSV
    exportToCsv(reportData, 'pagamentos_recebimentos', [
      { header: 'Tipo', key: 'tipo' },
      { header: 'Descrição', key: 'descricao' },
      { header: 'Fornecedor/Origem', key: 'fornecedor_origem' },
      { header: 'Data', key: 'data' },
      { header: 'Valor', key: 'valor' },
      { header: 'Situação', key: 'situacao' }
    ]);
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="resource" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="resource">Prestação de Contas</TabsTrigger>
          <TabsTrigger value="transactions">Pagamentos e Recebimentos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resource" className="space-y-4 mt-4">
          {/* Resource reports filters */}
          <Card>
            <CardHeader>
              <CardTitle>Prestação de Contas por Tipo de Recurso</CardTitle>
              <CardDescription>
                Gere relatórios de prestação de contas filtrados por tipo de recurso e período.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Label htmlFor="resourceType">Tipo de Recurso</Label>
                  <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
                    <SelectTrigger id="resourceType">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="PNAE">PNAE</SelectItem>
                      <SelectItem value="PNATE">PNATE</SelectItem>
                      <SelectItem value="Recursos Próprios">Recursos Próprios</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Data Inicial</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        {startDate ? format(startDate, 'dd/MM/yyyy') : "Selecione uma data"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label>Data Final</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        {endDate ? format(endDate, 'dd/MM/yyyy') : "Selecione uma data"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="flex items-end">
                  <Button onClick={generateResourceReport} className="w-full">
                    <FileDown className="mr-2 h-4 w-4" />
                    Gerar Relatório
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Saved resource reports */}
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Salvos</CardTitle>
              <CardDescription>
                Consulte e baixe relatórios de prestação de contas gerados anteriormente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reports.filter(r => r.resourceType !== "Todos").length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">Nenhum relatório de prestação de contas salvo.</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Gere um relatório acima para vê-lo aqui.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Tipo de Recurso</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead>Criado Por</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.filter(r => r.resourceType !== "Todos").map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.title}</TableCell>
                        <TableCell>{report.resourceType}</TableCell>
                        <TableCell>{report.period}</TableCell>
                        <TableCell>{format(new Date(report.createdAt), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{report.createdBy}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewReport(report.id)}
                              title="Visualizar"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => exportToCsv(report.data, report.title.replace(/\s+/g, '_'), [
                                { header: 'Tipo', key: 'tipo' },
                                { header: 'Descrição', key: 'descricao' },
                                { header: 'Fornecedor/Origem', key: 'fornecedor' },
                                { header: 'Categoria', key: 'categoria' },
                                { header: 'Data', key: 'data' },
                                { header: 'Valor', key: 'valor' },
                                { header: 'Status', key: 'status' }
                              ])}
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteReport(report.id)}
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4 mt-4">
          {/* Transactions reports filters */}
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Pagamentos e Recebimentos</CardTitle>
              <CardDescription>
                Gere relatórios de pagamentos e recebimentos filtrados por período, fornecedor e status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                <div>
                  <Label>Data Inicial</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        {startDate ? format(startDate, 'dd/MM/yyyy') : "Selecione uma data"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label>Data Final</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        {endDate ? format(endDate, 'dd/MM/yyyy') : "Selecione uma data"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label htmlFor="supplier">Fornecedor/Origem</Label>
                  <Input 
                    id="supplier" 
                    placeholder="Filtrar por nome"
                    value={supplierFilter}
                    onChange={(e) => setSupplierFilter(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="pending">A Pagar</SelectItem>
                      <SelectItem value="received">Recebido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button onClick={generateTransactionsReport} className="w-full">
                    <FileDown className="mr-2 h-4 w-4" />
                    Gerar Relatório
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Saved transaction reports */}
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Salvos</CardTitle>
              <CardDescription>
                Consulte e baixe relatórios de pagamentos e recebimentos gerados anteriormente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reports.filter(r => r.resourceType === "Todos").length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">Nenhum relatório de pagamentos e recebimentos salvo.</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Gere um relatório acima para vê-lo aqui.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead>Criado Por</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.filter(r => r.resourceType === "Todos").map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.title}</TableCell>
                        <TableCell>{report.period}</TableCell>
                        <TableCell>{format(new Date(report.createdAt), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{report.createdBy}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewReport(report.id)}
                              title="Visualizar"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => exportToCsv(report.data, report.title.replace(/\s+/g, '_'), [
                                { header: 'Tipo', key: 'tipo' },
                                { header: 'Descrição', key: 'descricao' },
                                { header: 'Fornecedor/Origem', key: 'fornecedor_origem' },
                                { header: 'Data', key: 'data' },
                                { header: 'Valor', key: 'valor' },
                                { header: 'Situação', key: 'situacao' }
                              ])}
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteReport(report.id)}
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Delete Report Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Relatório</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. O registro da exclusão ficará salvo no histórico do sistema.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input 
                type="password" 
                id="password" 
                placeholder="Digite sua senha para confirmar"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteReport}>
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Report Dialog */}
      <Dialog open={isViewReportOpen} onOpenChange={setIsViewReportOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Visualizar Relatório</DialogTitle>
            <DialogDescription>
              Detalhes do relatório selecionado.
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-xl font-semibold">{selectedReport.title}</h3>
                <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Período:</span> {selectedReport.period}
                  </div>
                  <div>
                    <span className="font-medium">Gerado por:</span> {selectedReport.createdBy}
                  </div>
                  <div>
                    <span className="font-medium">Data de criação:</span>{" "}
                    {format(new Date(selectedReport.createdAt), 'dd/MM/yyyy')}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Resumo Financeiro</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total de Itens</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl font-bold">{selectedReport.data?.length || 0}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Receitas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl font-bold text-green-600">
                        {selectedReport.data?.filter((item: any) => item.tipo === 'Receita' || item.tipo === 'Recebimento').length || 0}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Despesas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl font-bold text-red-600">
                        {selectedReport.data?.filter((item: any) => item.tipo === 'Despesa' || item.tipo === 'Pagamento').length || 0}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-2 pt-4">
                  <h4 className="font-semibold">Detalhes do Relatório</h4>
                  {selectedReport.data && selectedReport.data.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Fornecedor/Origem</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedReport.data.slice(0, 10).map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{item.tipo}</TableCell>
                            <TableCell>{item.descricao}</TableCell>
                            <TableCell>{item.fornecedor || item.fornecedor_origem}</TableCell>
                            <TableCell>{item.data}</TableCell>
                            <TableCell>{item.valor}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-gray-500">Nenhum dado disponível para este relatório.</p>
                  )}
                  {selectedReport.data && selectedReport.data.length > 10 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Mostrando 10 de {selectedReport.data.length} itens. Baixe o relatório completo para ver todos os dados.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="pt-4">
            <div className="flex gap-2 w-full justify-between">
              <Button variant="outline" onClick={() => setIsViewReportOpen(false)}>
                Fechar
              </Button>
              {selectedReport && (
                <Button 
                  onClick={() => {
                    if (selectedReport.resourceType === "Todos") {
                      exportToCsv(selectedReport.data, selectedReport.title.replace(/\s+/g, '_'), [
                        { header: 'Tipo', key: 'tipo' },
                        { header: 'Descrição', key: 'descricao' },
                        { header: 'Fornecedor/Origem', key: 'fornecedor_origem' },
                        { header: 'Data', key: 'data' },
                        { header: 'Valor', key: 'valor' },
                        { header: 'Situação', key: 'situacao' }
                      ]);
                    } else {
                      exportToCsv(selectedReport.data, selectedReport.title.replace(/\s+/g, '_'), [
                        { header: 'Tipo', key: 'tipo' },
                        { header: 'Descrição', key: 'descricao' },
                        { header: 'Fornecedor/Origem', key: 'fornecedor' },
                        { header: 'Categoria', key: 'categoria' },
                        { header: 'Data', key: 'data' },
                        { header: 'Valor', key: 'valor' },
                        { header: 'Status', key: 'status' }
                      ]);
                    }
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar CSV
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
