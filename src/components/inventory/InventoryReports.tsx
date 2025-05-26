
import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, FileDown, CalendarIcon, Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { InventoryReport, PurchaseReport, Invoice, InventoryMovement } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { ViewReportDialog } from "./ViewReportDialog";
import { DeleteReportDialog } from "./DeleteReportDialog";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";
import { toast } from "@/hooks/use-toast";

interface InventoryReportsProps {
  invoices: Invoice[];
}

export function InventoryReports({ invoices }: InventoryReportsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() - 30))
  );
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [selectedReport, setSelectedReport] = useState<InventoryReport | PurchaseReport | null>(null);
  const [reportType, setReportType] = useState<'inventory' | 'purchases'>('inventory');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: manualMovements } = useLocalStorageSync<InventoryMovement>('inventory-movements', []);

  // Generate real inventory reports based on approved invoices
  const inventoryReports: InventoryReport[] = useMemo(() => {
    const approvedInvoices = invoices.filter(invoice => invoice.status === 'aprovada' && invoice.isActive);
    const productGroups = new Map<string, {
      productName: string;
      lastEntryDate: Date;
      supplier: string;
      supplierCode: string;
      entries: { quantity: number; unitCost: number; totalCost: number }[];
      exits: number;
    }>();

    // Process entries from invoices
    approvedInvoices.forEach(invoice => {
      invoice.items.forEach(item => {
        const key = `${item.description}-${item.unitOfMeasure}`;
        const existing = productGroups.get(key);
        
        if (!existing) {
          productGroups.set(key, {
            productName: item.description,
            lastEntryDate: invoice.issueDate,
            supplier: invoice.supplier.name,
            supplierCode: invoice.supplier.id,
            entries: [{ quantity: item.quantity, unitCost: item.unitPrice, totalCost: item.totalPrice }],
            exits: 0
          });
        } else {
          existing.entries.push({ quantity: item.quantity, unitCost: item.unitPrice, totalCost: item.totalPrice });
          if (invoice.issueDate > existing.lastEntryDate) {
            existing.lastEntryDate = invoice.issueDate;
            existing.supplier = invoice.supplier.name;
            existing.supplierCode = invoice.supplier.id;
          }
        }
      });
    });

    // Process exits from manual movements
    manualMovements.filter(mov => mov.type === 'saida').forEach(movement => {
      const key = `${movement.productDescription}-${movement.unitOfMeasure}`;
      const existing = productGroups.get(key);
      if (existing) {
        existing.exits += movement.quantity;
      }
    });

    // Convert to report format
    return Array.from(productGroups.entries()).map(([key, data], index) => {
      const totalEntries = data.entries.reduce((sum, entry) => sum + entry.quantity, 0);
      const totalCost = data.entries.reduce((sum, entry) => sum + entry.totalCost, 0);
      const avgUnitCost = totalCost / totalEntries;
      const currentQuantity = totalEntries - data.exits;
      
      return {
        productCode: `P${String(index + 1).padStart(3, '0')}`,
        productName: data.productName,
        lastEntryDate: data.lastEntryDate,
        supplierCode: data.supplierCode,
        supplierName: data.supplier,
        currentQuantity,
        unitCost: avgUnitCost,
        totalCost: currentQuantity * avgUnitCost,
      };
    });
  }, [invoices, manualMovements]);

  // Generate real purchase reports based on approved invoices
  const purchaseReports: PurchaseReport[] = useMemo(() => {
    const approvedInvoices = invoices.filter(invoice => invoice.status === 'aprovada' && invoice.isActive);
    const reports: PurchaseReport[] = [];

    approvedInvoices.forEach(invoice => {
      invoice.items.forEach((item, index) => {
        // Calculate current balance by subtracting exits
        const exits = manualMovements
          .filter(mov => mov.type === 'saida' && mov.productDescription === item.description)
          .reduce((sum, mov) => sum + mov.quantity, 0);
        
        reports.push({
          productCode: `P${String(reports.length + 1).padStart(3, '0')}`,
          description: item.description,
          supplier: invoice.supplier.name,
          entryDate: invoice.issueDate,
          quantity: item.quantity,
          unitOfMeasure: item.unitOfMeasure,
          value: item.totalPrice,
          currentBalance: Math.max(0, item.quantity - exits),
        });
      });
    });

    return reports;
  }, [invoices, manualMovements]);

  // Filter reports based on date range and search term
  const filteredInventoryReports = inventoryReports.filter(report => {
    if (fromDate && report.lastEntryDate < fromDate) return false;
    if (toDate && report.lastEntryDate > toDate) return false;
    return report.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           report.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredPurchaseReports = purchaseReports.filter(report => {
    if (fromDate && report.entryDate < fromDate) return false;
    if (toDate && report.entryDate > toDate) return false;
    return report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           report.supplier.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatDate = (date: Date | undefined) => {
    return date ? format(date, 'dd/MM/yyyy') : '';
  };

  const handleViewReport = (report: InventoryReport | PurchaseReport) => {
    setSelectedReport(report);
  };

  const handleDeleteClick = (report: InventoryReport | PurchaseReport) => {
    setSelectedReport(report);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteReport = (password: string, reason: string) => {
    console.log(`Report deleted: ${selectedReport?.productCode} by User. Reason: ${reason}`);
    toast({
      title: "Relatório excluído",
      description: "O relatório foi excluído com sucesso.",
    });
    setIsDeleteDialogOpen(false);
    setSelectedReport(null);
  };

  const handleExportCsv = () => {
    const data = reportType === 'inventory' ? filteredInventoryReports : filteredPurchaseReports;
    const headers = reportType === 'inventory' 
      ? ['Código', 'Produto', 'Última Entrada', 'Fornecedor', 'Quantidade', 'Custo Unit.', 'Custo Total']
      : ['Código', 'Descrição', 'Fornecedor', 'Data Entrada', 'Quantidade', 'Unidade', 'Valor', 'Saldo'];
    
    const csvData = data.map(report => {
      if (reportType === 'inventory') {
        const invReport = report as InventoryReport;
        return [
          invReport.productCode,
          invReport.productName,
          format(invReport.lastEntryDate, 'dd/MM/yyyy'),
          invReport.supplierName,
          invReport.currentQuantity.toString(),
          invReport.unitCost.toFixed(2),
          invReport.totalCost.toFixed(2)
        ];
      } else {
        const purchReport = report as PurchaseReport;
        return [
          purchReport.productCode,
          purchReport.description,
          purchReport.supplier,
          format(purchReport.entryDate, 'dd/MM/yyyy'),
          purchReport.quantity.toString(),
          purchReport.unitOfMeasure,
          purchReport.value.toFixed(2),
          purchReport.currentBalance.toString()
        ];
      }
    });
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-${reportType}-${format(new Date(), 'dd-MM-yyyy')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Exportação concluída",
      description: "Arquivo CSV gerado com sucesso.",
    });
  };

  const handleExportPdf = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A exportação em PDF será implementada em breve.",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Relatórios de Estoque</CardTitle>
        <div className="flex items-center gap-2">
          <Button onClick={handleExportCsv} variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-1" />
            CSV
          </Button>
          <Button onClick={handleExportPdf} variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-1" />
            PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="inventory" className="w-full" onValueChange={(value) => setReportType(value as 'inventory' | 'purchases')}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="inventory">Produtos em Estoque</TabsTrigger>
            <TabsTrigger value="purchases">Compras</TabsTrigger>
          </TabsList>

          <div className="flex flex-col md:flex-row items-center gap-2 my-4">
            <div className="flex items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[180px] justify-start text-left font-normal",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? formatDate(fromDate) : "Data inicial"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={setFromDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[180px] justify-start text-left font-normal",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? formatDate(toDate) : "Data final"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={setToDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>

          <TabsContent value="inventory" className="mt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código do Produto</TableHead>
                    <TableHead>Nome do Produto</TableHead>
                    <TableHead>Data Última Entrada</TableHead>
                    <TableHead>Código do Fornecedor</TableHead>
                    <TableHead>Nome do Fornecedor</TableHead>
                    <TableHead>Quantidade Atual</TableHead>
                    <TableHead>Custo Unitário</TableHead>
                    <TableHead>Custo Total</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventoryReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center">
                        Nenhum resultado encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInventoryReports.map((report) => (
                      <TableRow key={report.productCode}>
                        <TableCell>{report.productCode}</TableCell>
                        <TableCell>{report.productName}</TableCell>
                        <TableCell>{format(report.lastEntryDate, 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{report.supplierCode}</TableCell>
                        <TableCell>{report.supplierName}</TableCell>
                        <TableCell>{report.currentQuantity}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(report.unitCost)}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(report.totalCost)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleViewReport(report)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDeleteClick(report)}
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
            </div>
          </TabsContent>

          <TabsContent value="purchases" className="mt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código do Produto</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Data de Entrada</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Saldo Atual</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchaseReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center">
                        Nenhum resultado encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPurchaseReports.map((report) => (
                      <TableRow key={report.productCode}>
                        <TableCell>{report.productCode}</TableCell>
                        <TableCell>{report.description}</TableCell>
                        <TableCell>{report.supplier}</TableCell>
                        <TableCell>{format(report.entryDate, 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{report.quantity}</TableCell>
                        <TableCell>{report.unitOfMeasure}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(report.value)}
                        </TableCell>
                        <TableCell>{report.currentBalance}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleViewReport(report)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDeleteClick(report)}
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
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {selectedReport && !isDeleteDialogOpen && (
        <ViewReportDialog
          report={selectedReport}
          reportType={reportType}
          open={!!selectedReport && !isDeleteDialogOpen}
          onOpenChange={() => setSelectedReport(null)}
        />
      )}

      {selectedReport && isDeleteDialogOpen && (
        <DeleteReportDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onDelete={handleDeleteReport}
          reportType={reportType}
          report={selectedReport}
        />
      )}
    </Card>
  );
}
