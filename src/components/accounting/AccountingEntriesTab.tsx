
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Trash2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<AccountingEntry | null>(null);
  const { toast } = useToast();

  // Carregar lançamentos do localStorage
  useEffect(() => {
    const loadEntries = () => {
      const storedEntries = JSON.parse(localStorage.getItem('accountingEntries') || '[]');
      setEntries(storedEntries);
      setFilteredEntries(storedEntries);
    };
    
    loadEntries();
    
    // Escutar mudanças no localStorage para atualizar em tempo real
    const handleStorageChange = () => {
      loadEntries();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Filtrar lançamentos
  useEffect(() => {
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
  }, [searchTerm, entries]);

  const handleViewEntry = (entry: AccountingEntry) => {
    setSelectedEntry(entry);
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

  return (
    <div className="space-y-6">
      {/* Filtros e Ações */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
          <CardTitle className="text-xl text-gray-800">Lançamentos Contábeis</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label className="text-sm font-medium text-gray-700">Pesquisar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por histórico, descrição ou conta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              onClick={exportEntries}
              variant="outline"
              className="h-10 px-6"
              disabled={filteredEntries.length === 0}
            >
              <FileText className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Lançamentos */}
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

      {/* Modal de Detalhes do Lançamento */}
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
    </div>
  );
}
