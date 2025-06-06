
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes da Movimentação</DialogTitle>
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
              <p>{format(movement.date, 'dd/MM/yyyy')}</p>
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
              }).format(movement.unitPrice)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Custo Total</p>
              <p>{new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(movement.totalCost)}</p>
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
          
          {movement.requestId && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID da Requisição</p>
              <p>{movement.requestId}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Criado em</p>
              <p>{format(movement.createdAt, 'dd/MM/yyyy HH:mm')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Atualizado em</p>
              <p>{format(movement.updatedAt, 'dd/MM/yyyy HH:mm')}</p>
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
