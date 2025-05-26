
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, FileDown, Eye } from "lucide-react";
import { format } from "date-fns";
import { DeletionHistory } from "@/lib/types";
import { ViewDeletionDialog } from "./ViewDeletionDialog";
import { useToast } from "@/hooks/use-toast";

interface InventoryHistoryProps {
  deletionHistory: DeletionHistory[];
}

export function InventoryHistory({ deletionHistory }: InventoryHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeletion, setSelectedDeletion] = useState<DeletionHistory | null>(null);
  const { toast } = useToast();
  
  const filteredHistory = deletionHistory.filter(
    (history) =>
      history.danfeNumber.includes(searchTerm) ||
      history.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      history.deletedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      history.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCsv = () => {
    const csvHeaders = [
      'Data Exclusão',
      'DANFE',
      'Fornecedor',
      'Valor',
      'Excluído por',
      'Motivo'
    ];
    
    const csvData = filteredHistory.map(history => [
      format(history.deletedAt, 'dd/MM/yyyy HH:mm'),
      history.danfeNumber,
      history.supplierName,
      history.totalValue.toFixed(2),
      history.deletedBy,
      history.reason
    ]);
    
    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historico-exclusoes-${format(new Date(), 'dd-MM-yyyy')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Exportação concluída",
      description: "Arquivo CSV gerado com sucesso.",
    });
  };

  const handleExportPdf = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A exportação em PDF será implementada em breve.",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Histórico de Exclusões</CardTitle>
        <div className="flex items-center gap-2">
          <Button onClick={handleExportCsv} variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-1" />
            CSV
          </Button>
          <Button onClick={handleExportPdf} variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-1" />
            PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4">
          <Input
            placeholder="Buscar por DANFE, Fornecedor, Usuário ou Motivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Search className="ml-2 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data e Hora</TableHead>
                <TableHead>Número DANFE</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Excluído por</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Nenhum registro de exclusão encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredHistory.map((history) => (
                  <TableRow key={history.id}>
                    <TableCell>{format(history.deletedAt, 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell>{history.danfeNumber}</TableCell>
                    <TableCell>{history.supplierName}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(history.totalValue)}
                    </TableCell>
                    <TableCell>{history.deletedBy}</TableCell>
                    <TableCell className="max-w-xs truncate">{history.reason}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDeletion(history)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {selectedDeletion && (
        <ViewDeletionDialog
          deletion={selectedDeletion}
          open={!!selectedDeletion}
          onOpenChange={() => setSelectedDeletion(null)}
        />
      )}
    </Card>
  );
}
