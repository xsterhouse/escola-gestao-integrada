
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Trash2, FileText, DollarSign, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BankTransaction } from "@/lib/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  createdAt: string;
}

export function AccountingEntriesTab() {
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<AccountingEntry[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [filteredBankTransactions, setFilteredBankTransactions] = useState<BankTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMode, setSearchMode] = useState<"accounting" | "bank">("accounting");
  const [selectedEntry, setSelectedEntry] = useState<AccountingEntry | null>(null);
  const [selectedBankTransaction, setSelectedBankTransaction] = useState<BankTransaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isBankTransactionModalOpen, setIsBankTransactionModalOpen] = useState(false);
  const { toast } = useToast();

  // Carregar lançamentos do localStorage
  useEffect(() => {
    const loadEntries = () => {
      const storedEntries = JSON.parse(localStorage.getItem('accountingEntries') || '[]');
      setEntries(storedEntries);
      setFilteredEntries(storedEntries);
    };
    
    // Carregar transações bancárias do módulo financeiro
    const loadBankTransactions = () => {
      const storedBankTransactions = JSON.parse(localStorage.getItem('bankTransactions') || '[]');
      setBankTransactions(storedBankTransactions);
      setFilteredBankTransactions(storedBankTransactions);
    };
    
    loadEntries();
    loadBankTransactions();
    
    // Escutar mudanças no localStorage para atualizar em tempo real
    const handleStorageChange = () => {
      loadEntries();
      loadBankTransactions();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Filtrar lançamentos contábeis
  useEffect(() => {
    if (searchMode !== "accounting") return;
    
    if (!searchTerm) {
      setFilteredEntries(entries);
    } else {
      const filtered = entries.filter(entry =>
        entry.history.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.debitDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.creditDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.debitAccount.includes(searchTerm) ||
        entry.creditAccount.includes(searchTerm)
      );
      setFilteredEntries(filtered);
    }
  }, [searchTerm, entries, searchMode]);

  // Filtrar transações bancárias
  useEffect(() => {
    if (searchMode !== "bank") return;
    
    if (!searchTerm) {
      setFilteredBankTransactions(bankTransactions);
    } else {
      const filtered = bankTransactions.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBankTransactions(filtered);
    }
  }, [searchTerm, bankTransactions, searchMode]);

  const handleViewEntry = (entry: AccountingEntry) => {
    setSelectedEntry(entry);
    setIsDetailModalOpen(true);
  };

  const handleViewBankTransaction = (transaction: BankTransaction) => {
    setSelectedBankTransaction(transaction);
    setIsBankTransactionModalOpen(true);
  };

  const handleDeleteEntry = (entryId: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== entryId);
    setEntries(updatedEntries);
    localStorage.setItem('accountingEntries', JSON.stringify(updatedEntries));
    
    toast({
      title: "Lançamento excluído",
      description: "O lançamento foi removido com sucesso.",
    });
  };

  const handleProcessBankTransaction = (transaction: BankTransaction) => {
    // Aqui você pode implementar a lógica para processar o lançamento bancário
    toast({
      title: "Processando transação",
      description: `Transação ${transaction.description} selecionada para processamento.`,
    });
  };

  const exportEntries = () => {
    const csvContent = "Data,Conta Débito,Descrição Débito,Valor Débito,Conta Crédito,Descrição Crédito,Valor Crédito,Histórico,Valor Total\n" +
      filteredEntries.map(entry =>
        `${entry.date},${entry.debitAccount},"${entry.debitDescription}",${entry.debitValue},${entry.creditAccount},"${entry.creditDescription}",${entry.creditValue},"${entry.history}",${entry.totalValue}`
      ).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `lancamentos_contabeis_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getBankTransactionsSummary = () => {
    const total = filteredBankTransactions.length;
    const credits = filteredBankTransactions.filter(t => t.transactionType === 'credito').length;
    const debits = filteredBankTransactions.filter(t => t.transactionType === 'debito').length;
    const totalValue = filteredBankTransactions.reduce((sum, t) => 
      t.transactionType === 'credito' ? sum + t.value : sum - t.value, 0
    );
    
    return { total, credits, debits, totalValue };
  };

  const bankSummary = getBankTransactionsSummary();

  return (
    <div className="space-y-6">
      {/* Resumo quando em modo de busca bancária */}
      {searchMode === "bank" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Transações</p>
                  <p className="text-2xl font-bold text-gray-900">{bankSummary.total}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Créditos</p>
                  <p className="text-2xl font-bold text-green-600">{bankSummary.credits}</p>
                </div>
                <ArrowRight className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Débitos</p>
                  <p className="text-2xl font-bold text-red-600">{bankSummary.debits}</p>
                </div>
                <ArrowRight className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saldo Líquido</p>
                  <p className={`text-2xl font-bold ${bankSummary.totalValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(bankSummary.totalValue)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros e Ações */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
          <CardTitle className="text-xl text-gray-800">
            {searchMode === "accounting" ? "Lançamentos Contábeis" : "Lançamentos Bancários - Conciliação"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label className="text-sm font-medium text-gray-700">Modo de Pesquisa</Label>
              <Select value={searchMode} onValueChange={(value: "accounting" | "bank") => {
                setSearchMode(value);
                setSearchTerm("");
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accounting">Lançamentos Contábeis</SelectItem>
                  <SelectItem value="bank">Conciliação Bancária</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <Label className="text-sm font-medium text-gray-700">Pesquisar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={searchMode === "accounting" ? "Buscar por histórico, descrição ou conta..." : "Buscar transações bancárias..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {searchMode === "accounting" && (
              <Button
                onClick={exportEntries}
                variant="outline"
                className="h-10 px-6"
                disabled={filteredEntries.length === 0}
              >
                <FileText className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Lançamentos Contábeis */}
      {searchMode === "accounting" && (
        <Card className="shadow-lg border-0">
          <CardContent className="p-0">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Nenhum lançamento encontrado.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Conta Débito</TableHead>
                    <TableHead>Conta Crédito</TableHead>
                    <TableHead>Histórico</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {new Date(entry.date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-mono text-sm">{entry.debitAccount}</div>
                          <div className="text-xs text-gray-600">{entry.debitDescription}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-mono text-sm">{entry.creditAccount}</div>
                          <div className="text-xs text-gray-600">{entry.creditDescription}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={entry.history}>
                          {entry.history}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        <Badge variant="outline" className="bg-green-50 text-green-800">
                          {entry.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewEntry(entry)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="text-red-600 hover:text-red-800"
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
      )}

      {/* Tabela de Transações Bancárias */}
      {searchMode === "bank" && (
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">Transações da Conciliação Bancária</CardTitle>
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
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBankTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhuma transação bancária encontrada com os filtros aplicados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBankTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={transaction.description}>
                          {transaction.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.transactionType === 'credito' ? 'default' : 'secondary'}>
                          {transaction.transactionType === 'credito' ? 'Crédito' : 'Débito'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        <span className={transaction.transactionType === 'credito' ? 'text-green-600' : 'text-red-600'}>
                          {transaction.transactionType === 'debito' ? '-' : '+'}
                          {formatCurrency(transaction.value)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.reconciliationStatus === 'conciliado' ? 'default' : 'secondary'}>
                          {transaction.reconciliationStatus === 'conciliado' ? 'Conciliado' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewBankTransaction(transaction)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleProcessBankTransaction(transaction)}
                          >
                            Processar
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
      )}

      {/* Modal de Detalhes do Lançamento Contábil */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Detalhes do Lançamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Data</Label>
                  <p className="mt-1">{new Date(selectedEntry.date).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Valor Total</Label>
                  <p className="mt-1 font-semibold text-green-600">
                    {selectedEntry.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-3">Débito</h4>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-gray-600">Conta</Label>
                      <p className="font-mono">{selectedEntry.debitAccount}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Descrição</Label>
                      <p>{selectedEntry.debitDescription}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Valor</Label>
                      <p className="font-semibold">
                        {selectedEntry.debitValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-3">Crédito</h4>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-gray-600">Conta</Label>
                      <p className="font-mono">{selectedEntry.creditAccount}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Descrição</Label>
                      <p>{selectedEntry.creditDescription}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Valor</Label>
                      <p className="font-semibold">
                        {selectedEntry.creditValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Histórico</Label>
                <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedEntry.history}</p>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setSelectedEntry(null)}
                  variant="outline"
                >
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Detalhes da Transação Bancária */}
      <Dialog open={isBankTransactionModalOpen} onOpenChange={setIsBankTransactionModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Transação Bancária</DialogTitle>
          </DialogHeader>
          
          {selectedBankTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Data</Label>
                  <p className="text-sm">{format(new Date(selectedBankTransaction.date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Valor</Label>
                  <p className={`text-sm font-semibold ${selectedBankTransaction.transactionType === 'credito' ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(selectedBankTransaction.value)}
                  </p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Descrição</Label>
                <p className="text-sm">{selectedBankTransaction.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Tipo</Label>
                  <Badge variant={selectedBankTransaction.transactionType === 'credito' ? 'default' : 'secondary'}>
                    {selectedBankTransaction.transactionType === 'credito' ? 'Crédito' : 'Débito'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge variant={selectedBankTransaction.reconciliationStatus === 'conciliado' ? 'default' : 'secondary'}>
                    {selectedBankTransaction.reconciliationStatus === 'conciliado' ? 'Conciliado' : 'Pendente'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
