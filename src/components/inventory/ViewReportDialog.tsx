
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { InventoryReport, PurchaseReport } from "@/lib/types";

interface ViewReportDialogProps {
  report: InventoryReport | PurchaseReport;
  reportType: 'inventory' | 'purchases';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewReportDialog({ report, reportType, open, onOpenChange }: ViewReportDialogProps) {
  if (reportType === 'inventory') {
    const inventoryReport = report as InventoryReport;
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Produto em Estoque</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Código do Produto</p>
                <p>{inventoryReport.productCode}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nome do Produto</p>
                <p>{inventoryReport.productName}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Última Entrada</p>
                <p>{format(inventoryReport.lastEntryDate, 'dd/MM/yyyy')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Código do Fornecedor</p>
                <p>{inventoryReport.supplierCode}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nome do Fornecedor</p>
              <p>{inventoryReport.supplierName}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quantidade Atual</p>
                <p>{inventoryReport.currentQuantity}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Custo Unitário</p>
                <p>{new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(inventoryReport.unitCost)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Custo Total</p>
                <p>{new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(inventoryReport.totalCost)}</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  } else {
    const purchaseReport = report as PurchaseReport;
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Compra</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Código do Produto</p>
                <p>{purchaseReport.productCode}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Descrição</p>
                <p>{purchaseReport.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fornecedor</p>
                <p>{purchaseReport.supplier}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data de Entrada</p>
                <p>{format(purchaseReport.entryDate, 'dd/MM/yyyy')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quantidade</p>
                <p>{purchaseReport.quantity} {purchaseReport.unitOfMeasure}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor</p>
                <p>{new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(purchaseReport.value)}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Saldo Atual</p>
              <p>{purchaseReport.currentBalance} {purchaseReport.unitOfMeasure}</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
}
