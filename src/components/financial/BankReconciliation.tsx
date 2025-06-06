

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  FileText, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { 
  BankAccount, 
  BankTransaction, 
  FinancialSummary 
} from "@/lib/types";
import { ViewTransactionDialog } from "./ViewTransactionDialog";
import { DeleteTransactionDialog } from "./DeleteTransactionDialog";
import { NewTransactionModal } from "./NewTransactionModal";
import { ImportStatementModal } from "./ImportStatementModal";
import { GenerateReportModal } from "./GenerateReportModal";
import { toast } from "sonner";

interface BankReconciliationProps {
  bankAccounts: BankAccount[];
  setBankAccounts: (accounts: BankAccount[]) => void;
  transactions: BankTransaction[];
  setTransactions: (transactions: BankTransaction[]) => void;
  calculateFinancialSummary: () => FinancialSummary;
}

export function BankReconciliation({
  bankAccounts,
  setBankAccounts,
  transactions,
  setTransactions,
  calculateFinancialSummary,
}: BankReconciliationProps) {
  const [activeTab, setActiveTab] = useState("reconciliation");
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);
  const [isViewTransactionOpen, setIsViewTransactionOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const accountFilter = selectedAccount === "all" || transaction.bankAccountId === selectedAccount;
    const statusCondition = statusFilter === "all" || transaction.reconciliationStatus === statusFilter;

    const dateCondition = (!startDate || !transaction.date || new Date(transaction.date) >= startDate) &&
                          (!endDate || !transaction.date || new Date(transaction.date) <= endDate);

    const searchCondition = !searchQuery ||
                            transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            transaction.category?.toLowerCase().includes(searchQuery.toLowerCase());

    return accountFilter && statusCondition && dateCondition && searchCondition;
  });

  const handleTransactionReconciliationStatusChange = (transactionId: string, newStatus: "pendente" | "conciliado" | "pgt_parcial") => {
    const updatedTransactions = transactions.map(transaction =>
      transaction.id === transactionId ? { ...transaction, reconciliationStatus: newStatus } : transaction
    );
    setTransactions(updatedTransactions);
  };

  const handleViewTransaction = (transaction: BankTransaction) => {
    setSelectedTransaction(transaction);
    setIsViewTransactionOpen(true);
  };

  const handleDeleteTransaction = (transaction: BankTransaction) => {
    setSelectedTransaction(transaction);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTransaction = (password: string, reason: string) => {
    if (!selectedTransaction) return;

    const updatedTransactions = transactions.filter(transaction => transaction.id !== selectedTransaction.id);
    setTransactions(updatedTransactions);
    setIsDeleteDialogOpen(false);
    setSelectedTransaction(null);
    toast.success("Transação excluída com sucesso!");
  };

  const getAccountStats = (accountId: string) => {
    const accountTransactions = transactions.filter(t => t.bankAccountId === accountId);
    const reconciled = accountTransactions.filter(t => t.reconciliationStatus === 'conciliado').length;
    const pending = accountTransactions.filter(t => t.reconciliationStatus === 'pendente').length;
    return { reconciled, pending };
  };

  const handleNewTransaction = (newTransaction: BankTransaction) => {
    setTransactions([...transactions, newTransaction]);
  };

  return (
    <div className="space-y-6">
      {/* Account Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bankAccounts.map((account) => (
          <Card key={account.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {account.bankName} - {account.accountType}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Agência:</span>
                  <span>{account.agencyNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Conta:</span>
                  <span>{account.accountNumber}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Saldo Atual:</span>
                  <span className={account.currentBalance >= 0 ? "text-green-600" : "text-red-600"}>
                    {formatCurrency(account.currentBalance)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Conciliadas:</span>
                  <span>{getAccountStats(account.id).reconciled}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Pendentes:</span>
                  <span>{getAccountStats(account.id).pending}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="reconciliation">Conciliação</TabsTrigger>
          <TabsTrigger value="statements">Extratos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="reconciliation" className="space-y-4 mt-4">
          {/* Filters and Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Conciliação Bancária</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex-1 min-w-[200px]">
                  <Label>Conta Bancária</Label>
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma conta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as contas</SelectItem>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.bankName} - {account.accountNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pendente">Pendentes</SelectItem>
                      <SelectItem value="conciliado">Conciliadas</SelectItem>
                      <SelectItem value="divergente">Divergentes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <Label>Período - Início</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        {startDate ? format(startDate, 'dd/MM/yyyy') : "Data inicial"}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        locale={ptBR}
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <Label>Período - Fim</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        {endDate ? format(endDate, 'dd/MM/yyyy') : "Data final"}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        locale={ptBR}
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsNewTransactionOpen(true)}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Nova Transação
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Importar Extrato
                </Button>

                <Button 
                  onClick={() => setIsReportModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Gerar Relatório
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <div className="flex items-center justify-between py-4 bg-white dark:bg-gray-900">
              <div>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrar
                </Button>
              </div>
              <Label htmlFor="table-search" className="sr-only">Search</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
                <Input 
                  type="text" 
                  id="table-search" 
                  className="block pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  placeholder="Buscar transações" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{format(new Date(transaction.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>{formatCurrency(transaction.value)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.reconciliationStatus === "conciliado"
                            ? "default"
                            : transaction.reconciliationStatus === "pendente"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {transaction.reconciliationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewTransaction(transaction)}
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTransactionReconciliationStatusChange(transaction.id, transaction.reconciliationStatus === 'pendente' ? 'conciliado' : 'pendente')}
                          title={transaction.reconciliationStatus === 'pendente' ? 'Conciliar' : 'Desconciliar'}
                        >
                          {transaction.reconciliationStatus === 'pendente' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-yellow-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTransaction(transaction)}
                          title="Excluir"
                        >
                          <XCircle className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="statements" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Extratos Bancários</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Funcionalidade para visualizar e gerenciar extratos bancários.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Funcionalidade para gerar e exportar relatórios financeiros.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ViewTransactionDialog
        isOpen={isViewTransactionOpen}
        onClose={() => setIsViewTransactionOpen(false)}
        transaction={selectedTransaction}
      />

      <DeleteTransactionDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        transaction={selectedTransaction}
        onConfirm={confirmDeleteTransaction}
      />

      <NewTransactionModal
        isOpen={isNewTransactionOpen}
        onClose={() => setIsNewTransactionOpen(false)}
        bankAccounts={bankAccounts}
        onSave={handleNewTransaction}
      />

      <ImportStatementModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        bankAccounts={bankAccounts}
        setTransactions={setTransactions}
        transactions={transactions}
        setBankAccounts={setBankAccounts}
        calculateFinancialSummary={calculateFinancialSummary}
      />

      <GenerateReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        transactions={transactions}
      />
    </div>
  );
}

