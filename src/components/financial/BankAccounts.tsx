
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Building2, Trash2, Edit } from "lucide-react";
import { BankAccount } from "@/lib/types";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface BankAccountsProps {
  bankAccounts: BankAccount[];
  setBankAccounts: (accounts: BankAccount[]) => void;
}

export function BankAccounts({ bankAccounts, setBankAccounts }: BankAccountsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [formData, setFormData] = useState({
    bankName: "",
    agencyNumber: "",
    accountNumber: "",
    accountType: "movimento" as "movimento" | "aplicacao",
    description: "",
    managementType: "",
    initialBalance: ""
  });

  // Load bank accounts from localStorage on component mount
  useEffect(() => {
    const savedAccounts = localStorage.getItem('bankAccounts');
    if (savedAccounts) {
      const accounts = JSON.parse(savedAccounts);
      setBankAccounts(accounts);
    }
  }, [setBankAccounts]);

  // Save bank accounts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('bankAccounts', JSON.stringify(bankAccounts));
  }, [bankAccounts]);

  const resetForm = () => {
    setFormData({
      bankName: "",
      agencyNumber: "",
      accountNumber: "",
      accountType: "movimento",
      description: "",
      managementType: "",
      initialBalance: ""
    });
    setEditingAccount(null);
  };

  const handleSave = () => {
    if (!formData.bankName || !formData.agencyNumber || !formData.accountNumber || !formData.description || !formData.managementType) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const initialBalance = parseFloat(formData.initialBalance) || 0;

    if (editingAccount) {
      // Update existing account
      const updatedAccounts = bankAccounts.map(account =>
        account.id === editingAccount.id
          ? {
              ...account,
              bankName: formData.bankName,
              agencyNumber: formData.agencyNumber,
              accountNumber: formData.accountNumber,
              accountType: formData.accountType,
              description: formData.description,
              managementType: formData.managementType,
              initialBalance,
              currentBalance: initialBalance,
              updatedAt: new Date()
            }
          : account
      );
      setBankAccounts(updatedAccounts);
      toast.success("Conta bancária atualizada com sucesso!");
    } else {
      // Create new account
      const newAccount: BankAccount = {
        id: uuidv4(),
        schoolId: "current-school-id",
        bankName: formData.bankName,
        agencyNumber: formData.agencyNumber,
        accountNumber: formData.accountNumber,
        accountType: formData.accountType,
        description: formData.description,
        managementType: formData.managementType,
        initialBalance,
        currentBalance: initialBalance,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setBankAccounts([...bankAccounts, newAccount]);
      
      // Automatically create initial balance transaction
      if (initialBalance !== 0) {
        const initialTransaction = {
          id: uuidv4(),
          schoolId: "current-school-id",
          bankAccountId: newAccount.id,
          date: new Date(),
          description: "Saldo inicial da conta",
          value: Math.abs(initialBalance),
          transactionType: initialBalance > 0 ? 'credito' : 'debito' as 'credito' | 'debito',
          reconciliationStatus: 'conciliado' as 'conciliado' | 'nao_conciliado',
          category: "Saldo Inicial",
          resourceType: formData.managementType,
          source: 'manual' as 'manual' | 'payment' | 'receivable',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Save to bank transactions
        const existingTransactions = JSON.parse(localStorage.getItem('bankTransactions') || '[]');
        localStorage.setItem('bankTransactions', JSON.stringify([...existingTransactions, initialTransaction]));
      }

      toast.success("Conta bancária cadastrada com sucesso!");
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (account: BankAccount) => {
    setFormData({
      bankName: account.bankName,
      agencyNumber: account.agencyNumber || "",
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      description: account.description,
      managementType: account.managementType || "",
      initialBalance: account.initialBalance.toString()
    });
    setEditingAccount(account);
    setIsDialogOpen(true);
  };

  const handleDelete = (accountId: string) => {
    setBankAccounts(bankAccounts.filter(account => account.id !== accountId));
    toast.success("Conta bancária excluída com sucesso!");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Contas Bancárias
          </h2>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-[#012340] hover:bg-[#013a5c]">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? "Editar Conta Bancária" : "Nova Conta Bancária"}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Banco *</Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="Nome do banco"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agencyNumber">Número da Agência *</Label>
                  <Input
                    id="agencyNumber"
                    value={formData.agencyNumber}
                    onChange={(e) => setFormData({ ...formData, agencyNumber: e.target.value })}
                    placeholder="0000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Número da Conta *</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="00000-0"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accountType">Tipo da Conta</Label>
                <Select value={formData.accountType} onValueChange={(value: "movimento" | "aplicacao") => setFormData({ ...formData, accountType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="movimento">Conta Movimento</SelectItem>
                    <SelectItem value="aplicacao">Conta Aplicação</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="managementType">Tipo de Gestão *</Label>
                <Select value={formData.managementType} onValueChange={(value) => setFormData({ ...formData, managementType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de gestão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PNAE">PNAE</SelectItem>
                    <SelectItem value="PDDE">PDDE</SelectItem>
                    <SelectItem value="PNATE">PNATE</SelectItem>
                    <SelectItem value="Recursos Próprios">Recursos Próprios</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da conta"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="initialBalance">Saldo Inicial</Label>
                <Input
                  id="initialBalance"
                  type="number"
                  step="0.01"
                  value={formData.initialBalance}
                  onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                  placeholder="0,00"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} className="bg-[#012340] hover:bg-[#013a5c]">
                {editingAccount ? "Atualizar" : "Salvar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {bankAccounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma conta bancária cadastrada</p>
              <p className="text-sm">Clique em "Nova Conta" para adicionar uma conta</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banco</TableHead>
                  <TableHead>Agência</TableHead>
                  <TableHead>Número da Conta</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Gestão</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Saldo Atual</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bankAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.bankName}</TableCell>
                    <TableCell>{account.agencyNumber}</TableCell>
                    <TableCell>{account.accountNumber}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        account.accountType === 'movimento' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {account.accountType === 'movimento' ? 'Movimento' : 'Aplicação'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                        {account.managementType || 'Não informado'}
                      </span>
                    </TableCell>
                    <TableCell>{account.description}</TableCell>
                    <TableCell>{formatCurrency(account.currentBalance)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(account)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(account.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
