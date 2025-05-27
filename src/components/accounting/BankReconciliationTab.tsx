
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, Filter, CheckCircle, AlertCircle, DollarSign, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface BankTransaction {
  id: string;
  date: string;
  description: string;
  value: number;
  type: 'debit' | 'credit';
  reconciled: boolean;
  accountingEntryId?: string;
  paymentRegistered?: boolean;
  isDuplicate?: boolean;
  registeredBy?: string;
  registeredAt?: string;
}

interface AccountingEntry {
  id: string;
  date: string;
  debitAccount: string;
  debitValue: number;
  debitDescription: string;
  creditAccount: string;
  creditValue: number;
  creditDescription: string;
  history: string;
  totalValue: number;
  reconciled?: boolean;
}

interface DeleteModalData {
  transaction: BankTransaction | null;
  isOpen: boolean;
}

interface ViewModalData {
  transaction: BankTransaction | null;
  isOpen: boolean;
}

export function BankReconciliationTab() {
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [accountingEntries, setAccountingEntries] = useState<AccountingEntry[]>([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showReconciled, setShowReconciled] = useState(false);
  const [deleteModal, setDeleteModal] = useState<DeleteModalData>({ transaction: null, isOpen: false });
  const [viewModal, setViewModal] = useState<ViewModalData>({ transaction: null, isOpen: false });
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  // Carregar dados do localStorage
  useEffect(() => {
    // Carregar lançamentos contábeis
    const entries = JSON.parse(localStorage.getItem('accountingEntries') || '[]');
    setAccountingEntries(entries);

    // Carregar transações bancárias (agora apenas do localStorage, sem dados mockados)
    const transactions = JSON.parse(localStorage.getItem('bankTransactions') || '[]');
    setBankTransactions(transactions);
  }, []);

  const handleReconciliation = (bankTransactionId: string, accountingEntryId: string) => {
    // Atualizar transação bancária
    setBankTransactions(prev => 
      prev.map(transaction => 
        transaction.id === bankTransactionId 
          ? { ...transaction, reconciled: true, accountingEntryId }
          : transaction
      )
    );

    // Atualizar lançamento contábil
    const updatedEntries = accountingEntries.map(entry =>
      entry.id === accountingEntryId
        ? { ...entry, reconciled: true }
        : entry
    );
    
    setAccountingEntries(updatedEntries);
    localStorage.setItem('accountingEntries', JSON.stringify(updatedEntries));

    toast({
      title: "Conciliação realizada",
      description: "A transação foi conciliada com sucesso.",
    });
  };

  const handleRegisterPayment = (transaction: BankTransaction) => {
    const existingPayments = bankTransactions.filter(t => 
      t.paymentRegistered && 
      t.description === transaction.description && 
      t.value === transaction.value &&
      t.id !== transaction.id
    );

    const isDuplicate = existingPayments.length > 0;
    
    if (isDuplicate) {
      toast({
        title: "Aviso: Pagamento Duplicado",
        description: "Este pagamento já foi registrado anteriormente. Registrando com alerta de duplicidade.",
        variant: "destructive"
      });
    }

    // Atualizar a transação bancária
    const updatedTransactions = bankTransactions.map(t => 
      t.id === transaction.id 
        ? { 
            ...t, 
            paymentRegistered: true, 
            isDuplicate,
            registeredBy: user?.name || 'Sistema',
            registeredAt: new Date().toISOString()
          }
        : t
    );

    setBankTransactions(updatedTransactions);
    localStorage.setItem('bankTransactions', JSON.stringify(updatedTransactions));

    // Registrar na tabela de contas a pagar
    const payableAccounts = JSON.parse(localStorage.getItem('paymentAccounts') || '[]');
    const newPayment = {
      id: `payment_${Date.now()}`,
      description: transaction.description,
      value: transaction.value,
      dueDate: transaction.date,
      status: 'pago',
      paymentDate: new Date().toISOString(),
      bankAccountId: selectedBankAccount,
      expenseType: 'Outros',
      resourceCategory: 'Recursos Próprios',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    payableAccounts.push(newPayment);
    localStorage.setItem('paymentAccounts', JSON.stringify(payableAccounts));

    toast({
      title: "Pagamento registrado",
      description: isDuplicate ? "Pagamento registrado com alerta de duplicidade." : "Pagamento registrado com sucesso.",
    });
  };

  const handleViewTransaction = (transaction: BankTransaction) => {
    setViewModal({ transaction, isOpen: true });
  };

  const handleDeleteTransaction = (transaction: BankTransaction) => {
    setDeleteModal({ transaction, isOpen: true });
    setDeletePassword("");
    setDeleteReason("");
  };

  const confirmDelete = () => {
    if (!deletePassword || !deleteReason) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, insira a senha e o motivo da exclusão.",
        variant: "destructive"
      });
      return;
    }

    // Aqui você pode validar a senha do usuário
    // Para este exemplo, vamos assumir que a validação foi bem-sucedida

    if (deleteModal.transaction) {
      const updatedTransactions = bankTransactions.filter(t => t.id !== deleteModal.transaction!.id);
      setBankTransactions(updatedTransactions);
      localStorage.setItem('bankTransactions', JSON.stringify(updatedTransactions));

      toast({
        title: "Transação excluída",
        description: `Transação excluída. Motivo: ${deleteReason}`,
      });

      setDeleteModal({ transaction: null, isOpen: false });
      setDeletePassword("");
      setDeleteReason("");
    }
  };

  const getUnreconciledEntries = () => {
    return accountingEntries.filter(entry => !entry.reconciled);
  };

  const getFilteredBankTransactions = () => {
    let filtered = bankTransactions;

    if (!showReconciled) {
      filtered = filtered.filter(transaction => !transaction.reconciled);
    }

    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(transaction => transaction.date === dateFilter);
    }

    return filtered;
  };

  const getReconciliationSummary = () => {
    const total = bankTransactions.length;
    const reconciled = bankTransactions.filter(t => t.reconciled).length;
    const pending = total - reconciled;
    
    return { total, reconciled, pending };
  };

  const summary = getReconciliationSummary();

  return (
    <div className="space-y-6">
      {/* Resumo da Conciliação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Transações</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conciliadas</p>
                <p className="text-2xl font-bold text-green-600">{summary.reconciled}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">{summary.pending}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
          <CardTitle className="text-xl text-gray-800">Conciliação Bancária</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Conta Bancária</Label>
              <Select value={selectedBankAccount} onValueChange={setSelectedBankAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conta_corrente">Conta Corrente - 12345-6</SelectItem>
                  <SelectItem value="conta_poupanca">Conta Poupança - 78910-1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Data</Label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Pesquisar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar transação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Filtros</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-reconciled"
                  checked={showReconciled}
                  onCheckedChange={(checked) => setShowReconciled(checked === true)}
                />
                <Label htmlFor="show-reconciled" className="text-sm">
                  Mostrar conciliadas
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transações Bancárias */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Transações Bancárias</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lançamento Vinculado</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getFilteredBankTransactions().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {bankTransactions.length === 0 
                      ? "Nenhuma transação bancária encontrada. As transações serão carregadas automaticamente quando disponíveis."
                      : "Nenhuma transação encontrada com os filtros aplicados."
                    }
                  </TableCell>
                </TableRow>
              ) : (
                getFilteredBankTransactions().map((transaction) => (
                  <TableRow 
                    key={transaction.id} 
                    className={transaction.isDuplicate ? "bg-red-50 animate-pulse" : ""}
                  >
                    <TableCell className="font-medium">
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={transaction.description}>
                        {transaction.description}
                        {transaction.isDuplicate && (
                          <Badge variant="destructive" className="ml-2 text-xs animate-pulse">
                            DUPLICADO
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === 'credit' ? 'default' : 'secondary'}>
                        {transaction.type === 'credit' ? 'Crédito' : 'Débito'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      <span className={transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.type === 'debit' ? '-' : '+'}
                        {transaction.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={transaction.reconciled ? 'default' : 'secondary'}>
                        {transaction.reconciled ? 'Conciliada' : 'Pendente'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {transaction.reconciled && transaction.accountingEntryId ? (
                        <span className="text-sm text-gray-600">#{transaction.accountingEntryId.slice(-6)}</span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewTransaction(transaction)}
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {!transaction.reconciled && getUnreconciledEntries().length > 0 && (
                          <Select onValueChange={(entryId) => handleReconciliation(transaction.id, entryId)}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Vincular" />
                            </SelectTrigger>
                            <SelectContent>
                              {getUnreconciledEntries().map((entry) => (
                                <SelectItem key={entry.id} value={entry.id}>
                                  {entry.history.substring(0, 20)}...
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {!transaction.paymentRegistered && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRegisterPayment(transaction)}
                          >
                            Registrar Pagamento
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction)}
                          className="text-red-600 hover:text-red-800"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Visualização */}
      <Dialog open={viewModal.isOpen} onOpenChange={(open) => setViewModal({ transaction: null, isOpen: open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Transação</DialogTitle>
          </DialogHeader>
          
          {viewModal.transaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Data</Label>
                  <p className="text-sm">{new Date(viewModal.transaction.date).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Valor</Label>
                  <p className={`text-sm font-semibold ${viewModal.transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {viewModal.transaction.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Descrição</Label>
                <p className="text-sm">{viewModal.transaction.description}</p>
              </div>
              
              {viewModal.transaction.registeredBy && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Registrado por</Label>
                  <p className="text-sm">{viewModal.transaction.registeredBy}</p>
                </div>
              )}

              {viewModal.transaction.registeredAt && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Data do Registro</Label>
                  <p className="text-sm">{new Date(viewModal.transaction.registeredAt).toLocaleDateString('pt-BR')}</p>
                </div>
              )}

              {viewModal.transaction.isDuplicate && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <Label className="text-sm font-medium text-red-800">⚠️ Pagamento em Duplicidade</Label>
                  <p className="text-sm text-red-600">Este pagamento foi identificado como duplicado.</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Exclusão */}
      <Dialog open={deleteModal.isOpen} onOpenChange={(open) => setDeleteModal({ transaction: null, isOpen: open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </p>

            <div className="space-y-2">
              <Label htmlFor="delete-password">Senha de Acesso</Label>
              <Input
                id="delete-password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Digite sua senha"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delete-reason">Motivo da Exclusão</Label>
              <Textarea
                id="delete-reason"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Descreva o motivo da exclusão"
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteModal({ transaction: null, isOpen: false })}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                Confirmar Exclusão
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
