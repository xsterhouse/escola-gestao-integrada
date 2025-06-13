
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { InventoryMovement } from "@/lib/types";
import { AlertTriangle } from "lucide-react";

interface ViewMovementDialogProps {
  movement: InventoryMovement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewMovementDialog({ movement, open, onOpenChange }: ViewMovementDialogProps) {
  const formatDate = (date: Date | string) => {
    if (!date) return "—";
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd/MM/yyyy');
  };

  const formatDateTime = (date: Date | string) => {
    if (!date) return "—";
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd/MM/yyyy HH:mm');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes da Movimentação</DialogTitle>
          <DialogDescription>
            Visualize os detalhes completos desta movimentação de estoque.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tipo</p>
              <p className="font-medium">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  movement.type === 'entrada' ? 
                  'bg-green-100 text-green-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {movement.type === 'entrada' ? 'Entrada' : 'Saída'}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data</p>
              <p>{formatDate(movement.date)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Produto</p>
              <p>{movement.productDescription}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Quantidade</p>
              <p>{movement.quantity} {movement.unitOfMeasure}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Valor Unitário</p>
              <p>{new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(movement.unitPrice || 0)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Custo Total</p>
              <p>{new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(movement.totalCost || 0)}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Origem</p>
            <div className="flex items-center">
              {movement.source === 'manual' ? (
                <>
                  <span>Registro Manual</span>
                  <AlertTriangle className="h-4 w-4 ml-1 text-yellow-500" />
                </>
              ) : movement.source === 'invoice' ? (
                <span>Nota Fiscal</span>
              ) : (
                <span>Sistema</span>
              )}
            </div>
          </div>
          
          {movement.invoiceId && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID da Nota Fiscal</p>
              <p>{movement.invoiceId}</p>
            </div>
          )}
          
          {movement.reason && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Motivo</p>
              <p>{movement.reason}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Criado em</p>
              <p>{formatDateTime(movement.createdAt || new Date())}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Atualizado em</p>
              <p>{formatDateTime(movement.updatedAt || new Date())}</p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
