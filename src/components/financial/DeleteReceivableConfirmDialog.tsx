
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
import { ReceivableAccount } from "@/lib/types";
import { format } from "date-fns";
import { toast } from "sonner";

interface DeleteReceivableConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  account: ReceivableAccount | null;
  onConfirm: (justification: string) => void;
}

export function DeleteReceivableConfirmDialog({
  isOpen,
  onClose,
  account,
  onConfirm,
}: DeleteReceivableConfirmDialogProps) {
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
      // Por enquanto, vamos usar uma senha simples para demonstração
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

  if (!account) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">
            Confirmar Exclusão
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Confirme os dados e forneça sua senha e justificativa.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-red-800">Conta a ser excluída:</p>
            <p className="text-sm text-red-700">{account.description}</p>
            <p className="text-sm text-red-700">Valor: {formatCurrency(account.value)}</p>
            <p className="text-sm text-red-700">Data: {format(new Date(account.expectedDate), 'dd/MM/yyyy')}</p>
            <p className="text-sm text-red-700">Status: {account.status === 'recebido' ? 'Recebido' : 'Pendente'}</p>
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
                placeholder="Explique o motivo da exclusão desta conta a receber..."
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
