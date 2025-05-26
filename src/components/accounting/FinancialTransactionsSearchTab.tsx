import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, FileText, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BankTransaction } from "@/lib/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function FinancialTransactionsSearchTab() {
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<BankTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Carregar transações do módulo financeiro
  useEffect(() => {
    const bankTransactions = JSON.parse(localStorage.getItem('bankTransactions') || '[]');
    setTransactions(bankTransactions);
    setFilteredTransactions(bankTransactions);
  }, []);

  // Filtrar transações
  useEffect(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(transaction => {
        const transactionDate = typeof transaction.date === 'string' 
          ? transaction.date 
          : format(new Date(transaction.date), 'yyyy-MM-dd');
        return transactionDate.includes(dateFilter);
      });
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(transaction => 
        transaction.transactionType === typeFilter
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(transaction => 
        transaction.reconciliationStatus === statusFilter
      );
    }

    setFilteredTransactions(filtered);
  }, [searchTerm, dateFilter, typeFilter, statusFilter, transactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleViewTransaction = (transaction: BankTransaction) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };

  const handleProcessTransaction = (transaction: BankTransaction) => {
    // Aqui você pode implementar a lógica específica para processar o lançamento
    console.log("Processando transação:", transaction);
  };

  const getTotalsByType = () => {
    const credits = filteredTransactions
      .filter(t => t.transactionType === 'credito')
      .reduce((sum, t) => sum + t.value, 0);
    
    const debits = filteredTransactions
      .filter(t => t.transactionType === 'debito')
      .reduce((sum, t) => sum + t.value, 0);

    return { credits, debits, balance: credits - debits };
  };

  const totals = getTotalsByType();

  return (
    <div className="space-y-6">
      {/* Resumo dos Lançamentos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Lançamentos</p>
                <p className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Créditos</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.credits)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Débitos</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.debits)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saldo</p>
                <p className={`text-2xl font-bold ${totals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totals.balance)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros de Busca */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Lançamentos Financeiros
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Pesquisar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
              <Label className="text-sm font-medium text-gray-700">Tipo</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="credito">Crédito</SelectItem>
                  <SelectItem value="debito">Débito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="conciliado">Conciliado</SelectItem>
                  <SelectItem value="nao_conciliado">Não Conciliado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Lançamentos */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Lançamentos Encontrados</CardTitle>
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
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Nenhum lançamento encontrado com os filtros aplicados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
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
                          onClick={() => handleViewTransaction(transaction)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleProcessTransaction(transaction)}
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

      {/* Modal de Detalhes da Transação */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Lançamento</DialogTitle>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Data</Label>
                  <p className="text-sm">{format(new Date(selectedTransaction.date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Valor</Label>
                  <p className={`text-sm font-semibold ${selectedTransaction.transactionType === 'credito' ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(selectedTransaction.value)}
                  </p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Descrição</Label>
                <p className="text-sm">{selectedTransaction.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Tipo</Label>
                  <Badge variant={selectedTransaction.transactionType === 'credito' ? 'default' : 'secondary'}>
                    {selectedTransaction.transactionType === 'credito' ? 'Crédito' : 'Débito'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge variant={selectedTransaction.reconciliationStatus === 'conciliado' ? 'default' : 'secondary'}>
                    {selectedTransaction.reconciliationStatus === 'conciliado' ? 'Conciliado' : 'Pendente'}
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
