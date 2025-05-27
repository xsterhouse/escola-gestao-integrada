
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReceivableAccount } from "@/lib/types";
import { format } from "date-fns";

interface ViewReceivableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  account: ReceivableAccount | null;
}

export function ViewReceivableDialog({
  isOpen,
  onClose,
  account,
}: ViewReceivableDialogProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!account) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes da Conta a Receber</DialogTitle>
          <DialogDescription>
            Visualize as informações completas da receita.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Descrição</Label>
              <Input value={account.description} readOnly />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Origem</Label>
              <Input value={account.origin} readOnly />
            </div>
            <div>
              <Label>Tipo de Recurso</Label>
              <Input value={account.resourceType} readOnly />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data Prevista</Label>
              <Input value={format(new Date(account.expectedDate), 'dd/MM/yyyy')} readOnly />
            </div>
            <div>
              <Label>Valor</Label>
              <Input value={formatCurrency(account.value)} readOnly />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Input value={account.status === 'recebido' ? 'Recebido' : 'Pendente'} readOnly />
            </div>
            {account.receivedDate && (
              <div>
                <Label>Data de Recebimento</Label>
                <Input value={format(new Date(account.receivedDate), 'dd/MM/yyyy')} readOnly />
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data de Criação</Label>
              <Input value={format(new Date(account.createdAt), 'dd/MM/yyyy HH:mm')} readOnly />
            </div>
            <div>
              <Label>Última Atualização</Label>
              <Input value={format(new Date(account.updatedAt), 'dd/MM/yyyy HH:mm')} readOnly />
            </div>
          </div>
          
          {account.notes && (
            <div>
              <Label>Observações</Label>
              <Input value={account.notes} readOnly />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
