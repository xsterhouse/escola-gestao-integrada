
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  CheckCircle, 
  AlertCircle, 
  DollarSign, 
  Link,
  Unlink,
  Download,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AccountingEntry, BankTransaction, BankAccount } from "@/lib/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AdvancedBankReconciliationTab() {
  const [accountingEntries, setAccountingEntries] = useState<AccountingEntry[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState("");
  const [reconciliationPeriod, setReconciliationPeriod] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("automatic");
  const [isReconciling, setIsReconciling] = useState(false);
  const [selectedItems, setSelectedItems] = useState<{
    accountingEntry?: AccountingEntry;
    bankTransaction?: BankTransaction;
  }>({});
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Carregar apenas dados reais do localStorage
    const entries = JSON.parse(localStorage.getItem('accountingEntries') || '[]');
    const transactions = JSON.parse(localStorage.getItem('bankTransactions') || '[]');
    const accounts = JSON.parse(localStorage.getItem('bankAccounts') || '[]');
    
    setAccountingEntries(entries);
    setBankTransactions(transactions);
    setBankAccounts(accounts);
  };

  // Filter bank accounts to only include those with valid IDs
  const validBankAccounts = bankAccounts.filter(account => 
    account.id && 
    typeof account.id === 'string' && 
    account.id.trim() !== '' &&
    account.id.length > 0
  );

  const getUnreconciledEntries = () => {
    return accountingEntries.filter(entry => 
      !entry.reconciled && 
      (entry.debitAccount.startsWith('1.1.1') || entry.creditAccount.startsWith('1.1.1')) // Contas bancárias
    );
  };

  const getUnreconciledTransactions = () => {
    return bankTransactions.filter(transaction => 
      transaction.reconciliationStatus === 'pendente'
    );
  };

  const performAutomaticReconciliation = () => {
    setIsReconciling(true);
    
    const unreconciledEntries = getUnreconciledEntries();
    const unreconciledTransactions = getUnreconciledTransactions();
    let matchCount = 0;

    // Algoritmo de conciliação automática
    const updatedEntries = unreconciledEntries.map(entry => {
      const matchingTransaction = unreconciledTransactions.find(transaction => {
        const entryValue = entry.debitAccount.startsWith('1.1.1') ? entry.debitValue : entry.creditValue;
        const valueDifference = Math.abs(entryValue - transaction.value);
        const dateDifference = Math.abs(
          new Date(entry.date).getTime() - new Date(transaction.date).getTime()
        ) / (1000 * 60 * 60 * 24); // Diferença em dias

        return valueDifference < 0.01 && dateDifference <= 3; // Mesmo valor e até 3 dias de diferença
      });

      if (matchingTransaction) {
        // Marcar como reconciliado
        matchingTransaction.reconciliationStatus = 'conciliado';
        matchCount++;
        
        return {
          ...entry,
          reconciled: true,
          reconciledAt: new Date().toISOString(),
          reconciledBy: 'Sistema Automático'
        };
      }
      return entry;
    });

    // Update state with reconciled entries
    setAccountingEntries(prev => prev.map(entry => {
      const updated = updatedEntries.find(u => u.id === entry.id);
      return updated || entry;
    }));

    // Salvar alterações
    const allEntries = accountingEntries.map(entry => {
      const updated = updatedEntries.find(u => u.id === entry.id);
      return updated || entry;
    });
    
    localStorage.setItem('accountingEntries', JSON.stringify(allEntries));
    localStorage.setItem('bankTransactions', JSON.stringify(bankTransactions));

    setIsReconciling(false);
    loadData();

    toast({
      title: "Conciliação automática concluída",
      description: `${matchCount} itens foram conciliados automaticamente.`,
    });
  };

  const performManualReconciliation = () => {
    if (!selectedItems.accountingEntry || !selectedItems.bankTransaction) {
      toast({
        title: "Seleção incompleta",
        description: "Selecione um lançamento contábil e uma transação bancária para conciliar.",
        variant: "destructive"
      });
      return;
    }

    // Marcar como reconciliado
    const updatedEntries = accountingEntries.map(entry =>
      entry.id === selectedItems.accountingEntry!.id
        ? { ...entry, reconciled: true, reconciledAt: new Date().toISOString(), reconciledBy: 'Manual' }
        : entry
    );

    const updatedTransactions = bankTransactions.map(transaction =>
      transaction.id === selectedItems.bankTransaction!.id
        ? { ...transaction, reconciliationStatus: 'conciliado' as const }
        : transaction
    );

    setAccountingEntries(updatedEntries);
    setBankTransactions(updatedTransactions);

    localStorage.setItem('accountingEntries', JSON.stringify(updatedEntries));
    localStorage.setItem('bankTransactions', JSON.stringify(updatedTransactions));

    setSelectedItems({});

    toast({
      title: "Conciliação manual realizada",
      description: "Os itens foram conciliados com sucesso.",
    });
  };

  const removeReconciliation = (entryId: string, transactionId: string) => {
    const updatedEntries = accountingEntries.map(entry =>
      entry.id === entryId
        ? { ...entry, reconciled: false, reconciledAt: undefined, reconciledBy: undefined }
        : entry
    );

    const updatedTransactions = bankTransactions.map(transaction =>
      transaction.id === transactionId
        ? { ...transaction, reconciliationStatus: 'pendente' as const }
        : transaction
    );

    setAccountingEntries(updatedEntries);
    setBankTransactions(updatedTransactions);

    localStorage.setItem('accountingEntries', JSON.stringify(updatedEntries));
    localStorage.setItem('bankTransactions', JSON.stringify(updatedTransactions));

    toast({
      title: "Conciliação removida",
      description: "A conciliação foi desfeita com sucesso.",
    });
  };

  const generateReconciliationReport = () => {
    const reconciledEntries = accountingEntries.filter(entry => entry.reconciled);
    const report = {
      period: reconciliationPeriod,
      totalReconciled: reconciledEntries.length,
      totalPending: getUnreconciledEntries().length,
      reconciliationRate: accountingEntries.length > 0 
        ? (reconciledEntries.length / accountingEntries.length) * 100 
        : 0,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_conciliacao_${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Relatório gerado",
      description: "O relatório de conciliação foi baixado com sucesso.",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getReconciliationSummary = () => {
    const total = accountingEntries.length + bankTransactions.length;
    const reconciled = accountingEntries.filter(e => e.reconciled).length;
    const pending = getUnreconciledEntries().length + getUnreconciledTransactions().length;
    
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
                <p className="text-sm font-medium text-gray-600">Total de Itens</p>
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
                <p className="text-sm font-medium text-gray-600">Conciliados</p>
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

      {/* Controles e Filtros */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
          <CardTitle className="text-xl text-gray-800">Conciliação Bancária Avançada</CardTitle>
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
                  {validBankAccounts.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Nenhuma conta bancária cadastrada
                    </div>
                  ) : (
                    validBankAccounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.bankName} - {account.accountType === 'movimento' ? 'Movimento' : 'Aplicação'}
                        {account.managementType && ` (${account.managementType})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Data Inicial</Label>
              <Input
                type="date"
                value={reconciliationPeriod.startDate}
                onChange={(e) => setReconciliationPeriod(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Data Final</Label>
              <Input
                type="date"
                value={reconciliationPeriod.endDate}
                onChange={(e) => setReconciliationPeriod(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Pesquisar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={performAutomaticReconciliation}
              disabled={isReconciling || getUnreconciledEntries().length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isReconciling ? 'animate-spin' : ''}`} />
              Conciliação Automática
            </Button>

            <Button
              onClick={performManualReconciliation}
              variant="outline"
              disabled={!selectedItems.accountingEntry || !selectedItems.bankTransaction}
            >
              <Link className="mr-2 h-4 w-4" />
              Conciliar Selecionados
            </Button>

            <Button
              onClick={generateReconciliationReport}
              variant="outline"
              disabled={accountingEntries.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Gerar Relatório
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Abas de Conciliação */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="automatic">Conciliação Automática</TabsTrigger>
          <TabsTrigger value="manual">Conciliação Manual</TabsTrigger>
          <TabsTrigger value="reconciled">Itens Conciliados</TabsTrigger>
        </TabsList>

        <TabsContent value="automatic" className="mt-6">
          {accountingEntries.length === 0 && bankTransactions.length === 0 ? (
            <Card className="shadow-lg border-0">
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Nenhum dado disponível
                </h3>
                <p className="text-gray-600">
                  Não há lançamentos contábeis ou transações bancárias cadastradas no sistema.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lançamentos Contábeis Não Conciliados */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">
                    Lançamentos Contábeis Pendentes ({getUnreconciledEntries().length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Histórico</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getUnreconciledEntries().length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                              Nenhum lançamento pendente
                            </TableCell>
                          </TableRow>
                        ) : (
                          getUnreconciledEntries().map((entry) => (
                            <TableRow 
                              key={entry.id}
                              className={selectedItems.accountingEntry?.id === entry.id ? 'bg-blue-50' : 'cursor-pointer hover:bg-gray-50'}
                              onClick={() => setSelectedItems(prev => ({ ...prev, accountingEntry: entry }))}
                            >
                              <TableCell className="font-medium">
                                {format(new Date(entry.date), 'dd/MM/yyyy')}
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {entry.history}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {formatCurrency(entry.totalValue)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Transações Bancárias Não Conciliadas */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">
                    Transações Bancárias Pendentes ({getUnreconciledTransactions().length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getUnreconciledTransactions().length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                              Nenhuma transação pendente
                            </TableCell>
                          </TableRow>
                        ) : (
                          getUnreconciledTransactions().map((transaction) => (
                            <TableRow 
                              key={transaction.id}
                              className={selectedItems.bankTransaction?.id === transaction.id ? 'bg-green-50' : 'cursor-pointer hover:bg-gray-50'}
                              onClick={() => setSelectedItems(prev => ({ ...prev, bankTransaction: transaction }))}
                            >
                              <TableCell className="font-medium">
                                {format(new Date(transaction.date), 'dd/MM/yyyy')}
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {transaction.description}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                <span className={transaction.transactionType === 'credito' ? 'text-green-600' : 'text-red-600'}>
                                  {transaction.transactionType === 'debito' ? '-' : '+'}
                                  {formatCurrency(transaction.value)}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="manual" className="mt-6">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">Conciliação Manual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Lançamento Contábil Selecionado</Label>
                  {selectedItems.accountingEntry ? (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium">{selectedItems.accountingEntry.history}</p>
                      <p className="text-xs text-gray-600">
                        {format(new Date(selectedItems.accountingEntry.date), 'dd/MM/yyyy')} - 
                        {formatCurrency(selectedItems.accountingEntry.totalValue)}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-500">Nenhum lançamento selecionado</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Transação Bancária Selecionada</Label>
                  {selectedItems.bankTransaction ? (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium">{selectedItems.bankTransaction.description}</p>
                      <p className="text-xs text-gray-600">
                        {format(new Date(selectedItems.bankTransaction.date), 'dd/MM/yyyy')} - 
                        {formatCurrency(selectedItems.bankTransaction.value)}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-500">Nenhuma transação selecionada</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={performManualReconciliation}
                  disabled={!selectedItems.accountingEntry || !selectedItems.bankTransaction}
                  className="px-8"
                >
                  <Link className="mr-2 h-4 w-4" />
                  Conciliar Itens Selecionados
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconciled" className="mt-6">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">Itens Conciliados</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Lançamento Contábil</TableHead>
                    <TableHead>Transação Bancária</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Conciliado por</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountingEntries
                    .filter(entry => entry.reconciled)
                    .map((entry) => {
                      const matchingTransaction = bankTransactions.find(t => 
                        t.reconciliationStatus === 'conciliado' && 
                        Math.abs(t.value - entry.totalValue) < 0.01
                      );
                      
                      return (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">
                            {format(new Date(entry.date), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {entry.history}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {matchingTransaction?.description || 'N/A'}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(entry.totalValue)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {entry.reconciledBy || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => matchingTransaction && removeReconciliation(entry.id, matchingTransaction.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Unlink className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
