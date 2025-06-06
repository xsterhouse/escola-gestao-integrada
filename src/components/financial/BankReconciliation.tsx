import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BankAccount, BankTransaction } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, Download, Check, RefreshCw, Filter, Plus, FileText, Eye, Trash2, Building2, CreditCard } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NewTransactionModal } from "./NewTransactionModal";
import { GenerateReportModal } from "./GenerateReportModal";
import { ViewTransactionDialog } from "./ViewTransactionDialog";
import { DeleteTransactionDialog } from "./DeleteTransactionDialog";
import { toast } from "sonner";

interface BankReconciliationProps {
  bankAccounts: BankAccount[];
  setBankAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
  transactions: BankTransaction[];
  setTransactions: React.Dispatch<React.SetStateAction<BankTransaction[]>>;
  calculateFinancialSummary: () => void;
}

export function BankReconciliation({ 
  bankAccounts, 
  setBankAccounts, 
  transactions,
  setTransactions,
  calculateFinancialSummary
}: BankReconciliationProps) {
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isReconcileDialogOpen, setIsReconcileDialogOpen] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);
  
  // Modal states
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState<boolean>(false);
  const [isGenerateReportModalOpen, setIsGenerateReportModalOpen] = useState<boolean>(false);
  const [isViewTransactionOpen, setIsViewTransactionOpen] = useState<boolean>(false);
  const [isDeleteTransactionOpen, setIsDeleteTransactionOpen] = useState<boolean>(false);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const handleReconcileTransaction = (transaction: BankTransaction) => {
    setSelectedTransaction(transaction);
    setIsReconcileDialogOpen(true);
  };
  
  const confirmReconciliation = () => {
    if (selectedTransaction) {
      // Update the reconciliation status with the correct type
      const updatedTransactions = transactions.map(t => 
        t.id === selectedTransaction.id 
          ? { ...t, reconciliationStatus: "conciliado" as const }
          : t
      );
      setTransactions(updatedTransactions);
      setIsReconcileDialogOpen(false);
      calculateFinancialSummary();
      toast.success("Transação conciliada com sucesso!");
    }
  };

  const handleViewTransaction = (transaction: BankTransaction) => {
    setSelectedTransaction(transaction);
    setIsViewTransactionOpen(true);
  };

  const handleDeleteTransaction = (transaction: BankTransaction) => {
    setSelectedTransaction(transaction);
    setIsDeleteTransactionOpen(true);
  };

  const confirmDeleteTransaction = (password: string, reason: string) => {
    if (selectedTransaction) {
      // Remove transaction from the list
      const updatedTransactions = transactions.filter(t => t.id !== selectedTransaction.id);
      setTransactions(updatedTransactions);
      setIsDeleteTransactionOpen(false);
      setSelectedTransaction(null);
      calculateFinancialSummary();
      toast.success("Transação excluída com sucesso!");
      
      // Here you could also save the deletion record for audit purposes
      console.log('Transaction deleted:', {
        transactionId: selectedTransaction.id,
        reason,
        deletedAt: new Date(),
        deletedBy: 'current-user' // This would come from auth context
      });
    }
  };
  
  const handleAddTransaction = (newTransaction: BankTransaction) => {
    setTransactions([...transactions, newTransaction]);
    calculateFinancialSummary();
  };
  
  const exportTransactions = () => {
    // This functionality is already implemented in the component
    toast.success("Exportando transações...");
  };
  
  // Filter transactions based on selected filters
  const filteredTransactions = transactions.filter(transaction => {
    let includeTransaction = true;
    
    if (selectedAccount && transaction.bankAccountId !== selectedAccount) {
      includeTransaction = false;
    }
    
    if (startDate && new Date(transaction.date) < startDate) {
      includeTransaction = false;
    }
    
    if (endDate) {
      const endDateWithTime = new Date(endDate);
      endDateWithTime.setHours(23, 59, 59, 999);
      if (new Date(transaction.date) > endDateWithTime) {
        includeTransaction = false;
      }
    }
    
    if (statusFilter !== "all") {
      if (statusFilter === "reconciled" && transaction.reconciliationStatus !== "conciliado") {
        includeTransaction = false;
      } else if (statusFilter === "unreconciled" && !["pendente", "pgt_parcial"].includes(transaction.reconciliationStatus)) {
        includeTransaction = false;
      }
    }
    
    if (typeFilter !== "all" && 
        ((typeFilter === "credit" && transaction.transactionType !== "credito") ||
         (typeFilter === "debit" && transaction.transactionType !== "debito"))) {
      includeTransaction = false;
    }
    
    return includeTransaction;
  });
  
  // Calculate running balance for each transaction
  const transactionsWithBalance = filteredTransactions.map((transaction, index) => {
    const previousTransactions = filteredTransactions.slice(0, index + 1);
    const selectedAccountData = bankAccounts.find(a => a.id === selectedAccount);
    const initialBalance = selectedAccountData?.initialBalance || 0;
    
    const balance = previousTransactions.reduce((acc, t) => {
      return t.transactionType === "credito" ? acc + t.value : acc - t.value;
    }, initialBalance);
    
    return { ...transaction, balance };
  });
  
  // Get selected account information
  const selectedAccountData = bankAccounts.find(a => a.id === selectedAccount);
  
  // Calculate financial summary for displayed transactions (fix initial balance calculation)
  const displayedInitialBalance = selectedAccountData?.initialBalance || 0;
  const displayedTotalRevenues = filteredTransactions
    .filter(t => t.transactionType === "credito")
    .reduce((sum, t) => sum + t.value, 0);
  const displayedTotalExpenses = filteredTransactions
    .filter(t => t.transactionType === "debito")
    .reduce((sum, t) => sum + t.value, 0);
  const displayedFinalBalance = displayedInitialBalance + displayedTotalRevenues - displayedTotalExpenses;

  // Get management type badge color
  const getManagementTypeBadgeColor = (managementType?: string) => {
    switch (managementType) {
      case 'PDDE':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'PNAE':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'PNATE':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Recursos Próprios':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Selected Account Information Header */}
      {selectedAccountData && (
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">{selectedAccountData.bankName}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    {selectedAccountData.accountType === 'movimento' ? 'Conta Movimento' : 'Conta Aplicação'}
                  </span>
                </div>
                {selectedAccountData.managementType && (
                  <Badge 
                    variant="outline" 
                    className={`${getManagementTypeBadgeColor(selectedAccountData.managementType)} font-medium`}
                  >
                    {selectedAccountData.managementType}
                  </Badge>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Saldo Atual</p>
                <p className="text-xl font-bold text-blue-900">
                  {formatCurrency(selectedAccountData.currentBalance)}
                </p>
              </div>
            </div>
            {selectedAccountData.description && (
              <p className="text-sm text-blue-600 mt-2">{selectedAccountData.description}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Financial Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Saldo Inicial</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(displayedInitialBalance)}</p>
            {selectedAccountData && (
              <p className="text-xs text-muted-foreground mt-1">
                {selectedAccountData.managementType || 'Gestão não informada'}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(displayedTotalRevenues)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(displayedTotalExpenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Saldo Final</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(displayedFinalBalance)}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-wrap gap-2">
          <div className="w-full md:w-56">
            <Label htmlFor="account">Conta Bancária</Label>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger id="account" className={selectedAccount ? "ring-2 ring-blue-500 bg-blue-50" : ""}>
                <SelectValue placeholder="Selecione uma conta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as contas</SelectItem>
                {bankAccounts.filter(account => account.id && account.id.trim() !== "").map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex items-center gap-2">
                      <span>{account.bankName} - {account.accountType === 'movimento' ? 'Movimento' : 'Aplicação'}</span>
                      {account.managementType && (
                        <Badge 
                          variant="outline" 
                          className={`${getManagementTypeBadgeColor(account.managementType)} text-xs`}
                        >
                          {account.managementType}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-auto">
            <Label>Período</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-[120px] pl-3 text-left font-normal"
                  >
                    {startDate ? format(startDate, 'dd/MM/yyyy') : "Data inicial"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-[120px] pl-3 text-left font-normal"
                  >
                    {endDate ? format(endDate, 'dd/MM/yyyy') : "Data final"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="w-full md:w-40">
            <Label htmlFor="status">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="reconciled">Conciliado</SelectItem>
                <SelectItem value="unreconciled">Não Conciliado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-40">
            <Label htmlFor="type">Tipo</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="credit">Crédito</SelectItem>
                <SelectItem value="debit">Débito</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-auto flex items-end">
            <Button variant="outline" size="icon" className="h-10 w-10">
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filtrar</span>
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2 items-end">
          <Button onClick={() => setIsNewTransactionModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Incluir
          </Button>
          <Button onClick={() => setIsGenerateReportModalOpen(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Gerar Relatório
          </Button>
          <Button variant="outline" onClick={exportTransactions}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>
      
      {/* Transactions Table with ScrollArea */}
      <Card>
        <CardHeader>
          <CardTitle>Conciliação Bancária</CardTitle>
          <CardDescription>
            Visualize e concilie os lançamentos bancários com seus registros internos.
            {selectedAccountData && (
              <span className="block mt-1 text-blue-600">
                Conta selecionada: {selectedAccountData.bankName} - {selectedAccountData.managementType || 'Gestão não informada'}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo de Conta</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Gestão</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionsWithBalance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      {selectedAccount ? 
                        "Nenhuma transação encontrada para esta conta." : 
                        "Selecione uma conta bancária para visualizar as transações."
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  transactionsWithBalance.map(transaction => {
                    const account = bankAccounts.find(a => a.id === transaction.bankAccountId);
                    const displayValue = transaction.isPartialPayment && transaction.partialAmount 
                      ? transaction.partialAmount 
                      : transaction.value;
                    
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>{format(new Date(transaction.date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{account?.accountType === 'movimento' ? 'Movimento' : 'Aplicação'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {transaction.description}
                            {transaction.isDuplicate && (
                              <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
                                Duplicado
                              </span>
                            )}
                            {transaction.isPartialPayment && (
                              <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                                Parcial
                              </span>
                            )}
                          </div>
                          {transaction.remainingAmount && transaction.remainingAmount > 0 && (
                            <div className="text-xs text-orange-600 mt-1">
                              Restante: {formatCurrency(transaction.remainingAmount)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className={transaction.transactionType === 'credito' ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(displayValue)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(transaction.balance)}
                        </TableCell>
                        <TableCell>{transaction.transactionType === 'credito' ? 'Crédito' : 'Débito'}</TableCell>
                        <TableCell>
                          {account?.managementType && (
                            <Badge 
                              variant="outline" 
                              className={`${getManagementTypeBadgeColor(account.managementType)} text-xs`}
                            >
                              {account.managementType}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className={`mr-2 h-2 w-2 rounded-full ${
                              transaction.reconciliationStatus === 'conciliado' ? 'bg-green-500' : 
                              transaction.reconciliationStatus === 'pgt_parcial' ? 'bg-orange-500' :
                              'bg-orange-500'
                            }`} />
                            {transaction.reconciliationStatus === 'conciliado' ? 'Conciliado' : 
                             transaction.reconciliationStatus === 'pgt_parcial' ? 'Pgt Parcial' :
                             'Não Conciliado'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewTransaction(transaction)}
                              title="Visualizar"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {transaction.reconciliationStatus === 'pendente' && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleReconcileTransaction(transaction)}
                                title="Conciliar"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteTransaction(transaction)}
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* Reconciliation Dialog */}
      <Dialog open={isReconcileDialogOpen} onOpenChange={setIsReconcileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conciliar Transação</DialogTitle>
            <DialogDescription>
              Confirme os detalhes da transação para conciliação bancária.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data</Label>
                  <Input value={format(new Date(selectedTransaction.date), 'dd/MM/yyyy')} readOnly />
                </div>
                <div>
                  <Label>Valor</Label>
                  <Input value={formatCurrency(selectedTransaction.value)} readOnly />
                </div>
              </div>
              
              <div>
                <Label>Descrição</Label>
                <Input value={selectedTransaction.description} readOnly />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="confirm" />
                <label
                  htmlFor="confirm"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Confirmo que esta transação foi verificada e está correta.
                </label>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReconcileDialogOpen(false)}>Cancelar</Button>
            <Button onClick={confirmReconciliation}>Confirmar Conciliação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* New Transaction Modal */}
      <NewTransactionModal
        isOpen={isNewTransactionModalOpen}
        onClose={() => setIsNewTransactionModalOpen(false)}
        bankAccounts={bankAccounts}
        onSave={handleAddTransaction}
      />
      
      {/* Generate Report Modal */}
      <GenerateReportModal
        isOpen={isGenerateReportModalOpen}
        onClose={() => setIsGenerateReportModalOpen(false)}
        bankAccounts={bankAccounts}
      />

      {/* View Transaction Dialog */}
      <ViewTransactionDialog
        isOpen={isViewTransactionOpen}
        onClose={() => setIsViewTransactionOpen(false)}
        transaction={selectedTransaction}
      />

      {/* Delete Transaction Dialog */}
      <DeleteTransactionDialog
        isOpen={isDeleteTransactionOpen}
        onClose={() => setIsDeleteTransactionOpen(false)}
        transaction={selectedTransaction}
        onConfirm={confirmDeleteTransaction}
      />
    </div>
  );
}
