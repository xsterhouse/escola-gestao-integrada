
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
import { Search, FileDown, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { InventoryReport, PurchaseReport, Invoice } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";

interface InventoryReportsProps {
  invoices: Invoice[];
}

export function InventoryReports({ invoices }: InventoryReportsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() - 30))
  );
  const [toDate, setToDate] = useState<Date | undefined>(new Date());

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

  const handleExportCsv = () => {
    // Implementation for CSV export
    console.log("Export to CSV");
  };

  const handleExportPdf = () => {
    // Implementation for PDF export
    console.log("Export to PDF");
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
        <Tabs defaultValue="inventory" className="w-full">
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventoryReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchaseReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
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
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
