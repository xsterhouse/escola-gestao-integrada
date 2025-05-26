
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, FileDown, Check, X, Eye } from "lucide-react";
import { useState } from "react";
import { Invoice } from "@/lib/types";
import { format } from "date-fns";
import { ViewInvoiceDialog } from "./ViewInvoiceDialog";
import { ApproveInvoiceDialog } from "./ApproveInvoiceDialog";
import { useToast } from "@/hooks/use-toast";

interface InventoryTableProps {
  invoices: Invoice[];
  onUpdateInvoice: (invoice: Invoice) => void;
}

export function InventoryTable({ invoices, onUpdateInvoice }: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [approveInvoice, setApproveInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();
  
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

  const handleApproveInvoice = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      const updatedInvoice: Invoice = {
        ...invoice,
        status: 'aprovada',
        isActive: true,
        approvedBy: 'current-user', // Em uma implementação real, seria o ID do usuário logado
        approvedAt: new Date(),
        updatedAt: new Date()
      };
      
      onUpdateInvoice(updatedInvoice);
      
      toast({
        title: "Nota aprovada",
        description: "A nota fiscal foi aprovada e está agora ativa no sistema.",
      });
    }
    setApproveInvoice(null);
  };

  const handleRejectInvoice = (invoiceId: string, reason: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      const updatedInvoice: Invoice = {
        ...invoice,
        status: 'rejeitada',
        isActive: false,
        rejectionReason: reason,
        updatedAt: new Date()
      };
      
      onUpdateInvoice(updatedInvoice);
      
      toast({
        title: "Nota rejeitada",
        description: "A nota fiscal foi rejeitada.",
        variant: "destructive",
      });
    }
    setApproveInvoice(null);
  };

  const getStatusBadge = (invoice: Invoice) => {
    if (invoice.status === 'aprovada' && invoice.isActive) {
      return <Badge className="bg-green-100 text-green-800">Aprovada</Badge>;
    } else if (invoice.status === 'rejeitada') {
      return <Badge variant="destructive">Rejeitada</Badge>;
    } else {
      return <Badge variant="secondary">Pendente</Badge>;
    }
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
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Nenhuma nota fiscal encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
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
                    <TableCell>{getStatusBadge(invoice)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedInvoice(invoice)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        {invoice.status === 'pendente' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setApproveInvoice(invoice)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
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

      <ApproveInvoiceDialog
        invoice={approveInvoice}
        isOpen={!!approveInvoice}
        onClose={() => setApproveInvoice(null)}
        onApprove={handleApproveInvoice}
        onReject={handleRejectInvoice}
      />
    </Card>
  );
}
