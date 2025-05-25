
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { Invoice } from "@/lib/types";
import { format } from "date-fns";
import { toast } from "sonner";

interface ImportInvoiceFromXmlDialogProps {
  isOpen: boolean;
  onClose: () => void;
  savedInvoices: Invoice[];
  onImport: (invoice: Invoice) => void;
}

export function ImportInvoiceFromXmlDialog({
  isOpen,
  onClose,
  savedInvoices,
  onImport,
}: ImportInvoiceFromXmlDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<string>("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredInvoices = savedInvoices.filter(invoice =>
    invoice.danfeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedInvoiceData = savedInvoices.find(inv => inv.id === selectedInvoice);

  const handleImport = () => {
    if (!selectedInvoiceData) {
      toast.error("Selecione uma nota fiscal para importar");
      return;
    }

    onImport(selectedInvoiceData);
    setSearchTerm("");
    setSelectedInvoice("");
    onClose();
  };

  const handleClose = () => {
    setSearchTerm("");
    setSelectedInvoice("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Importar Nota Fiscal do Estoque</DialogTitle>
          <DialogDescription>
            Selecione uma nota fiscal já importada no módulo de estoque para criar uma conta a pagar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="search">Buscar Nota Fiscal</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Digite o número da DANFE ou nome do fornecedor"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="invoice">Selecionar Nota Fiscal</Label>
            <Select value={selectedInvoice} onValueChange={setSelectedInvoice}>
              <SelectTrigger id="invoice">
                <SelectValue placeholder="Selecione uma nota fiscal" />
              </SelectTrigger>
              <SelectContent>
                {filteredInvoices.length === 0 ? (
                  <SelectItem value="" disabled>
                    {searchTerm ? "Nenhuma nota fiscal encontrada" : "Carregando notas fiscais..."}
                  </SelectItem>
                ) : (
                  filteredInvoices.map(invoice => (
                    <SelectItem key={invoice.id} value={invoice.id}>
                      DANFE: {invoice.danfeNumber} - {invoice.supplier.name} - {formatCurrency(invoice.totalValue)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedInvoiceData && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <h4 className="font-medium">Detalhes da Nota Fiscal</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>DANFE:</strong> {selectedInvoiceData.danfeNumber}
                </div>
                <div>
                  <strong>Fornecedor:</strong> {selectedInvoiceData.supplier.name}
                </div>
                <div>
                  <strong>Data de Emissão:</strong> {format(new Date(selectedInvoiceData.issueDate), 'dd/MM/yyyy')}
                </div>
                <div>
                  <strong>Valor Total:</strong> {formatCurrency(selectedInvoiceData.totalValue)}
                </div>
                <div className="col-span-2">
                  <strong>CNPJ:</strong> {selectedInvoiceData.supplier.cnpj}
                </div>
              </div>
              
              <div>
                <strong>Itens:</strong>
                <div className="mt-1 space-y-1">
                  {selectedInvoiceData.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="text-xs">
                      • {item.description} - Qtd: {item.quantity} {item.unitOfMeasure} - {formatCurrency(item.totalPrice)}
                    </div>
                  ))}
                  {selectedInvoiceData.items.length > 3 && (
                    <div className="text-xs text-gray-500">
                      ... e mais {selectedInvoiceData.items.length - 3} itens
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {savedInvoices.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma nota fiscal encontrada no estoque.</p>
              <p className="text-sm">Importe XMLs primeiro no módulo de estoque.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={!selectedInvoice}>
            Importar e Criar Conta a Pagar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
