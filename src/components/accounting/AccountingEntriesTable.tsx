
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Search, FileText, Calendar, Filter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface AccountingEntry {
  id: string;
  date: string;
  debitAccount: string;
  debitDescription: string;
  debitValue: number;
  creditAccount: string;
  creditDescription: string;
  creditValue: number;
  history: string;
  totalValue: number;
  createdAt: string;
}

export function AccountingEntriesTable() {
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<AccountingEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [accountFilter, setAccountFilter] = useState<string>("all");

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [entries, searchTerm, startDate, endDate, accountFilter]);

  const loadEntries = () => {
    const storedEntries = JSON.parse(localStorage.getItem('accountingEntries') || '[]');
    setEntries(storedEntries);
  };

  const filterEntries = () => {
    let filtered = [...entries];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.history.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.debitDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.creditDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.debitAccount.includes(searchTerm) ||
        entry.creditAccount.includes(searchTerm)
      );
    }

    // Date filters
    if (startDate) {
      filtered = filtered.filter(entry => new Date(entry.date) >= startDate);
    }
    if (endDate) {
      const endDateWithTime = new Date(endDate);
      endDateWithTime.setHours(23, 59, 59, 999);
      filtered = filtered.filter(entry => new Date(entry.date) <= endDateWithTime);
    }

    // Account filter
    if (accountFilter !== "all") {
      filtered = filtered.filter(entry => 
        entry.debitAccount.includes(accountFilter) || 
        entry.creditAccount.includes(accountFilter)
      );
    }

    setFilteredEntries(filtered);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStartDate(undefined);
    setEndDate(undefined);
    setAccountFilter("all");
  };

  const exportToAccountingModule = (entry: AccountingEntry) => {
    // Here we would integrate with the accounting reconciliation module
    // For now, we'll show a success message
    console.log("Exporting entry to accounting reconciliation:", entry);
  };

  return (
    <Card className="shadow-lg border-0 rounded-xl">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b rounded-t-xl">
        <CardTitle className="text-xl text-gray-800 font-semibold flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          Lançamentos Executados
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="search"
                placeholder="Buscar por histórico, conta ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'dd/MM/yyyy') : "Data inicial"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
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
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'dd/MM/yyyy') : "Data final"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="w-full md:w-40">
            <Label htmlFor="account">Conta</Label>
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger id="account">
                <SelectValue placeholder="Filtrar por conta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as contas</SelectItem>
                <SelectItem value="1.01">Contas do Ativo Circulante</SelectItem>
                <SelectItem value="2.01">Contas do Passivo</SelectItem>
                <SelectItem value="3.01">Contas de Receita</SelectItem>
                <SelectItem value="4.01">Contas de Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button variant="outline" onClick={clearFilters}>
              <Filter className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{filteredEntries.length}</div>
              <p className="text-sm text-gray-600">Total de Lançamentos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(filteredEntries.reduce((sum, entry) => sum + entry.debitValue, 0))}
              </div>
              <p className="text-sm text-gray-600">Total Débitos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(filteredEntries.reduce((sum, entry) => sum + entry.creditValue, 0))}
              </div>
              <p className="text-sm text-gray-600">Total Créditos</p>
            </CardContent>
          </Card>
        </div>

        {/* Entries Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Data</TableHead>
                <TableHead>Conta Débito</TableHead>
                <TableHead>Descrição Débito</TableHead>
                <TableHead>Valor Débito</TableHead>
                <TableHead>Conta Crédito</TableHead>
                <TableHead>Descrição Crédito</TableHead>
                <TableHead>Valor Crédito</TableHead>
                <TableHead>Histórico</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center text-gray-500">
                      <FileText className="h-12 w-12 mb-2" />
                      <p>Nenhum lançamento encontrado.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-gray-50">
                    <TableCell>{format(new Date(entry.date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                    <TableCell className="font-mono">{entry.debitAccount}</TableCell>
                    <TableCell>{entry.debitDescription}</TableCell>
                    <TableCell className="text-red-600 font-medium">
                      {formatCurrency(entry.debitValue)}
                    </TableCell>
                    <TableCell className="font-mono">{entry.creditAccount}</TableCell>
                    <TableCell>{entry.creditDescription}</TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {formatCurrency(entry.creditValue)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={entry.history}>
                      {entry.history}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportToAccountingModule(entry)}
                        className="text-xs"
                      >
                        Exportar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
