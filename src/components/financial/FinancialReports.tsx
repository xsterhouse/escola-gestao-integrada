
import { useState } from "react";
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
  ReceivableAccount, 
  FinancialReportFilter 
} from "@/lib/types";
import { generateModernFinancialReportPDF } from "@/lib/pdf-utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface FinancialReportsProps {
  bankAccounts: BankAccount[];
  transactions: BankTransaction[];
  payables: PaymentAccount[];
  receivables: ReceivableAccount[];
}

export function FinancialReports({
  bankAccounts,
  transactions,
  payables,
  receivables,
}: FinancialReportsProps) {
  const { user, currentSchool } = useAuth();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [resourceTypeFilter, setResourceTypeFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewReportOpen, setIsViewReportOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedReportId, setSelectedReportId] = useState("");
  
  const purchasingCenters = [
    "Central de Compras Municipal",
    "Central Regional Norte"
  ];
  
  // Relatórios salvos carregados do localStorage (dados reais)
  const [reports, setReports] = useState(() => {
    const savedReports = localStorage.getItem('financialReports');
    return savedReports ? JSON.parse(savedReports) : [];
  });

  // Função para salvar relatório
  const saveReportToStorage = (reportData: any) => {
    const newReport = {
      id: `report_${Date.now()}`,
      title: reportData.title,
      reportType: reportData.reportType,
      resourceType: reportData.filters?.resourceType || reportData.filters?.status || "Todos",
      period: reportData.period,
      createdAt: new Date().toISOString(),
      createdBy: user?.name || "Usuário",
      schoolName: currentSchool?.name || "Escola",
      data: reportData.data,
      summary: reportData.summary
    };

    const updatedReports = [...reports, newReport];
    setReports(updatedReports);
    localStorage.setItem('financialReports', JSON.stringify(updatedReports));
    
    toast.success("Relatório salvo com sucesso!");
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const handleViewReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setIsViewReportOpen(true);
  };
  
  const handleDeleteReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteReport = () => {
    // Em uma aplicação real, verificaria a senha e deletaria o relatório
    const updatedReports = reports.filter((r: any) => r.id !== selectedReportId);
    setReports(updatedReports);
    localStorage.setItem('financialReports', JSON.stringify(updatedReports));
    setIsDeleteDialogOpen(false);
    setPassword("");
    toast.success("Relatório excluído com sucesso!");
  };
  
  // Função para gerar relatório de recursos (PNAE, PNATE, etc.) em PDF
  const generateResourceReport = () => {
    toast.success("Gerando relatório de prestação de contas...");
    
    // Filtrar dados
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
    
    // Preparar dados para o PDF
    const reportTitle = `Prestação de Contas - ${resourceTypeFilter !== "all" ? resourceTypeFilter : "Todos os recursos"}`;
    const reportPeriod = startDate && endDate 
      ? `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
      : "Período completo";
    
    // Formatar dados de pagamentos
    const paymentsData = filteredPayments.map(payment => ({
      tipo: "Despesa",
      descricao: payment.description,
      fornecedor: payment.supplier,
      categoria: payment.resourceCategory,
      data: format(new Date(payment.dueDate), 'dd/MM/yyyy'),
      valor: formatCurrency(payment.value),
      status: payment.status === 'a_pagar' ? 'A Pagar' : 'Pago'
    }));
    
    // Formatar dados de recebimentos
    const receiptsData = filteredReceipts.map(receipt => ({
      tipo: "Receita",
      descricao: receipt.description,
      fornecedor: receipt.origin,
      categoria: receipt.resourceType,
      data: format(new Date(receipt.expectedDate), 'dd/MM/yyyy'),
      valor: formatCurrency(receipt.value),
      status: receipt.status === 'pendente' ? 'Pendente' : 'Recebido'
    }));
    
    // Combinar dados
    const reportData = [...receiptsData, ...paymentsData];
    
    // Calcular resumo
    const totalReceitas = filteredReceipts.reduce((sum, receipt) => sum + receipt.value, 0);
    const totalDespesas = filteredPayments.reduce((sum, payment) => sum + payment.value, 0);
    const saldo = totalReceitas - totalDespesas;

    // Preparar dados para salvar
    const reportToSave = {
      title: reportTitle,
      reportType: "resource",
      period: reportPeriod,
      filters: {
        resourceType: resourceTypeFilter,
      },
      schoolName: currentSchool?.name || "Escola",
      purchasingCenters: purchasingCenters,
      userName: user?.name || "Usuário",
      data: reportData,
      summary: {
        totalReceitas,
        totalDespesas,
        saldo
      }
    };

    // Salvar o relatório
    saveReportToStorage(reportToSave);
    
    // Gerar PDF
    generateModernFinancialReportPDF(reportToSave);
  };
  
  // Função para gerar relatório de pagamentos e recebimentos em PDF
  const generateTransactionsReport = () => {
    toast.success("Gerando relatório de pagamentos e recebimentos...");
    
    // Filtrar dados baseado nos filtros selecionados
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
    
    // Preparar dados para o PDF
    const reportTitle = "Relatório de Pagamentos e Recebimentos";
    const reportPeriod = startDate && endDate 
      ? `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
      : "Período completo";
    
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
    
    // Combinar dados
    const reportData = [...receiptsData, ...paymentsData];
    
    // Calcular resumo
    const totalReceitas = filteredReceipts.reduce((sum, receipt) => sum + receipt.value, 0);
    const totalDespesas = filteredPayments.reduce((sum, payment) => sum + payment.value, 0);
    const saldo = totalReceitas - totalDespesas;

    // Preparar dados para salvar
    const reportToSave = {
      title: reportTitle,
      reportType: "transactions",
      period: reportPeriod,
      filters: {
        supplier: supplierFilter,
        status: statusFilter,
      },
      schoolName: currentSchool?.name || "Escola",
      purchasingCenters: purchasingCenters,
      userName: user?.name || "Usuário",
      data: reportData,
      summary: {
        totalReceitas,
        totalDespesas,
        saldo
      }
    };

    // Salvar o relatório
    saveReportToStorage(reportToSave);
    
    // Gerar PDF
    generateModernFinancialReportPDF(reportToSave);
  };
  
  // Function to handle report download
  const handleDownloadReport = (reportId: string) => {
    console.log("🔽 Tentando fazer download do relatório:", reportId);
    console.log("📊 Relatórios disponíveis:", reports);
    
    const report = reports.find((r: any) => r.id === reportId);
    console.log("📋 Relatório encontrado:", report);
    
    if (report) {
      try {
        console.log("📄 Gerando PDF com dados:", report);
        generateModernFinancialReportPDF(report);
        toast.success("Download do relatório iniciado!");
      } catch (error) {
        console.error("❌ Erro ao gerar PDF:", error);
        toast.error("Erro ao gerar o PDF do relatório!");
      }
    } else {
      console.error("❌ Relatório não encontrado para ID:", reportId);
      toast.error("Relatório não encontrado!");
    }
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
                    <FileText className="mr-2 h-4 w-4" />
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
                  {reports.filter((r: any) => r.reportType === "resource").length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Nenhum relatório de prestação de contas encontrado. Gere novos relatórios usando os filtros acima.
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.filter((r: any) => r.reportType === "resource").map((report: any) => (
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
                              onClick={() => handleDownloadReport(report.id)}
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
                    ))
                  )}
                </TableBody>
              </Table>
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
                    <FileText className="mr-2 h-4 w-4" />
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
                  {reports.filter((r: any) => r.reportType === "transactions").length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        Nenhum relatório de pagamentos e recebimentos encontrado. Gere novos relatórios usando os filtros acima.
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.filter((r: any) => r.reportType === "transactions").map((report: any) => (
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
                              onClick={() => handleDownloadReport(report.id)}
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
                    ))
                  )}
                </TableBody>
              </Table>
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
            
            <div>
              <Label htmlFor="reason">Motivo da exclusão</Label>
              <Input id="reason" placeholder="Informe o motivo da exclusão" />
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
          
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-xl font-semibold">
                {reports.find((r: any) => r.id === selectedReportId)?.title || "Relatório"}
              </h3>
              <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Período:</span>{" "}
                  {reports.find((r: any) => r.id === selectedReportId)?.period}
                </div>
                <div>
                  <span className="font-medium">Gerado por:</span>{" "}
                  {reports.find((r: any) => r.id === selectedReportId)?.createdBy}
                </div>
                <div>
                  <span className="font-medium">Data de criação:</span>{" "}
                  {reports.find((r: any) => r.id === selectedReportId)?.createdAt && 
                   format(new Date(reports.find((r: any) => r.id === selectedReportId)!.createdAt), 'dd/MM/yyyy')}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Resumo Financeiro</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Receitas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(reports.find((r: any) => r.id === selectedReportId)?.summary?.totalReceitas || 0)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Despesas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold text-red-600">
                      {formatCurrency(reports.find((r: any) => r.id === selectedReportId)?.summary?.totalDespesas || 0)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Saldo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold">
                      {formatCurrency(reports.find((r: any) => r.id === selectedReportId)?.summary?.saldo || 0)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Itens</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold">
                      {reports.find((r: any) => r.id === selectedReportId)?.data?.length || 0}
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-2 pt-4">
                <h4 className="font-semibold">Detalhes do Relatório</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Tipo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.find((r: any) => r.id === selectedReportId)?.data?.length > 0 ? (
                      reports.find((r: any) => r.id === selectedReportId)?.data?.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{item.descricao}</TableCell>
                          <TableCell>{item.categoria}</TableCell>
                          <TableCell>{item.data}</TableCell>
                          <TableCell>{item.valor}</TableCell>
                          <TableCell>{item.tipo}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          Nenhum dado disponível no relatório selecionado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
