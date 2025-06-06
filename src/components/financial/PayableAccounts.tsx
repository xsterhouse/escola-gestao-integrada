
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PaymentAccount, BankAccount } from "@/lib/types";
import { PayableAccountsTable } from "./PayableAccountsTable";
import { EditPaymentDialog } from "./EditPaymentDialog";
import { PaymentRegistrationDialog } from "./PaymentRegistrationDialog";

interface PayableAccountsProps {
  paymentAccounts: PaymentAccount[];
  setPaymentAccounts: React.Dispatch<React.SetStateAction<PaymentAccount[]>>;
  bankAccounts: BankAccount[];
  calculateFinancialSummary: () => void;
  resourceCategories: string[];
  expenseTypes: string[];
  onUpdatePayment?: (payment: PaymentAccount, bankAccountId?: string) => void;
}

export function PayableAccounts({
  paymentAccounts,
  setPaymentAccounts,
  bankAccounts,
  calculateFinancialSummary,
  resourceCategories,
  expenseTypes,
  onUpdatePayment
}: PayableAccountsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<PaymentAccount | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleEdit = (account: PaymentAccount) => {
    setSelectedAccount(account);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (account: PaymentAccount) => {
    if (window.confirm("Tem certeza que deseja excluir esta conta?")) {
      const updatedAccounts = paymentAccounts.filter(payment => payment.id !== account.id);
      setPaymentAccounts(updatedAccounts);
      calculateFinancialSummary();
    }
  };

  const handleSave = (accountData: PaymentAccount) => {
    const updatedAccount: PaymentAccount = {
      ...accountData,
      updatedAt: new Date(),
    };

    const updatedAccounts = paymentAccounts.map(payment =>
      payment.id === updatedAccount.id ? updatedAccount : payment
    );
    setPaymentAccounts(updatedAccounts);
    setIsEditDialogOpen(false);
    calculateFinancialSummary();
  };

  const handleRegisterPayment = (account: PaymentAccount) => {
    setSelectedAccount(account);
    setIsPaymentDialogOpen(true);
  };

  const handleConfirmPayment = (paymentData: { bankAccountId: string }) => {
    if (selectedAccount) {
      const updatedAccount: PaymentAccount = {
        ...selectedAccount,
        status: 'pago',
        paymentDate: new Date(),
        bankAccountId: paymentData.bankAccountId,
        updatedAt: new Date(),
      };

      // Use the callback to update payment and create bank transaction
      if (onUpdatePayment) {
        onUpdatePayment(updatedAccount, paymentData.bankAccountId);
      } else {
        // Fallback to direct update if callback is not provided
        const updatedAccounts = paymentAccounts.map(payment =>
          payment.id === selectedAccount.id ? updatedAccount : payment
        );
        setPaymentAccounts(updatedAccounts);
      }

      setIsPaymentDialogOpen(false);
      calculateFinancialSummary();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Contas a Pagar</span>
            <Button onClick={() => setIsEditDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PayableAccountsTable
            accounts={paymentAccounts}
            invoices={[]}
            onPaymentConfirm={handleRegisterPayment}
            onEditPayment={handleEdit}
            onDeletePayment={handleDelete}
            formatCurrency={formatCurrency}
          />
        </CardContent>
      </Card>

      <EditPaymentDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedAccount(null);
        }}
        payment={selectedAccount}
        onSave={handleSave}
        resourceCategories={resourceCategories}
        expenseTypes={expenseTypes}
      />

      <PaymentRegistrationDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => {
          setIsPaymentDialogOpen(false);
          setSelectedAccount(null);
        }}
        account={selectedAccount}
        bankAccounts={bankAccounts}
        onConfirm={handleConfirmPayment}
      />
    </div>
  );
}
