
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AccountingReportsTab() {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    accountType: "all",
    resourceType: "all"
  });
  
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportType, setReportType] = useState("balancete");
  const { toast } = useToast();

  const accountTypes = [
    { value: "all", label: "Todos os tipos" },
    { value: "ativo", label: "Ativo" },
    { value: "passivo", label: "Passivo" },
    { value: "receita", label: "Receita" },
    { value: "despesa", label: "Despesa" },
    { value: "patrimonial", label: "Patrimonial" }
  ];

  const resourceTypes = [
    { value: "all", label: "Todos os recursos" },
    { value: "fundeb", label: "FUNDEB" },
    { value: "pnate", label: "PNATE" },
    { value: "pnae", label: "PNAE" },
    { value: "proprios", label: "Recursos Próprios" },
    { value: "outros", label: "Outros" }
  ];

  const generateReport = () => {
    if (!filters.startDate || !filters.endDate) {
      toast({
        title: "Período obrigatório",
        description: "Selecione o período para gerar o relatório.",
        variant: "destructive",
      });
      return;
    }

    // Buscar dados dos lançamentos
    const entries = JSON.parse(localStorage.getItem('accountingEntries') || '[]');
    const accounts = JSON.parse(localStorage.getItem('accountingAccounts') || '[]');

    // Filtrar por período
    const filteredEntries = entries.filter((entry: any) => {
      const entryDate = new Date(entry.date);
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      return entryDate >= startDate && entryDate <= endDate;
    });

    if (reportType === "balancete") {
      // Gerar balancete
      const balanceData = accounts.map((account: any) => {
        const relatedEntries = filteredEntries.filter((entry: any) => 
          entry.debitDescription.includes(account.description) || 
          entry.creditDescription.includes(account.description)
        );

        const debitTotal = relatedEntries.reduce((sum: number, entry: any) => 
          entry.debitDescription.includes(account.description) ? sum + entry.debitValue : sum, 0
        );

        const creditTotal = relatedEntries.reduce((sum: number, entry: any) => 
          entry.creditDescription.includes(account.description) ? sum + entry.creditValue : sum, 0
        );

        return {
          code: account.code,
          description: account.description,
          type: account.type,
          debitTotal,
          creditTotal,
          balance: debitTotal - creditTotal
        };
      }).filter((item: any) => item.debitTotal > 0 || item.creditTotal > 0);

      setReportData(balanceData);
    } else {
      // Relatório de lançamentos
      setReportData(filteredEntries);
    }

    toast({
      title: "Relatório gerado",
      description: `${reportType === "balancete" ? "Balancete" : "Relatório de lançamentos"} gerado com sucesso.`,
    });
  };

  const exportReport = () => {
    const csvContent = reportType === "balancete" 
      ? "Código,Descrição,Tipo,Débito,Crédito,Saldo\n" + 
        reportData.map(item => `${item.code},${item.description},${item.type},${item.debitTotal},${item.creditTotal},${item.balance}`).join("\n")
      : "Data,Histórico,Débito,Crédito,Valor\n" +
        reportData.map(item => `${item.date},${item.history},${item.debitDescription},${item.creditDescription},${item.totalValue}`).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
          <CardTitle className="text-xl text-gray-800">Relatórios Contábeis</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balancete">Balancete por Período</SelectItem>
                  <SelectItem value="lancamentos">Lançamentos por Período</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Data Inicial</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Data Final</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Tipo de Conta</Label>
              <Select value={filters.accountType} onValueChange={(value) => setFilters(prev => ({ ...prev, accountType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Tipo de Recurso</Label>
              <Select value={filters.resourceType} onValueChange={(value) => setFilters(prev => ({ ...prev, resourceType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por recurso" />
                </SelectTrigger>
                <SelectContent>
                  {resourceTypes.map(resource => (
                    <SelectItem key={resource.value} value={resource.value}>
                      {resource.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={generateReport}
              className="h-10 px-6 text-white font-semibold"
              style={{ backgroundColor: '#041c43' }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Gerar Relatório
            </Button>
            
            {reportData.length > 0 && (
              <Button
                onClick={exportReport}
                variant="outline"
                className="h-10 px-6"
              >
                <FileText className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {reportData.length > 0 && (
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">
              {reportType === "balancete" ? "Balancete por Período" : "Lançamentos por Período"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {reportType === "balancete" ? (
                    <>
                      <TableHead>Código</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Débito</TableHead>
                      <TableHead className="text-right">Crédito</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead>Data</TableHead>
                      <TableHead>Histórico</TableHead>
                      <TableHead>Débito</TableHead>
                      <TableHead>Crédito</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map((item, index) => (
                  <TableRow key={index}>
                    {reportType === "balancete" ? (
                      <>
                        <TableCell className="font-mono">{item.code}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="capitalize">{item.type}</TableCell>
                        <TableCell className="text-right">
                          {item.debitTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.creditTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {item.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{new Date(item.date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{item.history}</TableCell>
                        <TableCell>{item.debitDescription}</TableCell>
                        <TableCell>{item.creditDescription}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {item.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
