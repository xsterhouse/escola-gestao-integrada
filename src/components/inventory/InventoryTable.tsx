
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
import { Search, FileDown } from "lucide-react";
import { useState } from "react";
import { Invoice } from "@/lib/types";
import { format } from "date-fns";
import { ViewInvoiceDialog } from "./ViewInvoiceDialog";

interface InventoryTableProps {
  invoices: Invoice[];
}

export function InventoryTable({ invoices }: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.danfeNumber.includes(searchTerm) ||
      invoice.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.supplier.cnpj.includes(searchTerm)
  );

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
        <CardTitle>Notas Fiscais Eletrônicas</CardTitle>
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
        <div className="flex items-center mb-4">
          <Input
            placeholder="Buscar por DANFE, Fornecedor ou CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Search className="ml-2 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Data Emissão</TableHead>
                <TableHead>Nº DANFE</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Itens</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Nenhuma nota fiscal encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow 
                    key={invoice.id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedInvoice(invoice)}
                  >
                    <TableCell>{invoice.supplier.name}</TableCell>
                    <TableCell>{invoice.supplier.cnpj}</TableCell>
                    <TableCell>{format(invoice.issueDate, 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{invoice.danfeNumber}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(invoice.totalValue)}
                    </TableCell>
                    <TableCell>{invoice.items.length} itens</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {selectedInvoice && (
        <ViewInvoiceDialog
          invoice={selectedInvoice}
          open={!!selectedInvoice}
          onOpenChange={() => setSelectedInvoice(null)}
        />
      )}
    </Card>
  );
}
