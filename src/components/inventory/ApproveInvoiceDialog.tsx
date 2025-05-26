
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Invoice } from "@/lib/types";
import { format } from "date-fns";
import { Check, X } from "lucide-react";

interface ApproveInvoiceDialogProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (invoiceId: string) => void;
  onReject: (invoiceId: string, reason: string) => void;
}

export function ApproveInvoiceDialog({
  invoice,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: ApproveInvoiceDialogProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!invoice) return null;

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      onApprove(invoice.id);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      return;
    }
    
    setIsProcessing(true);
    try {
      onReject(invoice.id, rejectionReason);
      onClose();
      setRejectionReason("");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aprovar Nota Fiscal</DialogTitle>
          <DialogDescription>
            Analise os dados da nota fiscal antes de aprovar ou rejeitar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status atual */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status atual:</span>
            <Badge variant={invoice.status === 'pendente' ? 'secondary' : 'default'}>
              {invoice.status === 'pendente' ? 'Pendente' : 
               invoice.status === 'aprovada' ? 'Aprovada' : 'Rejeitada'}
            </Badge>
          </div>

          {/* Dados da nota */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-sm font-medium text-gray-600">Fornecedor</Label>
              <p className="font-medium">{invoice.supplier.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">CNPJ</Label>
              <p>{invoice.supplier.cnpj}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Número DANFE</Label>
              <p className="font-medium">{invoice.danfeNumber}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Data de Emissão</Label>
              <p>{format(new Date(invoice.issueDate), 'dd/MM/yyyy')}</p>
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm font-medium text-gray-600">Valor Total</Label>
              <p className="text-lg font-bold text-green-600">{formatCurrency(invoice.totalValue)}</p>
            </div>
          </div>

          {/* Itens da nota */}
          <div>
            <Label className="text-sm font-medium text-gray-600 mb-2 block">
              Itens da Nota Fiscal ({invoice.items.length} itens)
            </Label>
            <div className="max-h-60 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left p-2 border-b">Descrição</th>
                    <th className="text-right p-2 border-b">Qtd</th>
                    <th className="text-right p-2 border-b">Unidade</th>
                    <th className="text-right p-2 border-b">Valor Unit.</th>
                    <th className="text-right p-2 border-b">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="p-2 border-b">{item.description}</td>
                      <td className="p-2 border-b text-right">{item.quantity}</td>
                      <td className="p-2 border-b text-right">{item.unitOfMeasure}</td>
                      <td className="p-2 border-b text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-2 border-b text-right font-medium">{formatCurrency(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Campo de rejeição */}
          <div>
            <Label htmlFor="rejection-reason">Motivo da Rejeição (opcional)</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Digite o motivo caso deseje rejeitar esta nota fiscal..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleReject}
            disabled={isProcessing || !rejectionReason.trim()}
          >
            <X className="w-4 h-4 mr-1" />
            Rejeitar
          </Button>
          <Button onClick={handleApprove} disabled={isProcessing}>
            <Check className="w-4 h-4 mr-1" />
            Aprovar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
