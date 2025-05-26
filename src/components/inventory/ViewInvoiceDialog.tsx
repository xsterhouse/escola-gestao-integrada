
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Invoice } from "@/lib/types";
import { format } from "date-fns";

interface ViewInvoiceDialogProps {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewInvoiceDialog({ invoice, open, onOpenChange }: ViewInvoiceDialogProps) {
  const getStatusBadge = () => {
    if (invoice.status === 'aprovada' && invoice.isActive) {
      return <Badge className="bg-green-100 text-green-800">Aprovada</Badge>;
    } else if (invoice.status === 'rejeitada') {
      return <Badge variant="destructive">Rejeitada</Badge>;
    } else {
      return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Detalhes da Nota Fiscal
            {getStatusBadge()}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-full max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Informações principais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Dados do Fornecedor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Nome:</span>
                    <p className="font-medium">{invoice.supplier.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">CNPJ:</span>
                    <p className="font-medium">{invoice.supplier.cnpj}</p>
                  </div>
                  {invoice.supplier.address && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Endereço:</span>
                      <p className="text-sm">{invoice.supplier.address}</p>
                    </div>
                  )}
                  {invoice.supplier.phone && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Telefone:</span>
                      <p className="text-sm">{invoice.supplier.phone}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Dados da Nota Fiscal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Nº DANFE:</span>
                    <p className="font-medium">{invoice.danfeNumber}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Data de Emissão:</span>
                    <p className="font-medium">{format(invoice.issueDate, "dd/MM/yyyy")}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Valor Total:</span>
                    <p className="text-xl font-bold text-green-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(invoice.totalValue)}
                    </p>
                  </div>
                  {invoice.financialProgramming && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Programação Financeira:</span>
                      <p className="text-sm">{invoice.financialProgramming}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Resumo dos itens */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  Resumo dos Itens
                  <Badge variant="outline" className="text-sm">
                    {invoice.items.length} {invoice.items.length === 1 ? 'item' : 'itens'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {invoice.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Quantidade Total</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(invoice.items.reduce((sum, item) => sum + item.totalPrice, 0))}
                    </p>
                    <p className="text-sm text-muted-foreground">Valor Total dos Itens</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(
                        invoice.items.reduce((sum, item) => sum + item.unitPrice, 0) / invoice.items.length
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">Preço Unitário Médio</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-teal-600">
                      {invoice.items.reduce((sum, item) => sum + item.quantity, 0) / invoice.items.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Quantidade Média</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabela de itens */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Itens Detalhados</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Descrição</TableHead>
                        <TableHead className="text-center font-semibold">Qtd.</TableHead>
                        <TableHead className="text-center font-semibold">Unidade</TableHead>
                        <TableHead className="text-right font-semibold">Valor Unit.</TableHead>
                        <TableHead className="text-right font-semibold">Valor Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoice.items.map((item, index) => (
                        <TableRow key={item.id} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                          <TableCell className="font-medium max-w-xs">
                            <div className="truncate" title={item.description}>
                              {item.description}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{item.quantity}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{item.unitOfMeasure}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(item.unitPrice)}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(item.totalPrice)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
