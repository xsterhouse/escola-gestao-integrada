
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Search, FileText, Eye, Download, Upload, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface DanfeInvoice {
  id: string;
  danfeNumber: string;
  number: string;
  supplier: {
    name: string;
    cnpj: string;
    address: string;
  };
  issueDate: string;
  totalValue: number;
  status: 'valid' | 'invalid' | 'pending';
  xmlContent?: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

export function DanfeConsultModule() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<DanfeInvoice | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [invoices, setInvoices] = useState<DanfeInvoice[]>([
    {
      id: "1",
      danfeNumber: "35240312345678000190550010000001234567890123",
      number: "123456",
      supplier: {
        name: "Empresa ABC Ltda",
        cnpj: "12.345.678/0001-90",
        address: "Rua das Flores, 123 - Centro - São Paulo/SP"
      },
      issueDate: "2024-03-15",
      totalValue: 1500.00,
      status: 'valid',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?><nfeProc>...</nfeProc>`,
      items: [
        { id: "1", description: "Produto A", quantity: 10, unitPrice: 100, totalPrice: 1000 },
        { id: "2", description: "Produto B", quantity: 5, unitPrice: 100, totalPrice: 500 }
      ]
    }
  ]);
  const { toast } = useToast();

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Termo de busca obrigatório",
        description: "Digite o número da DANFE ou chave de acesso para consultar",
        variant: "destructive"
      });
      return;
    }

    const foundInvoice = invoices.find(inv => 
      inv.danfeNumber.includes(searchTerm) || inv.number.includes(searchTerm)
    );

    if (foundInvoice) {
      setSelectedInvoice(foundInvoice);
      setIsDialogOpen(true);
    } else {
      toast({
        title: "DANFE não encontrada",
        description: "Nenhuma nota fiscal foi encontrada com os dados informados",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'valid': return 'Válida';
      case 'invalid': return 'Inválida';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const downloadXML = (invoice: DanfeInvoice) => {
    if (!invoice.xmlContent) return;

    const blob = new Blob([invoice.xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `danfe_${invoice.danfeNumber}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(dateString));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Consulta DANFE
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Digite a chave de acesso ou número da NF-e"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Consultar
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Últimas Consultas</h3>
          <div className="space-y-2">
            {invoices.slice(0, 3).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(invoice.status)}
                  <div>
                    <p className="font-medium text-sm">NF-e {invoice.number}</p>
                    <p className="text-xs text-gray-500">{invoice.supplier.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {getStatusText(invoice.status)}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedInvoice(invoice);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>
                Detalhes da NF-e {selectedInvoice?.number}
              </DialogTitle>
            </DialogHeader>
            
            {selectedInvoice && (
              <ScrollArea className="max-h-[60vh] overflow-y-auto">
                <div className="space-y-6">
                  {/* Header Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Número</p>
                      <p className="font-medium">{selectedInvoice.number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Data de Emissão</p>
                      <p className="font-medium">{formatDate(selectedInvoice.issueDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Valor Total</p>
                      <p className="font-medium">{formatCurrency(selectedInvoice.totalValue)}</p>
                    </div>
                  </div>

                  {/* Supplier Info */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Dados do Emitente</h3>
                    <div className="p-4 border rounded-lg">
                      <p className="font-medium">{selectedInvoice.supplier.name}</p>
                      <p className="text-sm text-gray-600">CNPJ: {selectedInvoice.supplier.cnpj}</p>
                      <p className="text-sm text-gray-600">{selectedInvoice.supplier.address}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Produtos/Serviços</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Qtd</TableHead>
                            <TableHead>Valor Unit.</TableHead>
                            <TableHead>Valor Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedInvoice.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.description}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                              <TableCell>{formatCurrency(item.totalPrice)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => downloadXML(selectedInvoice)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar XML
                    </Button>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Importar para Estoque
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
