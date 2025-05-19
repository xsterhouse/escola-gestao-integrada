
import { useState } from "react";
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
import { InventoryReport, PurchaseReport, Invoice } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { ViewReportDialog } from "./ViewReportDialog";
import { DeleteReportDialog } from "./DeleteReportDialog";
import { 
  generateInventoryReportPDF, 
  generatePurchaseReportPDF,
  exportToCsv
} from "@/lib/pdf-utils";

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

  // Mock data for inventory report
  const inventoryReports: InventoryReport[] = [
    {
      productCode: "P001",
      productName: "Caneta Esferográfica Azul",
      lastEntryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      supplierCode: "S001",
      supplierName: "Papelaria Central",
      currentQuantity: 200,
      unitCost: 2.5,
      totalCost: 500,
    },
    {
      productCode: "P002",
      productName: "Papel Sulfite A4",
      lastEntryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      supplierCode: "S001",
      supplierName: "Papelaria Central",
      currentQuantity: 20,
      unitCost: 20,
      totalCost: 400,
    },
    {
      productCode: "P003",
      productName: "Grampeador",
      lastEntryDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      supplierCode: "S002",
      supplierName: "Office Supplies",
      currentQuantity: 50,
      unitCost: 15,
      totalCost: 750,
    },
  ];

  // Mock data for purchase report
  const purchaseReports: PurchaseReport[] = [
    {
      productCode: "P001",
      description: "Caneta Esferográfica Azul",
      supplier: "Papelaria Central",
      entryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      quantity: 250,
      unitOfMeasure: "Un",
      value: 625,
      currentBalance: 200,
    },
    {
      productCode: "P002",
      description: "Papel Sulfite A4",
      supplier: "Papelaria Central",
      entryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      quantity: 25,
      unitOfMeasure: "Pct",
      value: 500,
      currentBalance: 20,
    },
    {
      productCode: "P003",
      description: "Grampeador",
      supplier: "Office Supplies",
      entryDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      quantity: 60,
      unitOfMeasure: "Un",
      value: 900,
      currentBalance: 50,
    },
  ];

  // Filter reports based on date range
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
    // In a real application, validate the password against the user's password
    
    // Log the deletion for audit trails
    console.log(`Report deleted: ${selectedReport?.productCode} by User. Reason: ${reason}`);
    
    // Close the dialog
    setIsDeleteDialogOpen(false);
    setSelectedReport(null);
  };

  const handleExportCsv = () => {
    if (reportType === 'inventory') {
      exportToCsv(filteredInventoryReports, 'produtos-em-estoque', [
        { header: 'Código', key: 'productCode' },
        { header: 'Produto', key: 'productName' },
        { header: 'Última Entrada', key: 'lastEntryDate' },
        { header: 'Fornecedor', key: 'supplierName' },
        { header: 'Quantidade', key: 'currentQuantity' },
        { header: 'Custo Unit.', key: 'unitCost' },
        { header: 'Custo Total', key: 'totalCost' }
      ]);
    } else {
      exportToCsv(filteredPurchaseReports, 'compras', [
        { header: 'Código', key: 'productCode' },
        { header: 'Descrição', key: 'description' },
        { header: 'Fornecedor', key: 'supplier' },
        { header: 'Data Entrada', key: 'entryDate' },
        { header: 'Quantidade', key: 'quantity' },
        { header: 'Unidade', key: 'unitOfMeasure' },
        { header: 'Valor', key: 'value' },
        { header: 'Saldo', key: 'currentBalance' }
      ]);
    }
  };

  const handleExportPdf = () => {
    if (reportType === 'inventory') {
      generateInventoryReportPDF(filteredInventoryReports);
    } else {
      generatePurchaseReportPDF(filteredPurchaseReports);
    }
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
