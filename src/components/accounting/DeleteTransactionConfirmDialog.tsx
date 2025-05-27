
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { toast } from "sonner";

interface BankTransaction {
  id: string;
  date: string;
  description: string;
  value: number;
  type: 'debit' | 'credit';
  reconciled: boolean;
  accountingEntryId?: string;
}

interface DeleteTransactionConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: BankTransaction | null;
  onConfirm: (justification: string) => void;
}

export function DeleteTransactionConfirmDialog({
  isOpen,
  onClose,
  transaction,
  onConfirm,
}: DeleteTransactionConfirmDialogProps) {
  const [password, setPassword] = useState("");
  const [justification, setJustification] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleConfirm = async () => {
    if (!password.trim()) {
      toast.error("Por favor, informe a senha para confirmar a exclusão.");
      return;
    }

    if (!justification.trim()) {
      toast.error("Por favor, informe a justificativa para a exclusão.");
      return;
    }

    setIsLoading(true);
    
    try {
      // Simular validação de senha (em um ambiente real, validaria com o backend)
      const currentUser = localStorage.getItem('currentUser');
      const userData = currentUser ? JSON.parse(currentUser) : null;
      
      if (!userData) {
        toast.error("Usuário não encontrado. Faça login novamente.");
        setIsLoading(false);
        return;
      }

      // Simular validação de senha - em produção isso seria feito no backend
      if (password !== "123456") { // Senha de exemplo
        toast.error("Senha incorreta. Tente novamente.");
        setIsLoading(false);
        return;
      }

      onConfirm(justification);
      setPassword("");
      setJustification("");
      onClose();
      
    } catch (error) {
      toast.error("Erro ao validar senha. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setJustification("");
    onClose();
  };

  if (!transaction) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">
            Confirmar Exclusão da Transação
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Confirme os dados e forneça sua senha e justificativa.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-red-800">Transação a ser excluída:</p>
            <p className="text-sm text-red-700">{transaction.description}</p>
            <p className="text-sm text-red-700">Valor: {formatCurrency(transaction.value)}</p>
            <p className="text-sm text-red-700">Data: {format(new Date(transaction.date), 'dd/MM/yyyy')}</p>
            <p className="text-sm text-red-700">Tipo: {transaction.type === 'credit' ? 'Crédito' : 'Débito'}</p>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="password">Senha do Usuário *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha para confirmar"
              />
            </div>
            
            <div>
              <Label htmlFor="justification">Justificativa *</Label>
              <Textarea
                id="justification"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Explique o motivo da exclusão desta transação..."
                rows={3}
              />
            </div>
          </div>
        </div>
        
        <AlertDialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm} 
            disabled={isLoading || !password.trim() || !justification.trim()}
          >
            {isLoading ? "Validando..." : "Confirmar Exclusão"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
