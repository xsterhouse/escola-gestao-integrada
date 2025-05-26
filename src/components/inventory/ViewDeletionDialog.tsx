
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { DeletionHistory } from "@/lib/types";

interface ViewDeletionDialogProps {
  deletion: DeletionHistory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewDeletionDialog({ deletion, open, onOpenChange }: ViewDeletionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Exclusão</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Informações da Nota</h3>
              <div className="space-y-2">
                <p><strong>DANFE:</strong> {deletion.danfeNumber}</p>
                <p><strong>Fornecedor:</strong> {deletion.supplierName}</p>
                <p><strong>CNPJ:</strong> {deletion.supplierCnpj}</p>
                <p><strong>Data de Emissão:</strong> {format(deletion.issueDate, 'dd/MM/yyyy')}</p>
                <p><strong>Valor Total:</strong> {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(deletion.totalValue)}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Informações da Exclusão</h3>
              <div className="space-y-2">
                <p><strong>Excluído por:</strong> {deletion.deletedBy}</p>
                <p><strong>Data e Hora:</strong> {format(deletion.deletedAt, 'dd/MM/yyyy HH:mm:ss')}</p>
                <div>
                  <strong>Status:</strong> 
                  <Badge variant="destructive" className="ml-2">Excluído</Badge>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Motivo da Exclusão</h3>
            <div className="bg-gray-50 p-3 rounded border">
              <p className="text-sm">{deletion.reason}</p>
            </div>
          </div>

          {deletion.items && deletion.items.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Itens da Nota ({deletion.items.length})</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2 border-r">Descrição</th>
                      <th className="text-left p-2 border-r">Quantidade</th>
                      <th className="text-left p-2 border-r">Unidade</th>
                      <th className="text-left p-2 border-r">Valor Unit.</th>
                      <th className="text-left p-2">Valor Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletion.items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2 border-r">{item.description}</td>
                        <td className="p-2 border-r">{item.quantity}</td>
                        <td className="p-2 border-r">{item.unitOfMeasure}</td>
                        <td className="p-2 border-r">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(item.unitPrice)}
                        </td>
                        <td className="p-2">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(item.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
