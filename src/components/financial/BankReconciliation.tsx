
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BankAccount, BankTransaction } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, FileUp, Download, Check, RefreshCw, Filter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { generatePDF, exportToCsv } from "@/lib/pdf-utils";

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
  const [isImportDialogOpen, setIsImportDialogOpen] = useState<boolean>(false);
  
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
      const updatedTransactions = transactions.map(t => 
        t.id === selectedTransaction.id 
          ? { ...t, reconciliationStatus: 'conciliado' }
          : t
      );
      setTransactions(updatedTransactions);
      setIsReconcileDialogOpen(false);
      calculateFinancialSummary();
    }
  };
  
  const handleImportStatement = () => {
    setIsImportDialogOpen(true);
  };
  
  const exportTransactions = () => {
    const exportData = transactions.map(t => ({
      data: format(new Date(t.date), 'dd/MM/yyyy'),
      banco: bankAccounts.find(a => a.id === t.bankAccountId)?.bankName || '',
      tipo_conta: bankAccounts.find(a => a.id === t.bankAccountId)?.accountType === 'movimento' ? 'Movimento' : 'Aplicação',
      descricao: t.description,
      valor: formatCurrency(t.value),
      tipo: t.transactionType === 'credito' ? 'Crédito' : 'Débito',
      situacao: t.reconciliationStatus === 'conciliado' ? 'Conciliado' : 'Não Conciliado'
    }));
    
    exportToCsv(exportData, 'conciliacao_bancaria', [
      { header: 'Data', key: 'data' },
      { header: 'Banco', key: 'banco' },
      { header: 'Tipo de Conta', key: 'tipo_conta' },
      { header: 'Descrição', key: 'descricao' },
      { header: 'Valor', key: 'valor' },
      { header: 'Tipo', key: 'tipo' },
      { header: 'Situação', key: 'situacao' }
    ]);
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
    
    if (statusFilter !== "all" && 
        ((statusFilter === "reconciled" && transaction.reconciliationStatus !== "conciliado") ||
         (statusFilter === "unreconciled" && transaction.reconciliationStatus !== "nao_conciliado"))) {
      includeTransaction = false;
    }
    
    if (typeFilter !== "all" && 
        ((typeFilter === "credit" && transaction.transactionType !== "credito") ||
         (typeFilter === "debit" && transaction.transactionType !== "debito"))) {
      includeTransaction = false;
    }
    
    return includeTransaction;
  });
  
  // Calculate financial summary for displayed transactions
  const displayedInitialBalance = bankAccounts.find(a => a.id === selectedAccount)?.initialBalance || 0;
  const displayedTotalRevenues = filteredTransactions
    .filter(t => t.transactionType === "credito")
    .reduce((sum, t) => sum + t.value, 0);
  const displayedTotalExpenses = filteredTransactions
    .filter(t => t.transactionType === "debito")
    .reduce((sum, t) => sum + t.value, 0);
  const displayedFinalBalance = displayedInitialBalance + displayedTotalRevenues - displayedTotalExpenses;
  
  return (
    <div className="space-y-6">
      {/* Financial Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Saldo Inicial</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(displayedInitialBalance)}</p>
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
              <SelectTrigger id="account">
                <SelectValue placeholder="Selecione uma conta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as contas</SelectItem>
                {bankAccounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.bankName} - {account.accountType === 'movimento' ? 'Movimento' : 'Aplicação'}
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
                  <Button variant="outline" size="sm" className="w-[120px] pl-3 text-left font-normal">
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
                  <Button variant="outline" size="sm" className="w-[120px] pl-3 text-left font-normal">
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
          <Button variant="outline" onClick={handleImportStatement}>
            <FileUp className="mr-2 h-4 w-4" />
            Importar Extrato
          </Button>
          <Button variant="outline" onClick={exportTransactions}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>
      
      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Conciliação Bancária</CardTitle>
          <CardDescription>
            Visualize e concilie os lançamentos bancários com seus registros internos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Banco</TableHead>
                <TableHead>Tipo de Conta</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map(transaction => {
                  const account = bankAccounts.find(a => a.id === transaction.bankAccountId);
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>{format(new Date(transaction.date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{account?.bankName}</TableCell>
                      <TableCell>{account?.accountType === 'movimento' ? 'Movimento' : 'Aplicação'}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className={transaction.transactionType === 'credito' ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(transaction.value)}
                      </TableCell>
                      <TableCell>{transaction.transactionType === 'credito' ? 'Crédito' : 'Débito'}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`mr-2 h-2 w-2 rounded-full ${
                            transaction.reconciliationStatus === 'conciliado' ? 'bg-green-500' : 'bg-orange-500'
                          }`} />
                          {transaction.reconciliationStatus === 'conciliado' ? 'Conciliado' : 'Não Conciliado'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {transaction.reconciliationStatus === 'nao_conciliado' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleReconcileTransaction(transaction)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Conciliar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
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
      
      {/* Import Statement Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Extrato Bancário</DialogTitle>
            <DialogDescription>
              Faça upload do extrato bancário para importar as transações automaticamente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="import-account">Selecione a Conta</Label>
              <Select>
                <SelectTrigger id="import-account">
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.bankName} - {account.accountType === 'movimento' ? 'Movimento' : 'Aplicação'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="file">Arquivo do Extrato</Label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10">
                <div className="text-center">
                  <FileUp className="mx-auto h-12 w-12 text-gray-300" />
                  <div className="mt-4 flex">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-primary"
                    >
                      <span>Fazer upload de arquivo</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                    </label>
                    <p className="pl-1">ou arraste e solte</p>
                  </div>
                  <p className="text-xs text-gray-500">OFX, CSV até 10MB</p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Cancelar</Button>
            <Button>Importar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
