
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
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { PaymentAccount, BankAccount } from "@/lib/types";

interface PaymentRegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  account: PaymentAccount | null;
  bankAccounts: BankAccount[];
  onConfirm: (paymentData: { bankAccountId: string }) => void;
  isEditMode?: boolean;
  onEdit?: (updatedAccount: PaymentAccount) => void;
}

export function PaymentRegistrationDialog({
  isOpen,
  onClose,
  account,
  bankAccounts,
  onConfirm,
  isEditMode = false,
  onEdit,
}: PaymentRegistrationDialogProps) {
  const [selectedBankAccount, setSelectedBankAccount] = useState("");
  const [editFormData, setEditFormData] = useState({
    description: account?.description || "",
    supplier: account?.supplier || "",
    value: account?.value || 0,
    dueDate: account?.dueDate ? format(new Date(account.dueDate), 'yyyy-MM-dd') : "",
    expenseType: account?.expenseType || "",
    resourceCategory: account?.resourceCategory || "",
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleConfirm = () => {
    if (isEditMode && onEdit && account) {
      const updatedAccount: PaymentAccount = {
        ...account,
        ...editFormData,
        dueDate: new Date(editFormData.dueDate),
        updatedAt: new Date(),
      };
      onEdit(updatedAccount);
    } else {
      if (!selectedBankAccount) {
        return;
      }
      onConfirm({ bankAccountId: selectedBankAccount });
    }
    
    setSelectedBankAccount("");
    setEditFormData({
      description: "",
      supplier: "",
      value: 0,
      dueDate: "",
      expenseType: "",
      resourceCategory: "",
    });
  };

  const handleClose = () => {
    setSelectedBankAccount("");
    setEditFormData({
      description: account?.description || "",
      supplier: account?.supplier || "",
      value: account?.value || 0,
      dueDate: account?.dueDate ? format(new Date(account.dueDate), 'yyyy-MM-dd') : "",
      expenseType: account?.expenseType || "",
      resourceCategory: account?.resourceCategory || "",
    });
    onClose();
  };

  if (!account) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Conta a Pagar" : "Registrar Pagamento"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Altere os dados da conta a pagar conforme necessário."
              : "Confirme os detalhes e selecione a conta bancária para registrar o pagamento."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="description">Descrição</Label>
              {isEditMode ? (
                <Input
                  id="description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              ) : (
                <Input value={account.description} readOnly />
              )}
            </div>
            <div>
              <Label htmlFor="supplier">Fornecedor</Label>
              {isEditMode ? (
                <Input
                  id="supplier"
                  value={editFormData.supplier}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, supplier: e.target.value }))}
                />
              ) : (
                <Input value={account.supplier} readOnly />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Vencimento</Label>
              {isEditMode ? (
                <Input
                  id="dueDate"
                  type="date"
                  value={editFormData.dueDate}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              ) : (
                <Input value={format(new Date(account.dueDate), 'dd/MM/yyyy')} readOnly />
              )}
            </div>
            <div>
              <Label htmlFor="value">Valor</Label>
              {isEditMode ? (
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  value={editFormData.value}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                />
              ) : (
                <Input value={formatCurrency(account.value)} readOnly />
              )}
            </div>
          </div>

          {isEditMode && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expenseType">Tipo de Despesa</Label>
                <Input
                  id="expenseType"
                  value={editFormData.expenseType}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, expenseType: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="resourceCategory">Categoria de Recurso</Label>
                <Input
                  id="resourceCategory"
                  value={editFormData.resourceCategory}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, resourceCategory: e.target.value }))}
                />
              </div>
            </div>
          )}

          {!isEditMode && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data de Pagamento</Label>
                  <Input value={format(new Date(), 'dd/MM/yyyy')} readOnly />
                </div>
                <div>
                  <Label htmlFor="bankAccount">Conta Bancária *</Label>
                  <Select value={selectedBankAccount} onValueChange={setSelectedBankAccount}>
                    <SelectTrigger id="bankAccount">
                      <SelectValue placeholder="Selecione a conta bancária" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.filter(account => account.id && account.bankName).map(bankAccount => (
                        <SelectItem key={bankAccount.id} value={bankAccount.id}>
                          {bankAccount.bankName} - {bankAccount.accountType === 'movimento' ? 'Movimento' : 'Aplicação'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="attachment">Anexar Comprovante (opcional)</Label>
                <Input id="attachment" type="file" />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!isEditMode && !selectedBankAccount}
          >
            {isEditMode ? "Salvar Alterações" : "Confirmar Pagamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
