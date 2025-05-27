
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Download, Filter } from "lucide-react";
import { format } from "date-fns";

interface HistoryRecord {
  id: string;
  transactionId: string;
  transactionDescription: string;
  transactionValue: number;
  transactionDate: string;
  deletedAt: Date;
  deletedBy: string;
  justification: string;
  type: 'exclusao' | 'edicao';
}

export default function TransactionHistory() {
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('transactionHistory') || '[]');
    setHistoryRecords(history);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getFilteredRecords = () => {
    let filtered = historyRecords;

    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.transactionDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.deletedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.justification.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(record => {
        const recordDate = format(new Date(record.deletedAt), 'yyyy-MM-dd');
        return recordDate === dateFilter;
      });
    }

    return filtered.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
  };

  const exportHistory = () => {
    const data = getFilteredRecords();
    const csvContent = [
      ['Data', 'Usuário', 'Ação', 'Descrição da Transação', 'Valor', 'Data da Transação', 'Justificativa'],
      ...data.map(record => [
        format(new Date(record.deletedAt), 'dd/MM/yyyy HH:mm'),
        record.deletedBy,
        record.type === 'exclusao' ? 'Exclusão' : 'Edição',
        record.transactionDescription,
        formatCurrency(record.transactionValue),
        format(new Date(record.transactionDate), 'dd/MM/yyyy'),
        record.justification
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historico_transacoes_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout requireAuth={true} requiredPermission="financial">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Histórico de Transações</h1>
            <p className="text-gray-600 mt-1">
              Registro de todas as exclusões e edições de transações bancárias
            </p>
          </div>
          <Button onClick={exportHistory} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar Histórico
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Pesquisar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Buscar por descrição, usuário ou justificativa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setDateFilter("");
                  }}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registro de Ações</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Transação</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data Original</TableHead>
                  <TableHead>Justificativa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredRecords().length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Nenhum registro encontrado no histórico.
                    </TableCell>
                  </TableRow>
                ) : (
                  getFilteredRecords().map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {format(new Date(record.deletedAt), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>{record.deletedBy}</TableCell>
                      <TableCell>
                        <Badge variant={record.type === 'exclusao' ? 'destructive' : 'default'}>
                          {record.type === 'exclusao' ? 'Exclusão' : 'Edição'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={record.transactionDescription}>
                          {record.transactionDescription}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(record.transactionValue)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(record.transactionDate), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={record.justification}>
                          {record.justification}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
