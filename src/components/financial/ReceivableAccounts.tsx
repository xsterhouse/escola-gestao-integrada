import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ReceivableAccount, BankAccount } from "@/lib/types";
import { ReceivableAccountsTable } from "./ReceivableAccountsTable";
import { EditReceivableDialog } from "./EditReceivableDialog";
import { ReceiptRegistrationDialog } from "./ReceiptRegistrationDialog";

interface ReceivableAccountsProps {
  receivableAccounts: ReceivableAccount[];
  setReceivableAccounts: React.Dispatch<React.SetStateAction<ReceivableAccount[]>>;
  calculateFinancialSummary: () => void;
  bankAccounts: BankAccount[];
  onUpdateReceivable?: (receivable: ReceivableAccount, bankAccountId?: string, isPartial?: boolean, partialAmount?: number) => void;
}

export function ReceivableAccounts({
  receivableAccounts,
  setReceivableAccounts,
  calculateFinancialSummary,
  bankAccounts,
  onUpdateReceivable
}: ReceivableAccountsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<ReceivableAccount | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleEdit = (account: ReceivableAccount) => {
    setSelectedAccount(account);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta conta a receber?")) {
      const updatedAccounts = receivableAccounts.filter(account => account.id !== id);
      setReceivableAccounts(updatedAccounts);
      calculateFinancialSummary();
    }
  };

  const handleSave = (accountData: ReceivableAccount) => {
    const updatedAccount: ReceivableAccount = {
      ...accountData,
      updatedAt: new Date(),
    };

    const updatedAccounts = receivableAccounts.map(account =>
      account.id === updatedAccount.id ? updatedAccount : account
    );
    setReceivableAccounts(updatedAccounts);
    setIsEditDialogOpen(false);
    calculateFinancialSummary();
  };

  const handleRegisterReceipt = (account: ReceivableAccount) => {
    setSelectedAccount(account);
    setIsReceiptDialogOpen(true);
  };

  const handleConfirmReceipt = (receiptData: { 
    bankAccountId: string; 
    isPartial: boolean; 
    partialAmount?: number; 
    remainingBalance?: number;
  }) => {
    if (selectedAccount) {
      if (receiptData.isPartial && receiptData.partialAmount && receiptData.remainingBalance) {
        // Handle partial payment
        const updatedAccount: ReceivableAccount = {
          ...selectedAccount,
          status: 'recebido',
          receivedDate: new Date(),
          bankAccountId: receiptData.bankAccountId,
          value: receiptData.partialAmount,
          originalValue: selectedAccount.originalValue || selectedAccount.value,
          receivedAmount: receiptData.partialAmount,
          isPartialPayment: true,
          updatedAt: new Date(),
        };

        // Create new account for remaining balance
        const remainingAccount: ReceivableAccount = {
          ...selectedAccount,
          id: `${selectedAccount.id}_remaining_${Date.now()}`,
          value: receiptData.remainingBalance,
          status: 'pendente',
          receivedDate: undefined,
          bankAccountId: undefined,
          parentReceivableId: selectedAccount.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Use callback to update receivable and create bank transaction
        if (onUpdateReceivable) {
          onUpdateReceivable(updatedAccount, receiptData.bankAccountId, true, receiptData.partialAmount);
        } else {
          // Fallback to direct update
          const updatedAccounts = receivableAccounts.map(receivable =>
            receivable.id === selectedAccount.id ? updatedAccount : receivable
          );
          setReceivableAccounts([...updatedAccounts, remainingAccount]);
        }
      } else {
        // Handle full payment
        const updatedAccount: ReceivableAccount = {
          ...selectedAccount,
          status: 'recebido',
          receivedDate: new Date(),
          bankAccountId: receiptData.bankAccountId,
          updatedAt: new Date(),
        };

        // Use callback to update receivable and create bank transaction
        if (onUpdateReceivable) {
          onUpdateReceivable(updatedAccount, receiptData.bankAccountId);
        } else {
          // Fallback to direct update
          const updatedAccounts = receivableAccounts.map(receivable =>
            receivable.id === selectedAccount.id ? updatedAccount : receivable
          );
          setReceivableAccounts(updatedAccounts);
        }
      }

      setIsReceiptDialogOpen(false);
      calculateFinancialSummary();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Contas a Receber</span>
            <Button onClick={() => setIsEditDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReceivableAccountsTable
            accounts={receivableAccounts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRegisterReceipt={handleRegisterReceipt}
          />
        </CardContent>
      </Card>

      <EditReceivableDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedAccount(null);
        }}
        account={selectedAccount}
        onSave={handleSave}
      />

      <ReceiptRegistrationDialog
        isOpen={isReceiptDialogOpen}
        onClose={() => {
          setIsReceiptDialogOpen(false);
          setSelectedAccount(null);
        }}
        account={selectedAccount}
        bankAccounts={bankAccounts}
        onConfirm={handleConfirmReceipt}
      />
    </div>
  );
}
