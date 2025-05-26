
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
import { Search, FileDown, Check, X, Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import { Invoice } from "@/lib/types";
import { format } from "date-fns";
import { ViewInvoiceDialog } from "./ViewInvoiceDialog";
import { ApproveInvoiceDialog } from "./ApproveInvoiceDialog";
import { DeleteInvoiceDialog } from "./DeleteInvoiceDialog";
import { useToast } from "@/hooks/use-toast";

interface InventoryTableProps {
  invoices: Invoice[];
  onUpdateInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (invoiceId: string, reason: string, deletedBy: string) => void;
}

export function InventoryTable({ invoices, onUpdateInvoice, onDeleteInvoice }: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [approveInvoice, setApproveInvoice] = useState<Invoice | null>(null);
  const [deleteInvoice, setDeleteInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();
  
  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.danfeNumber.includes(searchTerm) ||
      invoice.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.supplier.cnpj.includes(searchTerm)
  );

  const handleExportCsv = () => {
    const csvHeaders = [
      'Dados do Fornecedor',
      'CNPJ',
      'Data Emissão NF',
      'Número da DANFE',
      'Valor Total DANFE',
      'Quantidade de Itens',
      'Status'
    ];
    
    const csvData = filteredInvoices.map(invoice => [
      invoice.supplier.name,
      invoice.supplier.cnpj,
      format(invoice.issueDate, 'dd/MM/yyyy'),
      invoice.danfeNumber,
      invoice.totalValue.toFixed(2),
      invoice.items.length.toString(),
      invoice.status === 'aprovada' && invoice.isActive ? 'Aprovada' : 
      invoice.status === 'rejeitada' ? 'Rejeitada' : 'Pendente'
    ]);
    
    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `notas-fiscais-${format(new Date(), 'dd-MM-yyyy')}.csv`);
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

  const handleApproveInvoice = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      const updatedInvoice: Invoice = {
        ...invoice,
        status: 'aprovada',
        isActive: true,
        approvedBy: 'current-user',
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

  // Calcular totais dos itens para cada nota fiscal
  const calculateItemsTotals = (invoice: Invoice) => {
    const totalQuantity = invoice.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalItemsValue = invoice.items.reduce((sum, item) => sum + item.totalPrice, 0);
    return { totalQuantity, totalItemsValue };
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
                <TableHead>Dados do Fornecedor</TableHead>
                <TableHead>Data Emissão NF</TableHead>
                <TableHead>Número da DANFE</TableHead>
                <TableHead>Valor Total DANFE</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Valor Unitário</TableHead>
                <TableHead>Valor Total Itens</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center">
                    Nenhuma nota fiscal encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => {
                  const { totalQuantity, totalItemsValue } = calculateItemsTotals(invoice);
                  const averageUnitPrice = totalQuantity > 0 ? totalItemsValue / totalQuantity : 0;
                  
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{invoice.supplier.name}</div>
                          <div className="text-sm text-gray-500">{invoice.supplier.cnpj}</div>
                        </div>
                      </TableCell>
                      <TableCell>{format(invoice.issueDate, 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{invoice.danfeNumber}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(invoice.totalValue)}
                      </TableCell>
                      <TableCell>{invoice.items.length} itens</TableCell>
                      <TableCell>{totalQuantity}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(averageUnitPrice)}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(totalItemsValue)}
                      </TableCell>
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteInvoice(invoice)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
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

      <DeleteInvoiceDialog
        invoice={deleteInvoice}
        isOpen={!!deleteInvoice}
        onClose={() => setDeleteInvoice(null)}
        onDelete={onDeleteInvoice}
      />
    </Card>
  );
}
