
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
import { Invoice } from "@/lib/types";
import { format } from "date-fns";

interface ViewInvoiceDialogProps {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewInvoiceDialog({ invoice, open, onOpenChange }: ViewInvoiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Nota Fiscal</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <h3 className="font-medium mb-2">Dados do Fornecedor</h3>
            <p><span className="font-medium">Nome:</span> {invoice.supplier.name}</p>
            <p><span className="font-medium">CNPJ:</span> {invoice.supplier.cnpj}</p>
            {invoice.supplier.address && (
              <p><span className="font-medium">Endereço:</span> {invoice.supplier.address}</p>
            )}
            {invoice.supplier.phone && (
              <p><span className="font-medium">Telefone:</span> {invoice.supplier.phone}</p>
            )}
          </div>
          <div>
            <h3 className="font-medium mb-2">Dados da Nota</h3>
            <p><span className="font-medium">Nº DANFE:</span> {invoice.danfeNumber}</p>
            <p>
              <span className="font-medium">Data de Emissão:</span>{" "}
              {format(invoice.issueDate, "dd/MM/yyyy")}
            </p>
            <p>
              <span className="font-medium">Valor Total:</span>{" "}
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(invoice.totalValue)}
            </p>
            {invoice.financialProgramming && (
              <p>
                <span className="font-medium">Programação Financeira:</span>{" "}
                {invoice.financialProgramming}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-medium mb-2">Itens da Nota</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Unid. Medida</TableHead>
                  <TableHead>Valor Unit.</TableHead>
                  <TableHead>Valor Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unitOfMeasure}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(item.unitPrice)}
                    </TableCell>
                    <TableCell>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
