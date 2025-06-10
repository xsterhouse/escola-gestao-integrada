
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AccountForm } from "./AccountForm";
import { AccountList } from "./AccountList";

interface Account {
  id: string;
  code: string;
  description: string;
  type: 'ativo' | 'passivo' | 'patrimonio' | 'receita' | 'despesa';
  level: number;
  parent?: string;
  isActive: boolean;
  createdAt: Date;
}

export function AccountsTab() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = () => {
    const savedAccounts = JSON.parse(localStorage.getItem('accountingAccounts') || '[]');
    setAccounts(savedAccounts);
  };

  const handleAccountSave = (account: Account) => {
    let updatedAccounts;
    if (editingAccount) {
      updatedAccounts = accounts.map(acc => acc.id === editingAccount.id ? account : acc);
    } else {
      updatedAccounts = [...accounts, account];
    }

    setAccounts(updatedAccounts);
    localStorage.setItem('accountingAccounts', JSON.stringify(updatedAccounts));
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
  };

  const handleDelete = (accountId: string) => {
    const updatedAccounts = accounts.filter(acc => acc.id !== accountId);
    setAccounts(updatedAccounts);
    localStorage.setItem('accountingAccounts', JSON.stringify(updatedAccounts));
    
    toast({
      title: "Conta excluída",
      description: "A conta foi excluída com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      <AccountForm
        accounts={accounts}
        onAccountSave={handleAccountSave}
        editingAccount={editingAccount}
        setEditingAccount={setEditingAccount}
      />

      <AccountList
        accounts={accounts}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
