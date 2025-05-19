
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";
import { InventoryReport, PurchaseReport } from "@/lib/types";

interface DeleteReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (password: string, reason: string) => void;
  reportType: 'inventory' | 'purchases';
  report: InventoryReport | PurchaseReport;
}

export function DeleteReportDialog({
  open,
  onOpenChange,
  onDelete,
  reportType,
  report
}: DeleteReportDialogProps) {
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !reason) return;
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      onDelete(password, reason);
      setPassword("");
      setReason("");
      setIsSubmitting(false);
    }, 1000);
  };
  
  const getReportTitle = () => {
    if (reportType === 'inventory') {
      const inventoryReport = report as InventoryReport;
      return `${inventoryReport.productName} (${inventoryReport.productCode})`;
    } else {
      const purchaseReport = report as PurchaseReport;
      return `${purchaseReport.description} (${purchaseReport.productCode})`;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setPassword("");
        setReason("");
        setIsSubmitting(false);
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Excluir Relatório</DialogTitle>
          <DialogDescription className="flex items-center text-destructive">
            <AlertTriangle className="h-4 w-4 mr-1 text-destructive" />
            Esta ação não pode ser desfeita
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Você está prestes a excluir o relatório: <strong>{getReportTitle()}</strong>
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="required">Sua senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha para confirmar"
                required
              />
              <p className="text-xs text-muted-foreground">
                Digite sua senha para confirmar a exclusão
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason" className="required">Motivo da exclusão</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explique o motivo da exclusão"
                required
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Esta informação será registrada no histórico de exclusões
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!password || !reason || isSubmitting}
            >
              {isSubmitting ? "Excluindo..." : "Excluir Relatório"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
